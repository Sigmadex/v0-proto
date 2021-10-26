pragma solidity 0.8.9;
import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import './interfaces/IACL.sol';
import './interfaces/IMasterPantry.sol';
import './interfaces/IKitchen.sol';
import 'hardhat/console.sol';

import 'contracts/NFT/INFTRewards.sol';

contract Cashier is Ownable {
  using SafeBEP20 for IBEP20;

  IMasterPantry masterPantry;
  IACL acl;
  IKitchen kitchen;
  INFTRewards nftRewards;
  
  
  constructor(
    address _masterPantry,
    address _acl,
    address _kitchen,
    address _nftRewards
  ) {
    masterPantry = IMasterPantry(_masterPantry);
    acl = IACL(_acl);
    kitchen = IKitchen(_kitchen);
    nftRewards = INFTRewards(_nftRewards);
  }

  modifier onlyACL() {
    acl.onlyACL(msg.sender);
    _;
  }

  function requestReward(address _to, address _token, uint256 _timeAmount) public onlyACL {
    IMasterPantry.TokenRewardData memory tokenRewardData = masterPantry.tokenRewardData(_token);
    //console.log('timeAmount', _timeAmount);
    uint256 kitchenBalance = IBEP20(_token).balanceOf(address(this));
    //console.log('kitchenbalance', kitchenBalance);
    uint256 proportio = _timeAmount * masterPantry.unity() / tokenRewardData.timeAmountGlobal;
    //console.log('proportio', proportio);
    uint rewardAmount = proportio * kitchenBalance / masterPantry.unity();
    IBEP20(_token).safeTransfer(
      address(nftRewards),
      rewardAmount
    );
    nftRewards.mintReward(_to, _token, rewardAmount);

  }

  function requestCakeReward(
    address _to,
    uint256 _positionStartBlock,
    uint256 _poolAllocPoint,
    uint256 _totalAmountShares
  ) public onlyACL {
    uint256 cashierBalance = IBEP20(address(masterPantry.cake())).balanceOf(address(this));
    // totalCakeEmission
    uint256 elapsedBlocks = block.number - _positionStartBlock;
    // cake emission
    uint256 multiplier = kitchen.getMultiplier(_positionStartBlock, block.number + 2);
    uint256 totalCakeEmission = (multiplier * masterPantry.cakePerBlock()) - masterPantry.cakeRewarded();
		uint256 cakeEmittedForPool = totalCakeEmission *(_poolAllocPoint) / (masterPantry.totalAllocPoint());
    uint256 proportion = _totalAmountShares / cakeEmittedForPool;
    uint256 reward = proportion * cashierBalance / masterPantry.unity();
    nftRewards.mintReward(_to, address(masterPantry.cake()), reward);
    masterPantry.addCakeRewarded(reward);

  }

}
