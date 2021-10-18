pragma solidity 0.8.9;

import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import './interfaces/IACL.sol';
import './interfaces/IMasterPantry.sol';
import './interfaces/IKitchen.sol';
import 'hardhat/console.sol';

contract Cashier is Ownable {

  IMasterPantry masterPantry;
  IACL acl;
  IKitchen kitchen;
  
  constructor(
    address _masterPantry,
    address _acl,
    address _kitchen
  ) {
    masterPantry = IMasterPantry(_masterPantry);
    acl = IACL(_acl);
    kitchen = IKitchen(_kitchen);
  }

  modifier onlyACL() {
    acl.onlyACL(msg.sender);
    _;
  }

  function requestReward(address _token, uint256 _timeAmount) public onlyACL {
    IMasterPantry.TokenRewardData memory tokenRewardData = masterPantry.tokenRewardData(_token);
    //console.log('timeAmount', _timeAmount);
    uint256 kitchenBalance = IBEP20(_token).balanceOf(address(this));
    //console.log('kitchenbalance', kitchenBalance);
    uint256 proportio = _timeAmount * masterPantry.unity() / tokenRewardData.timeAmountGlobal;
    //console.log('proportio', proportio);
    uint rewardAmount = proportio * kitchenBalance / masterPantry.unity();
    console.log('erc20 rewardAmount', rewardAmount);
  }

  function requestCakeReward(
    uint256 _positionStartBlock,
    uint256 _poolAllocPoint,
    uint256 _totalAmountShares
  ) public onlyACL {
    uint256 cashierBalance = IBEP20(address(masterPantry.cake())).balanceOf(address(this));
    // totalCakeEmission
    uint256 elapsedBlocks = block.number - _positionStartBlock;
    // cake emission
    uint256 multiplier = kitchen.getMultiplier(_positionStartBlock, block.number);
    uint256 unClaimedCakeReward = (multiplier * masterPantry.cakePerBlock()) - masterPantry.cakeRewarded();
		uint256 cakeReward = unClaimedCakeReward *(_poolAllocPoint) / (masterPantry.totalAllocPoint());
    uint256 proportio = _totalAmountShares / (cakeReward * masterPantry.unity());
    uint256 reward = proportio * cashierBalance / masterPantry.unity();
    console.log('cake reward amount', reward);
    masterPantry.addCakeRewarded(_totalAmountShares);

  }

}
