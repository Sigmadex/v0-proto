pragma solidity 0.8.7;


import './interfaces/IMasterPantry.sol';
import './interfaces/IKitchen.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import '../SyrupBar.sol';


contract AutoCakeChef is Ownable {
	using SafeBEP20 for IBEP20;

	event Withdraw(address indexed user, uint256 indexed pid);
	event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);

  IKitchen kitchen;
  IMasterPantry  masterPantry;
  SyrupBar syrup;
  constructor(
    address _masterPantry,
    address _kitchen
  ) {
    masterPantry = IMasterPantry(_masterPantry);
    kitchen = IKitchen(_kitchen);
    syrup = masterPantry.syrup();

  }

  function enterStakingCakeVault(uint256 _amount) public {
    //require(msg.sender == cakeVault, "only the cakevault can call this function");
    kitchen.updatePool(0);
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(0);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(0, msg.sender);
    if (user.tokenData.length == 0) {
      //new staker
      user.tokenData = new IMasterPantry.UserTokenData[](1);
      IMasterPantry.UserTokenData memory cakeTokenData = IMasterPantry.UserTokenData({
        amount: 0,
        rewardDebt: 0
      });
      user.tokenData[0] = cakeTokenData;
    }
    if (user.tokenData[0].amount > 0) {
      uint256 pending = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (masterPantry.unity()) - (user.tokenData[0].rewardDebt);
      if(pending > 0) {
        kitchen.safeCakeTransfer(msg.sender, pending);
      }
    }
    if(_amount > 0) {
      pool.tokenData[0].token.safeTransferFrom(address(msg.sender), address(this), _amount);
      user.tokenData[0].amount = user.tokenData[0].amount + (_amount);
    }
    user.tokenData[0].rewardDebt = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (masterPantry.unity());
    pool.tokenData[0].supply = pool.tokenData[0].supply + _amount;
    syrup.mint(msg.sender, _amount);
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = _amount;
    masterPantry.setUserInfo(0, msg.sender, user);
    masterPantry.setPoolInfo(0, pool);
    emit Deposit(msg.sender, 0, amounts);
  }

  function leaveStakingCakeVault(uint256 _amount) public {
    //require(msg.sender == cakeVault, "only callable by cakeVault");
    kitchen.updatePool(0);
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(0);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(0, msg.sender);
    require(user.tokenData[0].amount >= _amount, "withdraw: not good");
    uint256 pending = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (masterPantry.unity()) - (user.tokenData[0].rewardDebt);
    if(pending > 0) {
      kitchen.safeCakeTransfer(msg.sender, pending);
    }
    if(_amount > 0) {
      user.tokenData[0].amount = user.tokenData[0].amount - (_amount);
      pool.tokenData[0].token.safeTransfer(address(msg.sender), _amount);
      pool.tokenData[0].supply -= _amount;
    }
    user.tokenData[0].rewardDebt = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (masterPantry.unity());

    syrup.burn(msg.sender, _amount);
    masterPantry.setUserInfo(0, msg.sender, user);
    masterPantry.setPoolInfo(0, pool);
    emit Withdraw(msg.sender, 0);
  }

}
