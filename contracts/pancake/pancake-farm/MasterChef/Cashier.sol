pragma solidity 0.8.7;

import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import './interfaces/IACL.sol';
import './interfaces/IMasterPantry.sol';

import 'hardhat/console.sol';

contract Cashier is Ownable {

  IMasterPantry masterPantry;
  IACL acl;
  constructor(
    address _masterPantry,
    address _acl
  ) {
    masterPantry = IMasterPantry(_masterPantry);
    acl = IACL(_acl);
  }

  modifier onlyACL() {
    acl.onlyACL(msg.sender);
    _;
  }

  function requestReward(address _token, uint256 _timeAmount) public onlyACL {
    IMasterPantry.TokenRewardData memory tokenRewardData = masterPantry.tokenRewardData(_token);
    console.log('timeAmount', _timeAmount);
    uint256 kitchenBalance = IBEP20(_token).balanceOf(address(this));
    console.log('kitchenbalance', kitchenBalance);
    uint256 proportio = _timeAmount * masterPantry.unity() / tokenRewardData.timeAmountGlobal;
    console.log('proportio', proportio);
    uint rewardAmount = proportio * kitchenBalance / masterPantry.unity();
    console.log('rewardAmount', rewardAmount);


  }

}
