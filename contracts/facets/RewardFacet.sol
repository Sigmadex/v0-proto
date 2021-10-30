pragma solidity 0.8.9;

import { LibAppStorage, AppStorage, Modifiers, TokenRewardData, Reward } from '../libraries/LibAppStorage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../interfaces/ISdexReward.sol';
import './ToolShedFacet.sol';
import 'hardhat/console.sol';
contract RewardFacet is Modifiers {

  function addReward(address tokenAddr, address nftRewardAddr) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();

    for (uint i=0; i < s.validRewards[tokenAddr].length; i++) {
      if (s.validRewards[tokenAddr][i] == nftRewardAddr) {
        revert("nft already in list");
      }
    }
    s.validRewards[tokenAddr].push(nftRewardAddr);
  }

  function getValidRewardsForToken(address token) public returns (address[] memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.validRewards[token]; 
  }
  function mintReward(
    address to,
    address token,
    uint256 rewardAmount
  ) public  onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256 kindaRandomId = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), to, s.seed))) % s.validRewards[token].length;
    address nftAddr = s.validRewards[token][kindaRandomId];
    Reward memory reward = s.rewards[nftAddr];
    bytes memory fnCall = abi.encodeWithSelector(
      reward.rewardSelector,
      to, token, rewardAmount
    );
    (bool success,) = address(this).delegatecall(fnCall);
    require(success, "reward NFT failed");
  }

  function requestReward(address to, address token, uint256 timeAmount) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData storage tokenRewardData = s.tokenRewardData[token];
    uint256 proportio = timeAmount * s.unity / tokenRewardData.timeAmountGlobal;
    uint rewardAmount = proportio * tokenRewardData.penalties / s.unity;
    /* pointless
       IERC20(token).transfer(
       address(this),
       rewardAmount
       );
     */
    tokenRewardData.timeAmountGlobal -= timeAmount;
    tokenRewardData.rewarded += rewardAmount;
    tokenRewardData.penalties -= rewardAmount;
    mintReward(to, token, rewardAmount);
  }

  function requestSdexReward(
    address to,
    uint256 positionStartBlock,
    uint256 poolAllocPoint,
    uint256 totalAmountShares
  ) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData memory tokenRewardData = s.tokenRewardData[address(this)];
     
    uint256 sdexBalance = s.sdexBalances[address(this)] - tokenRewardData.penalties;

    // totalSdexEmission
    uint256 elapsedBlocks = block.number - positionStartBlock;
    // sdex emission
    uint256 multiplier = ToolShedFacet(address(this)).getMultiplier(positionStartBlock, block.number);
    uint256 totalSdexEmission = (multiplier * s.sdexPerBlock);
    uint256 sdexEmittedForPool = totalSdexEmission * poolAllocPoint / s.totalAllocPoint;
    uint256 proportion = totalAmountShares / sdexEmittedForPool;
    uint256 reward = proportion * sdexBalance / s.unity;
    mintReward(to, address(this), reward);
    //s.sdexRewarded += reward;

  }
 
}
