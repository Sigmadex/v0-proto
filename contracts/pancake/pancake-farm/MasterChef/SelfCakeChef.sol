pragma solidity 0.8.7;


import './interfaces/IMasterPantry.sol';
import './interfaces/IKitchen.sol';
import './interfaces/ICookBook.sol';
import './interfaces/ICashier.sol';

import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import '../SyrupBar.sol';

contract SelfCakeChef is Ownable {
	using SafeBEP20 for IBEP20;
  
	event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
	event Withdraw(address indexed user, uint256 indexed pid);

  IKitchen kitchen;
  IMasterPantry masterPantry;
  ICookBook cookBook;
  ICashier cashier;
  
  SyrupBar syrup;

  constructor(
    address _masterPantry,
    address _kitchen,
    address _cookBook,
    address _cashier
  ) {
    masterPantry = IMasterPantry(_masterPantry);
    kitchen = IKitchen(_kitchen);
    cookBook = ICookBook(_cookBook);
    cashier = ICashier(_cashier);

    syrup = masterPantry.syrup();
  }


	function enterStaking(
		uint256 _amount,
		uint256 _timeStake
	) public {
		kitchen.updatePool(0);
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(0);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(0, msg.sender);
    uint256[] memory amountArr = new uint256[](1);
    amountArr[0] = _amount;
    IMasterPantry.UserPosition memory newPosition  = IMasterPantry.UserPosition({
      timeStart: block.timestamp,
      timeEnd: block.timestamp + _timeStake,
      amounts: amountArr,
      startBlock: block.number
    });
		if (user.tokenData.length == 0) {
			//new staker
      user.tokenData = new IMasterPantry.UserTokenData[](1);
			IMasterPantry.UserTokenData memory cakeTokenData = IMasterPantry.UserTokenData({
				amount: 0,
				rewardDebt: 0
			});
			user.tokenData[0] = cakeTokenData;
    }
    
		if(_amount > 0) {
			pool.tokenData[0].token.safeTransferFrom(address(msg.sender), address(this), _amount);
			user.tokenData[0].amount = user.tokenData[0].amount + (_amount);
		}
		pool.tokenData[0].supply = pool.tokenData[0].supply + _amount;
    masterPantry.setUserInfo(0, msg.sender, user);
    masterPantry.setPoolInfo(0, pool);
    masterPantry.addPosition(0, msg.sender, newPosition);
    masterPantry.addTimeAmountGlobal(address(pool.tokenData[0].token), (_amount*_timeStake));
		syrup.mint(msg.sender, _amount);

		emit Deposit(msg.sender, 0, amountArr);
	}

	function leaveStaking(uint256 _positionid) public {
    kitchen.updatePool(0);
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(0);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(0, msg.sender);
		IMasterPantry.UserPosition memory currentPosition = user.positions[_positionid];
		uint256 _amount = currentPosition.amounts[0];
		require(user.tokenData[0].amount >= _amount, "withdraw: not good");
		// further questions about the pending story 
		// especially 'rewardDebt'
		// storing amount in penalty, vs amount out penalty may be a good idea
		uint256 pending = _amount * pool.tokenData[0].accCakePerShare / masterPantry.unity();
		if (pending > 0) {
			if (block.timestamp < currentPosition.timeEnd) {
				kitchen.safeCakeTransfer(address(cashier), pending);
			} else {
				kitchen.safeCakeTransfer(msg.sender, pending);
			}  
		}

		if(_amount > 0) {
			user.tokenData[0].amount = user.tokenData[0].amount - (_amount);
			if (block.timestamp < currentPosition.timeEnd) {
				(uint256 refund, uint256 penalty) = cookBook.calcRefund(
					user.positions[_positionid].timeStart,
					user.positions[_positionid].timeEnd,
					_amount
				);
				pool.tokenData[0].token.safeTransfer(
					address(msg.sender),
					refund
				);
				pool.tokenData[0].token.safeTransfer(
					address(cashier),
					penalty
				);
			} else {
				pool.tokenData[0].token.safeTransfer(address(msg.sender), _amount);
			}
			pool.tokenData[0].supply -= _amount;
		}

    masterPantry.subTimeAmountGlobal(
      address(pool.tokenData[0].token),
      (currentPosition.amounts[0]*(currentPosition.timeEnd - currentPosition.timeStart))
    );
    user.positions[_positionid].amounts[0] = 0;
    masterPantry.setUserInfo(0, msg.sender, user);
    masterPantry.setPoolInfo(0, pool);
		syrup.burn(msg.sender, _amount);
		emit Withdraw(msg.sender, 0);
	}
}
