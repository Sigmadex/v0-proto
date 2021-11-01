pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, RPAmount, PoolInfo, UserInfo, UserPosition } from '../../libraries/LibAppStorage.sol';
import '../../interfaces/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../RewardFacet.sol';
import '../ToolShedFacet.sol';
import '../SdexVaultFacet.sol';
import '../SdexFacet.sol';
contract ReducedPenaltyFacet is  Modifiers {

  constructor() {
  }

  function rPAddress() public returns (address) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.reducedPenaltyReward;
  }

  function rPReward(
    address to,
    address token,
    uint256 amount
  ) external onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    RPAmount memory reductionAmount = RPAmount({
      token: token,
      amount: amount
    });
    s.rPAmounts[s.rPNextId] = reductionAmount;
    bytes memory data = 'data';
    IERC1155(s.reducedPenaltyReward).mint(to, s.rPNextId, 1, data);
    s.rPNextId++;
  }

  function rPReductionAmount(uint256 id) external returns (RPAmount memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rPAmounts[id];
  }

  function rPWithdraw(uint256 pid, uint256 positionid) public  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    PoolInfo storage pool = s.poolInfo[pid];
    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];
   
    uint256 totalAmountShares = 0;
    //Manage Tokens 
    for (uint j=0; j < user.tokenData.length; j++) {
      IERC20 token = pool.tokenData[j].token;
      uint256 stakeTime = position.timeEnd - position.timeStart;
      totalAmountShares += position.amounts[j]*pool.tokenData[j].accSdexPerShare - user.tokenData[j].rewardDebt;
      if (position.timeEnd < block.timestamp) {
        //past expiry date
        //return tokens
        token.transfer(
          msg.sender,
          position.amounts[j]
        );
        //request nft Reward
        RewardFacet(address(this)).requestReward(
          msg.sender, address(token), stakeTime*position.amounts[j]
        );
      } else {
        (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
          position.timeStart, position.timeEnd, position.amounts[j]
        );
        RPAmount storage rPAmount = s.rPAmounts[position.nftid];
        if (address(token) == rPAmount.token) {
          uint256 bonus = rPAmount.amount;
          if (bonus <= penalty) {
            token.transfer(
              msg.sender,
              bonus
            );
            penalty -=  bonus;
            rPAmount.amount = 0;
          } else {
            // partial refund
            token.transfer(
              msg.sender,
              penalty
            );
            rPAmount.amount -= penalty;
            penalty = 0;
          }
        }
        token.transfer(
          msg.sender,
          refund
        );
        s.tokenRewardData[address(token)].timeAmountGlobal -= position.amounts[j] * stakeTime;
        s.tokenRewardData[address(token)].penalties += penalty;
      }
      user.tokenData[j].amount -= position.amounts[j];
      user.tokenData[j].rewardDebt = user.tokenData[j].amount*pool.tokenData[j].accSdexPerShare;
      pool.tokenData[j].supply -= position.amounts[j];
      position.amounts[j] = 0;
    }

    //Manage SDEX
    uint256 pending = totalAmountShares / s.unity;
    if (pending >0) {
      if (position.timeEnd < block.timestamp) {
        //Past Expiry Date
        SdexFacet(address(this)).transfer(msg.sender, pending);
        RewardFacet(address(this)).requestSdexReward(
          msg.sender, position.startBlock, pool.allocPoint, totalAmountShares
        );
      } 
    }
  }


  function rPWithdrawVault(uint256 positionid) external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];
    UserPosition storage position = vUser.positions[positionid];
    uint256 shares = position.amounts[0];
    require(shares > 0, "Nothing to withdraw");
    uint256 vaultBalance = SdexVaultFacet(address(this)).vaultBalance();
    uint256 currentAmount = shares * vaultBalance / s.vTotalShares;
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
        currentAmount = bal + diff;
      }
    }

    if (vUser.shares > 0) {
      vaultBalance = SdexVaultFacet(address(this)).vaultBalance();
      vUser.sdexAtLastUserAction = vUser.shares * vaultBalance / s.vTotalShares;
    } else {
      vUser.sdexAtLastUserAction = 0;
    }
    vUser.lastUserActionTime = block.timestamp;
    
    uint256 stakeTime = position.timeEnd - position.timeStart;
    if (position.timeEnd < block.timestamp) {
        SdexFacet(address(this)).transfer(
          msg.sender,
          currentAmount
        );
        s.vSdex -= currentAmount;
        //request nft Reward
        uint256 rewardAmount = RewardFacet(address(this)).requestReward(
          msg.sender, address(this), position.amounts[0]*stakeTime
        );

        s.tokenRewardData[address(this)].timeAmountGlobal -= position.amounts[0] * stakeTime;
        s.tokenRewardData[address(this)].rewarded += rewardAmount;
        s.tokenRewardData[address(this)].penalties -= rewardAmount;
    } else {

        (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
          position.timeStart, position.timeEnd, currentAmount
        );
        RPAmount storage rPAmount = s.rPAmounts[position.nftid];
        uint256 bonus = rPAmount.amount;
        if (bonus <= penalty) {
          SdexFacet(address(this)).transfer(
            msg.sender,
            bonus
          );
          s.vSdex -= bonus;
          penalty -=  bonus;
          rPAmount.amount = 0;
        } else {
          // partial refund
          SdexFacet(address(this)).transfer(
            msg.sender,
            penalty
          );
          s.vSdex -= penalty;
          rPAmount.amount -= penalty;
          penalty = 0;
        }

        SdexFacet(address(this)).transfer(
          msg.sender,
          refund
        );

        s.vSdex -= refund;
        s.tokenRewardData[address(this)].timeAmountGlobal -= position.amounts[0] * stakeTime;
        s.tokenRewardData[address(this)].penalties += penalty;

    }
    position.amounts[0] = 0;
  }
}

