pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './SdexFacet.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, TokenRewardData } from '../libraries/LibAppStorage.sol';
import 'hardhat/console.sol';
contract ToolShedFacet {
  
	function updatePool(uint256 _pid) public {
    AppStorage storage s = LibAppStorage.diamondStorage();
    PoolInfo storage pool = s.poolInfo[_pid];
		if (block.number <= pool.lastRewardBlock) {
			return;
		}
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
   
		uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
		uint256 sdexReward = multiplier * s.sdexPerBlock *pool.allocPoint / s.totalAllocPoint;
    //https://eip2535diamonds.substack.com/p/how-to-share-functions-between-facets
    SdexFacet(address(this)).mint(address(this), sdexReward);
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].accSdexPerShare =  pool.tokenData[j].accSdexPerShare + sdexReward* s.unity / (pool.tokenData.length*supplies[j]);
		}
		pool.lastRewardBlock = block.number;
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

  function sdexPerBlock() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexPerBlock;
  }

  function tokenRewardData(address token) public view returns (TokenRewardData memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.tokenRewardData[token];
  }

	function calcRefund(uint256 timeStart, uint256 timeEnd, uint256 amount) public view returns (uint256 refund, uint256 penalty) {
    AppStorage storage s = LibAppStorage.diamondStorage();
		uint256 timeElapsed = block.timestamp - timeStart;
    //console.log('timeElapsed', timeElapsed);
		uint256 timeTotal = timeEnd - timeStart;
		uint256 proportion = timeElapsed * s.unity / timeTotal;
		uint256 refund = amount * proportion / s.unity;
		uint256 penalty = amount - refund;
		require(amount == penalty + refund, 'calc fund is leaking rounding errors');
		return (refund, penalty);

	}
}

