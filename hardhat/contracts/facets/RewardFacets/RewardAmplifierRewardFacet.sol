pragma solidity 0.8.10;

import { TokenRewardData, AppStorage, LibAppStorage, Modifiers, RARAmount, PoolInfo, UserInfo, UserPosition, REWARDPOOL } from '../../libraries/LibAppStorage.sol';
import '../../interfaces/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../RewardFacet.sol';
import '../ToolShedFacet.sol';
import '../SdexVaultFacet.sol';
import '../SdexFacet.sol';

/**
 * @title RewardAmplifierFacet
 * @dev The {RewardAmplifierFacet}  implements the custom reward,withdraw, vaultWithdraw logic for the {RewardAmplifier} NFT.    
 */
contract RewardAmplifierRewardFacet is  Modifiers {
  event RewardNFT(address to, address token, uint256 amount);
  event WithdrawVault(address indexed sender, uint256 amount, uint256 shares);
  constructor() {
  }

  /**
   * the multiplier Address is the address of the NFT
   * @return address location of NFT on blockchain
   */
  function rARAddress() public returns (address) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rewardAmplifierReward;
  }
  /*
  * Return the next id to be minted of this nft class, thus number -1 can be thought of as total supply
  * @return uint256 the next id to be consumed
   */
  function rARNextId() public returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rARNextId;
  }

  function rARAmount(uint256 nftid) public returns (RARAmount memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rARAmounts[nftid];
  }

  function rARReward(
    address to,
    address token,
    uint256 amount,
    REWARDPOOL rewardPool

  ) external onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    RARAmount memory amplificationAmount = RARAmount({
      token: token,
      amount: amount,
      rewardPool: rewardPool 
    });
    s.rARAmounts[s.rARNextId] = amplificationAmount;
    bytes memory data = 'data';
    IERC1155(s.rewardAmplifierReward).mint(to, s.rARNextId, 1, data);
    s.rARNextId++;
    emit RewardNFT(to, token, amount);
  }

  function reqReward(address to, address token, uint256 timeAmount, uint256 bonus) private {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData storage tokenRewardData = s.tokenRewardData[token];

    uint256 proportio = timeAmount * s.unity / tokenRewardData.timeAmountGlobal;
    uint256 rewardAmount = proportio * tokenRewardData.penalties / s.unity;
    s.tokenRewardData[address(token)].timeAmountGlobal -= timeAmount;
    //s.tokenRewardData[address(token)].rewarded += rewardAmount + bonus;
    s.tokenRewardData[address(token)].rewarded += rewardAmount;
    s.tokenRewardData[address(token)].penalties -= rewardAmount;
    RewardFacet(address(this)).mintReward(to, token, rewardAmount + bonus, REWARDPOOL.BASE);
  }

  function reqSdexReward(
    address to,
    uint256 startTime,
    uint256 endTime,
    uint256 poolAllocPoint,
    uint256 amountAccumulated,
    uint256 bonus
  ) private {
    AppStorage storage s = LibAppStorage.diamondStorage();
    TokenRewardData memory tokenRewardData = s.tokenRewardData[address(this)];

    // totalSdexEmission
    //uint256 timeStaked = endTime - startTime;
    // sdex emission
    uint256 multiplier = ToolShedFacet(address(this)).getMultiplier(startTime, block.timestamp);
    uint256 totalSdexEmission = (multiplier * s.sdexPerMinute);
    uint256 sdexEmittedForPool = totalSdexEmission * poolAllocPoint / s.totalAllocPoint;
    uint256 proportion = amountAccumulated * s.unity / sdexEmittedForPool;
    if (amountAccumulated > sdexEmittedForPool) {
      // odd edge case bug when single user is 100 percent of pool withdrawing between 1-3 blocks after endTime
      proportion = s.unity;
    }
    uint256 reward = proportion * s.accSdexPenaltyPool / s.unity;
    s.accSdexPenaltyPool -= reward;
    s.accSdexRewardPool += reward;
    RewardFacet(address(this)).mintReward(to, address(this), reward + bonus, REWARDPOOL.ACC);
  }


  function rARWithdraw(uint256 pid, uint256 positionid) public  {
    AppStorage storage s = LibAppStorage.diamondStorage();

    ToolShedFacet(address(this)).updatePool(pid);

    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];

    IERC1155(s.rewardAmplifierReward).incrementActive(position.nftid, false);

    PoolInfo storage pool = s.poolInfo[pid];

    uint256 totalAmountShares = 0;
    //Manage Tokens 

    RARAmount storage rewardAmount = s.rARAmounts[position.nftid];
    for (uint j=0; j < user.tokenData.length; j++) {

      IERC20 token = pool.tokenData[j].token;
      //uint256 stakeTime = position.timeEnd - position.timeStart;
      uint256 timeStaked = position.endTime - position.startTime;
      totalAmountShares += (position.amounts[j]*pool.tokenData[j].accSdexPerShare - position.rewardDebts[j]);
      if (position.endTime <= block.timestamp) {
        //past expiry date
        //return tokens
        token.transfer(
          address(msg.sender),
          position.amounts[j]
        );
        //request nft Reward
        if (rewardAmount.token == address(token) && rewardAmount.rewardPool == REWARDPOOL.BASE) {
          reqReward(msg.sender, address(token), timeStaked*position.amounts[j], rewardAmount.amount);
          rewardAmount.amount = 0;
          // just gets readded in rARRequest, commenting for reminder but saving gas
          //s.tokenRewardData[address(token)].rewarded -= rewardAmount.amount;
          //s.tokenRewardData[address(token)].paidOut += rewardAmount.amount;

        } else {
          RewardFacet(address(this)).requestReward(
            msg.sender, address(token), timeStaked*position.amounts[j]
          );
        }
      } else {
        (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
          position.startTime, position.endTime, position.amounts[j]
        );
        token.transfer(
          msg.sender,
          refund
        );
        s.tokenRewardData[address(token)].timeAmountGlobal -= position.amounts[j] * timeStaked;
        s.tokenRewardData[address(token)].penalties += penalty;
      }
      user.tokenData[j].amount -= position.amounts[j];
      user.tokenData[j].totalRewardDebt = user.tokenData[j].amount*pool.tokenData[j].accSdexPerShare;
      pool.tokenData[j].supply -= position.amounts[j];
      position.amounts[j] = 0;
      position.rewardDebts[j] = 0;
    }

    //Manage SDEX
    uint256 pending = totalAmountShares / s.unity;
    if (pending >0) {
      if (position.endTime <= block.timestamp) {
        //Past Expiry Date
        SdexFacet(address(this)).transfer(msg.sender, pending);

        if (rewardAmount.token == address(this) && rewardAmount.rewardPool == REWARDPOOL.ACC) {
          reqSdexReward(msg.sender, position.startTime, position.endTime, pool.allocPoint, pending, rewardAmount.amount);
          rewardAmount.amount = 0;
          //s.accSdexRewardPool -= rewardAmount.amount;
          //s.accSdexPaidOut += rewardAmount.amount;
        } else {
          RewardFacet(address(this)).requestSdexReward(
            msg.sender, position.startTime, position.endTime, pool.allocPoint, pending
          );
        }
      } else {
        s.accSdexPenaltyPool += pending;
      }
    }
  }


  function rARWithdrawVault(uint256 positionid) external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];
    VaultUserPosition storage position = vUser.positions[positionid];
    uint256 shares = position.shares;
    require(position.shares > 0, "Nothing to withdraw");

    IERC1155(s.rewardAmplifierReward).incrementActive(position.nftid, false);
    console.log('RAR::vault::nftid', position.nftid);
    //uint256 vaultBalance = SdexVaultFacet(address(this)).vaultBalance();
    uint256 currentAmount = position.shares * SdexVaultFacet(address(this)).vaultBalance() / s.vTotalShares;
    vUser.shares -= position.shares;
    // what if currentAmount?
    s.vTotalShares -= position.shares;

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
      vUser.sdexAtLastUserAction = vUser.shares *  SdexVaultFacet(address(this)).vaultBalance()/ s.vTotalShares;
    } else {
      vUser.sdexAtLastUserAction = 0;
    }
    vUser.lastUserActionTime = block.timestamp;
    uint256 timeStaked = position.endTime - position.startTime;
    uint256 accruedSdex = currentAmount - position.amount;
    if (position.endTime <= block.timestamp) {
      RARAmount storage rewardAmount = s.rARAmounts[position.nftid];
      SdexFacet(address(this)).transfer(
        msg.sender,
        currentAmount
      );
      s.vSdex -= currentAmount;
      //request nft Reward

      if (rewardAmount.rewardPool == REWARDPOOL.BASE) {
        reqReward(msg.sender, address(this), position.amount*timeStaked, rewardAmount.amount);
        //s.tokenRewardData[address(this)].rewarded -= rewardAmount.amount;
        //s.tokenRewardData[address(this)].paidOut += rewardAmount.amount;
        rewardAmount.amount = 0;
        RewardFacet(address(this)).requestSdexReward(
          msg.sender, position.startTime, position.endTime, s.poolInfo[0].allocPoint, accruedSdex
        );
      } else if (rewardAmount.rewardPool == REWARDPOOL.ACC) {
        RewardFacet(address(this)).requestReward(
          msg.sender, address(this), position.amount * timeStaked
        );
        reqSdexReward(msg.sender, position.startTime, position.endTime, s.poolInfo[0].allocPoint, accruedSdex, rewardAmount.amount);
        //s.accSdexRewardPool -= rewardAmount.amount;
        //s.accSdexPaidOut += rewardAmount.amount;
        rewardAmount.amount = 0;
      }
    } else {
      (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
        position.startTime, position.endTime, position.amount
      );
      (uint256 refundAcc, uint256 penaltyAcc) = ToolShedFacet(address(this)).calcRefund(
        position.startTime, position.endTime, accruedSdex
      );

      SdexFacet(address(this)).transfer(
        msg.sender,
        refund
      );
      s.vSdex -= currentAmount;

      s.accSdexPenaltyPool += penaltyAcc + refundAcc;
      s.tokenRewardData[address(this)].timeAmountGlobal -= position.amount * timeStaked;
      s.tokenRewardData[address(this)].penalties += penalty;
    }
    position.amount = 0;
    position.shares = 0;
    emit WithdrawVault(msg.sender, currentAmount, shares);
  }

}
