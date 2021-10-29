pragma solidity 0.8.9;

import { LibAppStorage, AppStorage, Modifiers, TokenRewardData } from '../libraries/LibAppStorage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../interfaces/ISdexReward.sol';
import './ToolShedFacet.sol';
contract RewardFacet is Modifiers {

  function addNFTReward(address tokenAddr, address nftRewardAddr) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    
    for (uint i=0; i < s.rewards[tokenAddr].length; i++) {
      if (s.rewards[tokenAddr][i] == nftRewardAddr) {
        revert("nft already in list");
      }
    }
    s.rewards[tokenAddr].push(nftRewardAddr);
  }
  function mintReward(
    address to,
    address token,
    uint256 rewardAmount
  ) public  onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
      uint256 kindaRandomId = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), to, s.seed))) % s.rewards[token].length;
      /*
      IERC20(_token).approve(
        s.rewards[token][kindaRandomId],
        type(uint256).max
      );
     */

      ISdexReward(s.rewards[token][kindaRandomId]).rewardNFT(to, token, rewardAmount);
  }

  function requestReward(address to, address token, uint256 timeAmount) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData storage tokenRewardData = s.tokenRewardData[token];
    uint256 diamondBalance = IERC20(token).balanceOf(address(this));
    uint256 proportio = timeAmount * s.unity / tokenRewardData.timeAmountGlobal;
    uint rewardAmount = proportio * diamondBalance / s.unity;
    IERC20(token).transfer(
      address(this),
      rewardAmount
    );
    tokenRewardData.timeAmountGlobal -= timeAmount;
    tokenRewardData.rewarded += rewardAmount;
    mintReward(to, token, rewardAmount);
  }

  function requestSdexReward(
    address to,
    uint256 positionStartBlock,
    uint256 poolAllocPoint,
    uint256 totalAmountShares
  ) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256 sdexBalance = s.sdexBalances[address(this)];
    // totalSdexEmission
    uint256 elapsedBlocks = block.number - positionStartBlock;
    // sdex emission
    uint256 multiplier = ToolShedFacet(address(this)).getMultiplier(positionStartBlock, block.number+2);
    uint256 totalSdexEmission = (multiplier * s.sdexPerBlock) - s.sdexRewarded;
		uint256 sdexEmittedForPool = totalSdexEmission * poolAllocPoint / s.totalAllocPoint;
    uint256 proportion = totalAmountShares / sdexEmittedForPool;
    uint256 reward = proportion * sdexBalance / s.unity;
    mintReward(to, address(this), reward);
    s.sdexRewarded += reward;

  }
}
