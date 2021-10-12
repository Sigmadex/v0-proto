pragma solidity 0.8.7;

import './MasterPantry.sol';

contract Kitchen is MasterPantry {
  
	function updateStakingPool() internal {
		uint256 points = 0;
		// pid = 1 -> pid = 1 (rm cake pool)
		for (uint256 pid = 0; pid < poolLength; ++pid) {
			points = points + poolInfo[pid].allocPoint;
		}
		totalAllocPoint = points;
		/* The div(3) mystery and the cake pool
		if (points != 0) {
			points = points.div(3);
			totalAllocPoint = totalAllocPoint.sub(poolInfo[0].allocPoint).add(points);
			poolInfo[0].allocPoint = points;
			}
		 */
	}

	// Return reward multiplier over the given _from to _to block.
	function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
		return _to - _from * BONUS_MULTIPLIER;
	}
	// Update reward variables for all pools. Be careful of gas spending!
	function massUpdatePools() public {
		for (uint256 pid = 0; pid < poolLength; ++pid) {
			updatePool(pid);
		}
	}

	function updatePool(uint256 _pid) public {
		PoolInfo storage pool = poolInfo[_pid];
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
		uint256 cakeReward = multiplier *(cakePerBlock) *(pool.allocPoint) / (totalAllocPoint);
		// Lol - are they really taking 10% of cake mint to personal addr?
		//cake.mint(devaddr, cakeReward.div(10));
		cake.mint(address(this), cakeReward);
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].accCakePerShare =  pool.tokenData[j].accCakePerShare + (cakeReward)* unity / (pool.tokenData.length*supplies[j]); 
		}
		pool.lastRewardBlock = block.number;
	}

	// Safe cake transfer function, just in case if rounding error causes pool to not have enough CAKEs.
	function safeCakeTransfer(address _to, uint256 _amount) internal {
		uint256 cakeBal = cake.balanceOf(address(this));
		if (_amount > cakeBal) {
			cake.transfer(_to, cakeBal);
		} else {
			cake.transfer(_to, _amount);
		}
	}

	function calcRefund(uint256 timeStart, uint256 timeEnd, uint256 amount) public view returns (uint256 refund, uint256 penalty) {
		uint256 timeElapsed = block.timestamp - timeStart;
		uint256 timeTotal = timeEnd - timeStart;
		uint256 proportion = (timeElapsed * unity) / timeTotal;
		uint256 refund = amount * proportion / unity;
		uint256 penalty = amount - refund;
		require(amount == penalty + refund, 'calc fund is leaking rounding errors');
		return (refund, penalty);

	}
}
