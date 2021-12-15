pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './SdexFacet.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, TokenRewardData } from '../libraries/LibAppStorage.sol';
import 'hardhat/console.sol';

/** @title ToolShedFacet
*  @dev The {ToolShedFacet} provides the tools that make the Vault, Farms and Reward system run and work together.  It updates the pools, calculated the penalties, and provides a variety of getter functions that concern global state
*/
contract ToolShedFacet is Modifiers{

  /** 
   * the update pool function is called by the system as the first order of business on every deposit and withdraw and does the heavily lifting in terms of minting the SDEX block reward and distributing it out to the various pools.
   * @param  pid the pool id currently being updated
  */ 
	function updatePool(uint256 pid) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    PoolInfo storage pool = s.poolInfo[pid];
		if (block.timestamp <= pool.lastRewardTime) {
			return;
		}
		uint256[] memory supplies = new uint256[](pool.tokenData.length);
		uint256 supplySum = 0;
		for (uint j=0; j < pool.tokenData.length; j++) {
			supplies[j] = pool.tokenData[j].supply; 
			supplySum += pool.tokenData[j].supply;
		}
		if (supplySum == 0) {
			pool.lastRewardTime = block.timestamp;
			return;
		}
  
    uint256 multiplier = getMultiplier(pool.lastRewardTime, block.timestamp);
		uint256 sdexReward = multiplier * s.sdexPerMinute *pool.allocPoint / s.totalAllocPoint;
    //https://eip2535diamonds.substack.com/p/how-to-share-functions-between-facets
    SdexFacet(address(this)).mint(address(this), sdexReward);
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].accSdexPerShare += sdexReward* s.unity / (pool.tokenData.length*supplies[j]);
		}
		pool.lastRewardTime = block.timestamp;
	}

  /**
   * Used during pool addtion, or allocPoint recalibration to manage total Allocation points for all pools
  */ 
	function updateStakingPool() public  onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
		uint256 points = 0;
		// pid = 1 -> pid = 1 (rm cake pool)
		for (uint256 pid = 0; pid < s.poolLength; ++pid) {
			points = points + s.poolInfo[pid].allocPoint;
		}
    s.totalAllocPoint = points;
		/* The div(3) mystery and the cake pool
		if (points != 0) {
			points = points.div(3);
			totalAllocPoint = totalAllocPoint.sub(poolInfo[0].allocPoint).add(points);
			poolInfo[0].allocPoint = points;
			}
		 */
	}
  /**
  * massUpdatePools can be called to update the state of all pools
 */
	function massUpdatePools() public {
    AppStorage storage s = LibAppStorage.diamondStorage();
		for (uint256 pid = 0; pid < s.poolLength; ++pid) {
			updatePool(pid);
		}
  }

  /**
  * Normally Sdex is emitted at a constant rate per block, though sometimes a multiplier may be added to multiply this number a certain factor, getMultiplier manages this
  * @param  from the starting block one wishes to calculate from
  * @param to the final block one wishes to calculate from
  * @return uint256 the multipler applied to all cake over this block period
  */ 
	function getMultiplier(uint256 from, uint256 to) public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    console.log('ToolShedFacet::getMultiplier::to-from', to - from);
    uint256 emission = (to - from) / 60;
    console.log('ToolShedFacet::getMultiplier::emission', emission);
    return emission;
		//return to - from * s.BONUS_MULTIPLIER;
	}
  /**
  * totalAllocPoint returns the total allocation points over all pools.  This number is divided against to determine which proportion of the block emission goes to each pool
  * @return uint256 total ammount of allocation points across all pools
  */
  function totalAllocPoint() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.totalAllocPoint;
  }
  /**
  * returns how many SDEX tokens are being emitted per block, remember to pair with the getMultiplier function if the bonus multiplier is not 1
  * @return uint256 amount of SDEX emitted per minute
  */
  function sdexPerMinute() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexPerMinute;
  }
  /**
  * tokenRewardData returns the inner tally of information that is kept on each token on the platform that concerns the distribution of rewards of each of these tokens from the penalty pool
  * @param token address of token in question
  * @return TokenRewardData see {TokenRewardData} for more info
  */
  function tokenRewardData(address token) public view returns (TokenRewardData memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.tokenRewardData[token];
  }
  
  /**
  * accumulated Sdex Penalty pool returns the amount of SDEX currently inside the special additionaly penalty pool for SDex that is accumulated by positions from block rewards that are withdrawn early
  * @return uint256 the amount in the the accumulated Sdex Penalty Pool
  */
  function accSdexPenaltyPool() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.accSdexPenaltyPool;
  }

  /**
  * accumulated Sdex Reward pool returns the amount of SDEX currently allotted for Sdex rewards derived from the  accumulated Sdex Penalty Pool.
  * @return uint256 the amount of Sdex placed aside for rewards
  */
  function accSdexRewardPool() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.accSdexRewardPool;
  }
  
  /**
  * accumulated Sdex Paid Out returns the amount of SDEX that has been paid out from the rewards pool over all time.
  * @return uint256 the amount of Sdex paid out from NFT rewards
  */
  function accSdexPaidOut() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.accSdexPaidOut;
  }
 
  /**
     * calcRefund returns the refund and penalty of an amount of a token given a startBlock (often the current Time) and the blockEnd (often the end of a stake) to determine how much is penalized and how much is refunded.  Generally if one makes it through 50% of the take, one is refunded 50% of the tokens
     * @param startTime the timestamp where this position started
     * @param endTime  the timestampwhere this position is no longer penalized for withdrawing
     * @param amount the amount of a token in question
     * @return refund how much is refunded if withdrawing at start time given endTime and how much is penalized
     * @return penalty how much one is penalized
  */ 
	function calcRefund(uint256 startTime, uint256 endTime, uint256 amount) public view returns (uint256 refund, uint256 penalty) {
    AppStorage storage s = LibAppStorage.diamondStorage();
		uint256 timeElapsed = block.timestamp - startTime;
    console.log('ToolShedFacet::calcRefund::timeElapsed', timeElapsed);
		uint256 timeTotal = endTime - startTime;
		uint256 proportion = timeElapsed * s.unity / timeTotal;
		uint256 refund = amount * proportion / s.unity;
		uint256 penalty = amount - refund;
		require(amount == penalty + refund, 'calc fund is leaking rounding errors');
		return (refund, penalty);
	}


}

