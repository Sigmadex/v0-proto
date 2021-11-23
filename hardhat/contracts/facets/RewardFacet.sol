pragma solidity 0.8.10;

import { LibAppStorage, AppStorage, Modifiers, TokenRewardData, Reward, REWARDPOOL } from '../libraries/LibAppStorage.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './ToolShedFacet.sol';
import 'hardhat/console.sol';
/**
  * @title RewardFacet
  * @dev The {RewardFacet} is tasked with minting Reward NFT's upon the withdrawal of a successfully completed stake by a user.
*/
contract RewardFacet is Modifiers {
  event AddRewardForToken(address token, address nftReward);

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
    emit AddRewardForToken(tokenAddr, nftRewardAddr);
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
    uint256 rewardAmount,
    REWARDPOOL rewardPool
  ) public  onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256 kindaRandomId = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), to, s.seed))) % s.validRewards[token].length;
    address nftAddr = s.validRewards[token][kindaRandomId];
    Reward memory reward = s.rewards[nftAddr];
    bytes memory fnCall = abi.encodeWithSelector(
      reward.rewardSelector,
      to, token, rewardAmount, rewardPool
    );
    (bool success,) = address(this).delegatecall(fnCall);
    require(success, "reward NFT failed");
    changeSeed(kindaRandomId);
  }

  /**
    * requestReward is called by the {TokenFarmFacet} and {SdexVaultFacet} upon the withdrawal of a successful position in a given pool by the user.  It is responsibile for calculating what proportion of the penalty pool the user receives in the form of an NFT reward.  The algorithm awards the proportion (timeStaked x amountStaked)/(totalStaked x totalTimeStaked) of the penalties pools current holding.
    * @param to the address of the future Reward NFT holder
    * @param token the address of the token being withdrawed (such as USDT)
    * @param blockAmount (blocksAhead*amountStaked) the product of the amount staked and how long.  Used to to determine what proportion the user receives from the penalty pool 
  */
  function requestReward(address to, address token, uint256 blockAmount) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData storage tokenRewardData = s.tokenRewardData[token];
    uint256 proportio = blockAmount * s.unity / tokenRewardData.blockAmountGlobal;
    uint256 rewardAmount = proportio * tokenRewardData.penalties / s.unity;
    s.tokenRewardData[address(token)].blockAmountGlobal -= blockAmount;
    s.tokenRewardData[address(token)].rewarded += rewardAmount;
    s.tokenRewardData[address(token)].penalties -= rewardAmount;
    mintReward(to, token, rewardAmount, REWARDPOOL.BASE);
  }

  /**
    * Internally two penalty pools for Sdex are kept, one for penalties lost on staking Sdex itself, and another for penalites derived from lost block rewards. For example a premature withdraw on USDT-ETH results in a loss of accrued Sdex from block rewards, while an SDEX-ETH pair premature withdraw results in both a loss of accrued block rewards, and the SDEX originally staked as well. requestSdexReward mints NFT rewards based on penalties accrued only from lost block rewards.
    * @param to the address of the user receiving the reward
    * @param startBlock the block the position started accruing sdex block rewards
    * @param endBlock the block the position was commited to
    * @param poolAllocPoint the allocation points of the specific pool. Divided by the totalAllocPoint of the farm to determine which proportion of the block rewards go to that pool
    * @param amountAccumulated the amount of Sdex this position accrued as block rewards. Divided by the total amound of block rewards for the pool in the same time frame to determine what proportion of the SDEX block rewards pool is given
  */
  function requestSdexReward(
    address to,
    uint256 startBlock,
    uint256 endBlock,
    uint256 poolAllocPoint,
    uint256 amountAccumulated
  ) public onlyDiamond {
    console.log('RewardFacet::requestSdexReward::test');
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData memory tokenRewardData = s.tokenRewardData[address(this)];

    // totalSdexEmission
    //uint256 blocksAhead = endBlock - startBlock;
    // sdex emission
    uint256 multiplier = ToolShedFacet(address(this)).getMultiplier(startBlock, block.number);
    uint256 totalSdexEmission = (multiplier * s.sdexPerBlock);
    uint256 sdexEmittedForPool = totalSdexEmission * poolAllocPoint / s.totalAllocPoint;
    uint256 proportion = amountAccumulated * s.unity / sdexEmittedForPool;
    if (amountAccumulated > sdexEmittedForPool) {
      // odd edge case bug when single user is 100 percent of pool withdrawing between 1-3 blocks after endBlock
      proportion = s.unity;
    }
    uint256 reward = proportion * s.accSdexPenaltyPool / s.unity;
    console.log('RewardFacet::requestSdexReward::reward::', reward);
    console.log('RewardFacet::requestSdexReward::accSdexPenaltyPool::i', s.accSdexPenaltyPool);
    s.accSdexPenaltyPool -= reward;
    console.log('RewardFacet::requestSdexReward::accSdexPenaltyPool::f', s.accSdexPenaltyPool);
    s.accSdexRewardPool += reward;
    mintReward(to, address(this), reward, REWARDPOOL.ACC);
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

  function changeSeed(uint256 kindaRandomId) private {

    console.log('RewardFacet::changeSeed::kindaRandomId::i::', kindaRandomId);
    kindaRandomId += 1;
    console.log('RewardFacet::changeSeed::kindaRandomId::f::', kindaRandomId);
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256 seed = s.seed;
    console.log('RewardFacet::changeSeed::s.seed::i::', s.seed);
    uint256 seedNext = s.seedNext;
    console.log('RewardFacet::changeSeed::s.seedNext::i::', seedNext);
    for (uint i=0; i < kindaRandomId; i++) {
      uint256 oldSeed = seed;
      seed = seedNext;
      seedNext += oldSeed;
      if (seedNext > s.seedMax) {
        seed = 1;
        seedNext = 1;
      }
      console.log('loop');
    }
    s.seed = seed;
    console.log('RewardFacet::changeSeed::s.seed::f::', s.seed);
    s.seedNext = seedNext;
    console.log('RewardFacet::changeSeed::seedNext::f::', s.seedNext);
  }
}
