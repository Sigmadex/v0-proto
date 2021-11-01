pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserTokenData, UserInfo, Reward, VaultUserInfo, UserPosition } from '../libraries/LibAppStorage.sol';
import '../interfaces/IERC1155.sol';
import './AutoSdexFarmFacet.sol';
import './SdexFacet.sol';
import './ToolShedFacet.sol';
import './RewardFacet.sol';
contract SdexVaultFacet {
  event Deposit(address indexed sender, uint256 amount, uint256 shares, uint256 lastDepositedTime);
  event Withdraw(address indexed sender, uint256 amount, uint256 shares);
  event Harvest(address indexed sender, uint256 performanceFee, uint256 callFee);
  event Pause();
  event Unpause();

  
  function depositVault(
    uint256 amount,
    uint256 timeStake,
    address nftReward,
    uint256 nftid
  ) external   {
    require(amount > 0, "Nothing to deposit");
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256[] memory amountArray = new uint256[](1);
    amountArray[0] = amount;
    UserPosition memory newPosition = UserPosition({
      timeStart: block.timestamp,
      timeEnd: block.timestamp + timeStake,
      amounts: amountArray,
      startBlock: block.number,
      nftReward: address(0),
      nftid: 0
    });

    if (nftReward != address(0)) {
      // FLAG might now work in diamond //
      require(IERC1155(nftReward).balanceOf(msg.sender, nftid) > 0, "User does not have this nft");
      newPosition.nftReward = nftReward;
      newPosition.nftid = nftid;
    }
    uint256 pool = vaultBalance();
    SdexFacet(address(this)).transferFrom(msg.sender, address(this), amount);
    s.vSdex += amount;

    uint256 currentShares = 0;
    if (s.vTotalShares != 0) {
      currentShares = amount * s.vTotalShares / pool;
    } else {
      currentShares = amount;
    }
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];

    vUser.shares = vUser.shares + currentShares;
    vUser.lastDepositedTime = block.timestamp;

    s.vTotalShares += currentShares;
    vUser.sdexAtLastUserAction = (vUser.shares * vaultBalance()) / s.vTotalShares;
    vUser.lastUserActionTime = block.timestamp;

    s.vUserInfo[msg.sender].positions.push(newPosition);
    s.tokenRewardData[address(this)].timeAmountGlobal += amount*timeStake;
    
    earn();

    emit Deposit(msg.sender, amount, currentShares, block.timestamp);
  }

  function harvest() external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    AutoSdexFarmFacet(address(this)).leaveStaking(0);
    uint256 bal = s.vSdex;
    uint256 currentPerformanceFee = bal * s.vPerformanceFee / 10000;
    s.vTreasury += currentPerformanceFee;
    s.vSdex -= currentPerformanceFee;

    uint256 currentCallFee = bal * s.vCallFee / 10000;

    console.log('harvest', vaultBalance(), 'vault balance');
    SdexFacet(address(this)).transfer(msg.sender, currentCallFee);
    console.log('harvest', vaultBalance(), 'vault balance');
    s.vSdex -= currentCallFee;

    earn();

    s.vLastHarvestedTime = block.timestamp;
    emit Harvest(msg.sender, currentPerformanceFee, currentCallFee);
  }

  function withdrawVault(uint256 positionid) public  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];
    UserPosition storage position = vUser.positions[positionid];
    if (position.nftReward != address(0)) {
     Reward memory reward = s.rewards[position.nftReward];
     bytes memory fnCall = abi.encodeWithSelector(
       reward.vaultWithdrawSelector,
       positionid
     );
     (bool success,) = address(this)
      .delegatecall(fnCall);
      require(success, "withdraw failed");
      
    } else {
      uint256 shares = position.amounts[0];
      console.log('shares', shares);
      require(shares > 0, "Nothing to withdraw");
      console.log(vaultBalance(), 'vault balance');
      console.log('total Shares', s.vTotalShares);
      console.log('diamond sdex', SdexFacet(address(this)).balanceOf(address(this)));
      uint256 currentAmount = shares * vaultBalance() / s.vTotalShares;
      vUser.shares -= shares;
      s.vTotalShares -= shares;
      
      uint256 bal = s.vSdex;
      // Consider the edge case where not all funds are staked, kinda odd, but it was there
      if (bal < currentAmount) {
        uint256 balWithdraw = currentAmount - bal;
        AutoSdexFarmFacet(address(this)).leaveStaking(balWithdraw);

        uint256 balAfter = s.vSdex;
        //theoretical
        uint256 diff = balAfter - bal;
        if (diff < balWithdraw) {
          console.log('theo');
          currentAmount = bal + diff;
        }
      }

      if (vUser.shares > 0) {
        vUser.sdexAtLastUserAction = vUser.shares * vaultBalance() / s.vTotalShares;
      } else {
        vUser.sdexAtLastUserAction = 0;
      }
      vUser.lastUserActionTime = block.timestamp;
      uint256 stakeTime = position.timeEnd - position.timeStart;
      uint256 timeAmount = (currentAmount*stakeTime);
      if (position.timeEnd < block.timestamp) {
          SdexFacet(address(this)).transfer(
            msg.sender,
            currentAmount
          );
          console.log(currentAmount, 'sent');
          s.vSdex -= currentAmount;
          //request nft Reward
          uint256 rewardAmount = RewardFacet(address(this)).requestReward(
            msg.sender, address(this), timeAmount
          );
          s.tokenRewardData[address(this)].timeAmountGlobal -= position.amounts[0] * stakeTime;
          s.tokenRewardData[address(this)].rewarded += rewardAmount;
      } else {
        console.log('in penalty');
          (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
            position.timeStart, position.timeEnd, currentAmount
          );

          SdexFacet(address(this)).transfer(
            msg.sender,
            refund
          );

          s.vSdex -= refund;
          s.tokenRewardData[address(this)].timeAmountGlobal -= position.amounts[0] * stakeTime;
          s.tokenRewardData[address(this)].penalties += penalty;
      }
      position.amounts[0] = 0;
      emit Withdraw(msg.sender, currentAmount, shares);
    }
  }

  function earn() internal {
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256 bal = s.vSdex;
    if (bal > 0) {
      AutoSdexFarmFacet(address(this)).enterStaking(bal);
    }
  }

  function vaultBalance() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
      return s.vSdex + s.userInfo[0][address(this)].tokenData[0].amount - s.tokenRewardData[address(this)].penalties;
  }
  
  function vSdex() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vSdex;
  }
  function vTreasury() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vTreasury;
  }

  function vUserInfo(address user) public view returns (VaultUserInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vUserInfo[user];
  }

  function vTotalShares() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vTotalShares;
  }
  function vShares(address user) public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vShares[user];
  }

  function vCallFee() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vCallFee;
  }

  function vPerformanceFee() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vPerformanceFee;
  }

}
