pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, RPAmount, PoolInfo, UserInfo, UserPosition } from '../../libraries/LibAppStorage.sol';
import '../../interfaces/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../RewardFacet.sol';
import '../ToolShedFacet.sol';

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


  function rPWithdrawVault(address sender, uint256 positionid) external onlyDiamond {
    /*
    uint256 totalShares = cakeVault.totalShares();
    uint256 shares = user.positions[_positionid].amount;
    ICakeVault.UserPosition memory currentPosition = user.positions[_positionid];
    require(shares > 0, "Nothing to withdraw");
    require(shares <= user.shares, "Withdraw amount exceeds balance");
    uint256 currentAmount = (cakeVault.balanceOf() * shares) / totalShares;
    user.shares -= shares;
    totalShares -= shares;

    uint256 bal = cakeVault.available();
    if (bal < currentAmount) {
      uint256 balWithdraw = currentAmount - (bal);
      autoCakeChef.leaveStakingCakeVault(balWithdraw);
      uint256 balAfter = cakeVault.available();
      //theoretical
      uint256 diff = balAfter - (bal);
      if (diff < balWithdraw) {
        currentAmount = bal + (diff);
      }
    }
    if (block.timestamp < user.lastDepositedTime + (cakeVault.withdrawFeePeriod())) {
      uint256 currentWithdrawFee = currentAmount * (cakeVault.withdrawFee()) / (10000);
      cake.transferFrom(address(cakeVault), cakeVault.treasury(), currentWithdrawFee);
      currentAmount = currentAmount - (currentWithdrawFee);
    }
    if (user.shares > 0) {
      user.cakeAtLastUserAction = user.shares * (cakeVault.balanceOf()) / (totalShares);
    } else {
      user.cakeAtLastUserAction = 0;
    }

    user.lastUserActionTime = block.timestamp;
    uint256 timeAmount = (currentPosition.amount*(currentPosition.timeEnd - currentPosition.timeStart));
    if ( block.timestamp >= user.positions[_positionid].timeEnd) {
      cashier.requestReward(
        userAddr,
        address(cake),
        timeAmount
      );
      cake.transferFrom(address(cakeVault), userAddr, currentAmount);
    } else {
        uint256 bonus = reductionAmounts[currentPosition.nftid].amount;
        (uint256 refund, uint256 penalty) = cookBook.calcRefund(
          currentPosition.timeStart,
          currentPosition.timeEnd,
          currentAmount
        );
        if (bonus <= penalty) {
          cake.safeTransferFrom(
            address(nftRewards),
            userAddr,
            bonus
          );
          penalty -=  bonus;
          reductionAmounts[currentPosition.nftid].amount = 0;
        } else {
          
          cake.safeTransferFrom(
            address(nftRewards),
            userAddr,
            penalty
          );
          reductionAmounts[currentPosition.nftid].amount -= penalty;
          penalty = 0;
        }
        cake.transferFrom(
          address(cakeVault),
          address(msg.sender),
          refund
        );
        cake.transferFrom(
          address(cakeVault),
          address(cashier),
          penalty
        );
    }
    masterPantry.subTimeAmountGlobal(
      address(cake),
      timeAmount
    );
    currentPosition.amount = 0;
    user.positions[_positionid] = currentPosition;
    cakeVault.setUserInfo(userAddr, user);
    cakeVault.setTotalShares(totalShares);
    emit Withdraw(sender, positionid);
   */
  }
}

