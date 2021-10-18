pragma solidity 0.8.9;

import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'hardhat/console.sol';
import './interfaces/IMasterPantry.sol';
contract CookBook {
  uint256 public unity = 1e27;
  IMasterPantry public immutable masterPantry;

  constructor(address _masterPantry) {
    masterPantry = IMasterPantry(_masterPantry);
  }

	function pendingCake(uint256 _pid, address _user) public view returns (uint256) {
		uint256 returnResult = 0;
		IMasterPantry.PoolInfo memory  pool = masterPantry.getPoolInfo(_pid);
		IMasterPantry.UserInfo memory  user = masterPantry.getUserInfo(_pid, _user);
		uint256 supply = 0;
		for (uint j=0; j < pool.tokenData.length; j++) {
			supply += pool.tokenData[j].supply;
		}
		if (block.number > pool.lastRewardBlock && supply != 0) {
			uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
			uint256 cakeReward = multiplier *(masterPantry.cakePerBlock()) * (pool.allocPoint) /(masterPantry.totalAllocPoint()); 
			for (uint j=0; j < pool.tokenData.length; j++) {
				uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;
				uint256 supply = pool.tokenData[j].supply;
				accCakePerShare = accCakePerShare + cakeReward * unity / supply;
				returnResult += user.tokenData[j].amount * accCakePerShare / unity - user.tokenData[j].rewardDebt;
			}
			return returnResult;
		}
		for (uint j=0; j < pool.tokenData.length; j++) {
			uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;
			uint256 supply = pool.tokenData[j].supply;
			returnResult += user.tokenData[j].amount * accCakePerShare / unity - user.tokenData[j].rewardDebt;
		}
		return returnResult;
	}

	function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
		return _to - (_from) * masterPantry.BONUS_MULTIPLIER();
	}

	function calcRefund(uint256 timeStart, uint256 timeEnd, uint256 amount) public view returns (uint256 refund, uint256 penalty) {
		uint256 timeElapsed = block.timestamp - timeStart;
		uint256 timeTotal = timeEnd - timeStart;
		uint256 proportion = (timeElapsed * masterPantry.unity()) / timeTotal;
		uint256 refund = amount * proportion / masterPantry.unity();
		uint256 penalty = amount - refund;
		require(amount == penalty + refund, 'calc fund is leaking rounding errors');
		return (refund, penalty);

	}


}
