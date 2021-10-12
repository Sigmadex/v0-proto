pragma solidity 0.8.7;


import './MasterPantry.sol';
import './Kitchen.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';

contract AutoCakeChef is Kitchen {
	using SafeBEP20 for IBEP20;

  function leaveStakingCakeVault(uint256 _amount) public {
    require(msg.sender == cakeVault, "only callable by cakeVault");
    PoolInfo storage pool = poolInfo[0];
    UserInfo storage user = userInfo[0][msg.sender];
    require(user.tokenData[0].amount >= _amount, "withdraw: not good");
    updatePool(0);
    uint256 pending = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (unity) - (user.tokenData[0].rewardDebt);
    if(pending > 0) {
      safeCakeTransfer(msg.sender, pending);
    }
    if(_amount > 0) {
      user.tokenData[0].amount = user.tokenData[0].amount - (_amount);
      pool.tokenData[0].token.safeTransfer(address(msg.sender), _amount);
      pool.tokenData[0].supply -= _amount;
    }
    user.tokenData[0].rewardDebt = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (unity);

    syrup.burn(msg.sender, _amount);
    emit Withdraw(msg.sender, 0);
  }

  function enterStakingCakeVault(uint256 _amount) public {
    require(msg.sender == cakeVault, "only the cakevault can call this function");
    PoolInfo storage pool = poolInfo[0];
    UserInfo storage user = userInfo[0][msg.sender];
    updatePool(0);
    if (user.tokenData.length == 0) {
      //new staker
      UserTokenData memory cakeTokenData = UserTokenData({
        amount: 0,
        rewardDebt: 0
      });
      user.tokenData.push(cakeTokenData);
    }
    if (user.tokenData[0].amount > 0) {
      uint256 pending = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (unity) - (user.tokenData[0].rewardDebt);
      if(pending > 0) {
        safeCakeTransfer(msg.sender, pending);
      }
    }
    if(_amount > 0) {
      pool.tokenData[0].token.safeTransferFrom(address(msg.sender), address(this), _amount);
      user.tokenData[0].amount = user.tokenData[0].amount + (_amount);
    }
    user.tokenData[0].rewardDebt = user.tokenData[0].amount * (pool.tokenData[0].accCakePerShare) / (unity);
    pool.tokenData[0].supply = pool.tokenData[0].supply + _amount;
    syrup.mint(msg.sender, _amount);
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = _amount;
    emit Deposit(msg.sender, 0, amounts);
  }
}
