pragma solidity 0.8.9;

import { LibAppStorage, AppStorage, Modifiers, TokenRewardData, Reward } from '../libraries/LibAppStorage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './ToolShedFacet.sol';
import 'hardhat/console.sol';
/**
  * @title RewardFacet
  * @dev The {RewardFacet} is tasked with minting Reward NFT's upon the withdrawal of a successfully completed stake by a user.
*/
contract RewardFacet is Modifiers {
  
  /**
    * addReward is called by Sigmadex to add an NFT reward to a token that is found in one or more pools.  Many NFT rewards are token specific, A USDT pool will mint a USDT specific reward.  The valid rewards are found in this array
    * @param tokenAddr The address of the token this nft (such as USDT)
    * @param nftRewardAddr the address of the NFT reward (such as reduced penalty reward)
  */
  function addReward(address tokenAddr, address nftRewardAddr) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();

    for (uint i=0; i < s.validRewards[tokenAddr].length; i++) {
      if (s.validRewards[tokenAddr][i] == nftRewardAddr) {
        revert("nft already in list");
      }
    }
    s.validRewards[tokenAddr].push(nftRewardAddr);
  }

  /**
    * The mintReward Function is tasked with choosing a pseudorandom NFT choice from the list of available rewards, and minting it to the user who successfully completed their stake of the specified reward value
    * @param to The future recipient of the NFT reward (you)
    * @param token The underlying token the NFT rewards (such as USDT)
    * @param rewardAmount the amount of the Underlying token this NFT has available to consume (such as 10 USDT)
  */
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

  /**
    * requestReward is called by the {TokenFarmFacet} and {SdexVaultFacet} upon the withdrawal of a successful position in a given pool by the user.  It is responsibile for calculating what proportion of the penalty pool the user receives in the form of an NFT reward.  The algorithm awards the proportion (timeStaked x amountStaked)/(totalStaked x totalTimeStaked) of the penalties pools current holding.
    * @param to the address of the future Reward NFT holder
    * @param token the address of the token being withdrawed (such as USDT)
    * @param timeAmount (timeStaked*amountStaked) the product of the amount staked and how long.  Used to to determine what proportion the user receives from the penalty pool 
    * @return rewardAmount amount rewarded to the user as an NFT reward, used by {TokenFarmFacet} and {SdexVaultFacet} in updating the state of the smart contract
  */
  function requestReward(address to, address token, uint256 timeAmount) public onlyDiamond returns (uint256){
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
    mintReward(to, token, rewardAmount);
    return rewardAmount;
  }

  /**
    * Internally two penalty pools for Sdex are kept, one for penalties lost on staking Sdex itself, and another for penalites derived from lost block rewards. For example a premature withdraw on USDT-ETH results in a loss of accrued Sdex from block rewards, while an SDEX-ETH pair premature withdraw results in both a loss of accrued block rewards, and the SDEX originally staked as well. requestSdexReward mints NFT rewards based on penalties accrued only from lost block rewards.
    * @param to the address of the user receiving the reward
    * @param positionStartBlock the block the position started accruing sdex block rewards
    * @param poolAllocPoint the allocation points of the specific pool. Divided by the totalAllocPoint of the farm to determine which proportion of the block rewards go to that pool
    * @param totalAmountShares the amount of Sdex this position accrued as block rewards. Divided by the total amound of block rewards for the pool in the same time frame to determine what proportion of the SDEX block rewards pool is given
  */
  function requestSdexReward(
    address to,
    uint256 positionStartBlock,
    uint256 poolAllocPoint,
    uint256 totalAmountShares
  ) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData memory tokenRewardData = s.tokenRewardData[address(this)];
     
    uint256 sdexBalance = s.sdexBalances[address(this)] - tokenRewardData.penalties - s.vSdex;

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

  /** 
  * Returns a list of addresses belong to the valid NFT's for a specific token
  * @param token the token, such as USDT in question
  * @return validRewards an array of NFT addresses that are valid rewards for this token
  */
  function getValidRewardsForToken(address token) public returns (address[] memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.validRewards[token]; 
  }
}
