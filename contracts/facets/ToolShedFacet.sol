pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './SdexFacet.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo } from '../libraries/LibAppStorage.sol';

contract ToolShedFacet {
  
	function updatePool(uint256 _pid) public {
    AppStorage storage s = LibAppStorage.diamondStorage();
    PoolInfo storage pool = s.poolInfo[_pid];
		if (block.number <= pool.lastRewardBlock) {
			return;
		}
		uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
		uint256 sdexReward = multiplier * s.sdexPerBlock *pool.allocPoint / s.totalAllocPoint;
		uint256[] memory supplies = new uint256[](pool.tokenData.length);
		uint256 supplySum = 0;
		for (uint j=0; j < pool.tokenData.length; j++) {
			supplies[j] = pool.tokenData[j].supply; 
			supplySum += pool.tokenData[j].supply;
		}
		if (supplySum == 0) {
			pool.lastRewardBlock = block.number;
			return;
		}
   
    //https://eip2535diamonds.substack.com/p/how-to-share-functions-between-facets
    SdexFacet(address(this)).mint(address(this), sdexReward);
		pool.lastRewardBlock = block.number;
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].accSdexPerShare =  pool.tokenData[j].accSdexPerShare + sdexReward* s.unity / (pool.tokenData.length*supplies[j]);
		}


  /*  
		// Lol - are they really taking 10% of cake mint to personal addr?
		//cake.mint(devaddr, cakeReward.div(10));
    // cake is made in the kitchen, kept in the kitchen and provided from the kitchen 
		pool.lastRewardBlock = block.number;
    masterPantry.setPoolInfo(_pid, pool);
   */
	}
	function updateStakingPool() public  {
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

	function massUpdatePools() public {
    AppStorage storage s = LibAppStorage.diamondStorage();
		for (uint256 pid = 0; pid < s.poolLength; ++pid) {
			updatePool(pid);
		}
  }


	function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
		return _to - _from * s.BONUS_MULTIPLIER;
	}

  function totalAllocPoint() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.totalAllocPoint;

  }
}

