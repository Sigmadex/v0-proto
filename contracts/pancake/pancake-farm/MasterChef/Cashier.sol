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

  function requestReward(address token, uint256 timeAmount) public onlyACL {
    console.log('timeAmount', timeAmount);
    uint256 kitchenBalance = IBEP20(token).balanceOf(address(this));
    console.log('kitchenbalance', kitchenBalance);
    uint256 globalTimeAmount = masterPantry.timeAmountGlobal(token);
    console.log('globalTimeAmount', globalTimeAmount);
    uint256 proportio = timeAmount * masterPantry.unity() / globalTimeAmount;
    console.log('proportio', proportio);
    uint rewardAmount = proportio * kitchenBalance / masterPantry.unity();
    console.log('rewardAmount', rewardAmount);


  }

}
