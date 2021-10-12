pragma solidity 0.8.7;

import './MasterPantry.sol';
import './Kitchen.sol';

import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';

contract SelfCakeChef is Kitchen {
	using SafeBEP20 for IBEP20;

	function enterStaking(
		uint256 _amount,
		uint256 _timeStake
	) public {
		PoolInfo storage pool = poolInfo[0];
		UserInfo storage user = userInfo[0][msg.sender];
    uint256[] memory amountArr = new uint256[](1);
    amountArr[0] = _amount;
    UserPosition memory newPosition  = UserPosition({
      timeStart: block.timestamp,
      timeEnd: block.timestamp + _timeStake,
      amounts: amountArr
    });
		updatePool(0);
		if (user.tokenData.length == 0) {
			//new staker
			UserTokenData memory cakeTokenData = UserTokenData({
				amount: 0,
				rewardDebt: 0
			});
			user.tokenData.push(cakeTokenData);
		}
		if(_amount > 0) {
			pool.tokenData[0].token.safeTransferFrom(address(msg.sender), address(this), _amount);
			user.tokenData[0].amount = user.tokenData[0].amount + (_amount);
		}
		pool.tokenData[0].supply = pool.tokenData[0].supply + _amount;
    user.positions.push(newPosition);
		syrup.mint(msg.sender, _amount);
		emit Deposit(msg.sender, 0, amountArr);
	}

	function leaveStaking(uint256 _positionid) public {
		PoolInfo storage pool = poolInfo[0];
		UserInfo storage user = userInfo[0][msg.sender];
		UserPosition memory currentPosition = user.positions[_positionid];
		uint256 _amount = currentPosition.amounts[0];
		require(user.tokenData[0].amount >= _amount, "withdraw: not good");
		updatePool(0);
		// further questions about the pending story 
		// especially 'rewardDebt'
		// storing amount in penalty, vs amount out penalty may be a good idea
		uint256 pending = _amount * pool.tokenData[0].accCakePerShare / unity;
		if (pending > 0) {
			if (block.timestamp < currentPosition.timeEnd) {
				safeCakeTransfer(penaltyAddress, pending);
			} else {
				safeCakeTransfer(msg.sender, pending);
			}  
		}

		if(_amount > 0) {
			user.tokenData[0].amount = user.tokenData[0].amount - (_amount);
			if (block.timestamp < currentPosition.timeEnd) {
				(uint256 refund, uint256 penalty) = calcRefund(
					user.positions[_positionid].timeStart,
					user.positions[_positionid].timeEnd,
					_amount
				);
				pool.tokenData[0].token.safeTransfer(
					address(msg.sender),
					refund
				);
				pool.tokenData[0].token.safeTransfer(
					penaltyAddress,
					penalty
				);
			} else {
				pool.tokenData[0].token.safeTransfer(address(msg.sender), _amount);
			}
			pool.tokenData[0].supply -= _amount;
		}
    user.positions[_positionid].amounts[0] = 0;
		syrup.burn(msg.sender, _amount);
		emit Withdraw(msg.sender, 0);
	}
}
