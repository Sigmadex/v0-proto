pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, RPAmount, PoolInfo, UserInfo, UserPosition, REWARDPOOL } from '../../libraries/LibAppStorage.sol';
import '../../interfaces/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../RewardFacet.sol';
import '../ToolShedFacet.sol';
import '../SdexVaultFacet.sol';
import '../SdexFacet.sol';

/**
  * @title ReducedPenaltyFacet
  * @dev The {ReducedPenaltyFacet}  implements the custom reward,withdraw, vaultWithdraw logic for the {ReducedPenaltyReward} NFT.    
*/
contract ReducedPenaltyFacet is  Modifiers {

  constructor() {
  }
  /**
    * the reduced Penalty Address is the address of the NFT
    * @return address location of NFT on blockchain
  */
  function rPAddress() public returns (address) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.reducedPenaltyReward;
  }

  /**
  * reduced penalty reward is charged with minting the NFT and updating the diamonds internal state relative to this NFT.
  * @param to address of the user receiving the reward
  * @param token the underlying asset the reduced penalty provides (eg USDT)
  * @param amount the amount of the underlying asset that the NFT can reduce
  */
  function rPReward(
    address to,
    address token,
    uint256 amount,
    REWARDPOOL rewardPool
    
  ) external onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    RPAmount memory reductionAmount = RPAmount({
      token: token,
      amount: amount,
      rewardPool: rewardPool 
    });
    s.rPAmounts[s.rPNextId] = reductionAmount;
    bytes memory data = 'data';
    IERC1155(s.reducedPenaltyReward).mint(to, s.rPNextId, 1, data);
    s.rPNextId++;
  }

  /**
  * returns {RPAmount} for the nft id in question
  * @param id the nft id 
  * @return RPAmount the amount of reduction it can provide in what token
  */
  function rPReductionAmount(uint256 id) external returns (RPAmount memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rPAmounts[id];
  }
  
  /**
  * reduced Penalty Withdraw substitutes for the withdraw function of {TokenFarm} when withdrawing a {UserPosition} that has the {ReducedPenaltyReward} nft address associated with it.  Provides compensating the user the reduction amount in the even of an early withdraw
  * @param pid the poolid of the pool in question
  * @param positionid the position id in question, retreived from the array postion of {UserInfo}
  */
  function rPWithdraw(uint256 pid, uint256 positionid) public  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    PoolInfo storage pool = s.poolInfo[pid];
    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];
   
    uint256 totalAmountShares = 0;
    //Manage Tokens 
    for (uint j=0; j < user.tokenData.length; j++) {
      IERC20 token = pool.tokenData[j].token;
      uint256 blocksAhead = position.endBlock - position.startBlock;
      totalAmountShares += position.amounts[j]*pool.tokenData[j].accSdexPerShare - user.tokenData[j].rewardDebt;
      
      if (position.endBlock < block.number) {
        //past expiry date
        //return tokens
        token.transfer(
          msg.sender,
          position.amounts[j]
        );
        //request nft Reward
        RewardFacet(address(this)).requestReward(
          msg.sender, address(token), blocksAhead*position.amounts[j]
        );
      } else {
        (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
          position.startBlock, position.endBlock, position.amounts[j]
        );
        RPAmount storage rPAmount = s.rPAmounts[position.nftid];
        if (address(token) == rPAmount.token) {
          uint256 bonus = rPAmount.amount;
          if (bonus <= penalty) {
            console.log('hi');
            token.transfer(
              msg.sender,
              bonus
            );
            penalty -=  bonus;
            rPAmount.amount = 0;
            if (rPAmount.rewardPool == REWARDPOOL.BASE) {
              s.tokenRewardData[address(token)].paidOut += bonus;
              s.tokenRewardData[address(token)].rewarded -= bonus;
            } else {
              s.accSdexRewardPool -= bonus;
              s.accSdexPaidOut += bonus;
            }
          } else {
            // partial refund
            token.transfer(
              msg.sender,
              penalty
            );
            rPAmount.amount -= penalty;

            if (rPAmount.rewardPool == REWARDPOOL.BASE) {
              s.tokenRewardData[address(token)].rewarded -= penalty;
              s.tokenRewardData[address(token)].paidOut += penalty;
            } else {
              s.accSdexRewardPool -= penalty;
              s.accSdexPaidOut += penalty;
            }
            penalty = 0;
          }
        }
        token.transfer(
          msg.sender,
          refund
        );
        s.tokenRewardData[address(token)].blockAmountGlobal -= position.amounts[j] * blocksAhead;
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
      if (position.endBlock < block.number) {
        //Past Expiry Date
        SdexFacet(address(this)).transfer(msg.sender, pending);
        RewardFacet(address(this)).requestSdexReward(
          msg.sender, position.startBlock, position.endBlock, pool.allocPoint, pending
        );
      } else {
        s.accSdexPenaltyPool += pending;
      }
    }
  }


  /**
  * reduced Penalty Withdraw vaults substitutes the withdrawVault function in {SdexVaultFacet} in the event the {UserPosition} in {VaultUserInfo} has the reduced penalty nft address associated with it
  * @param positionid the id of the associated position, found in the {UserPosition} array length - 1 of {VaultUserInfo} 
  */
  function rPWithdrawVault(uint256 positionid) external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];
    VaultUserPosition storage position = vUser.positions[positionid];
    require(position.shares > 0, "Nothing to withdraw");
    uint256 vaultBalance = SdexVaultFacet(address(this)).vaultBalance();
    uint256 currentAmount = position.shares * vaultBalance / s.vTotalShares;
    vUser.shares -= position.shares;
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
      vaultBalance = SdexVaultFacet(address(this)).vaultBalance();
      vUser.sdexAtLastUserAction = vUser.shares * vaultBalance / s.vTotalShares;
    } else {
      vUser.sdexAtLastUserAction = 0;
    }
    vUser.lastUserActionTime = block.timestamp;
    
    uint256 blocksAhead = position.endBlock - position.startBlock;
    uint256 accruedSdex = currentAmount - position.amount;
    if (position.endBlock < block.number) {
        SdexFacet(address(this)).transfer(
          msg.sender,
          currentAmount
        );
        s.vSdex -= currentAmount;
        //request nft Reward
        RewardFacet(address(this)).requestReward(
          msg.sender, address(this), position.amount*blocksAhead
        );

        // experimental
        RewardFacet(address(this)).requestSdexReward(
          msg.sender, position.startBlock, position.endBlock, s.poolInfo[0].allocPoint, accruedSdex
        );

    } else {
        (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
          position.startBlock, position.endBlock, position.amount
        );
        (uint256 refundAcc, uint256 penaltyAcc) = ToolShedFacet(address(this)).calcRefund(
          position.startBlock, position.endBlock, accruedSdex
        );
        // Perhaps it should be lose all Acc
        RPAmount storage rPAmount = s.rPAmounts[position.nftid];
        uint256 bonus = rPAmount.amount;
        if (bonus <= penalty) {
          console.log('=======bonus rPVault======');
          SdexFacet(address(this)).transfer(
            msg.sender,
            bonus
          );
          penalty -=  bonus;
          rPAmount.amount = 0;
          if (rPAmount.rewardPool == REWARDPOOL.BASE) {
            s.tokenRewardData[address(this)].rewarded -= bonus;
            s.tokenRewardData[address(this)].paidOut += bonus;
          } else {
            s.accSdexRewardPool -= bonus;
            s.accSdexPaidOut += bonus;
          }
        } else {
          // partial refund
          SdexFacet(address(this)).transfer(
            msg.sender,
            penalty
          );
          //s.vSdex -= penalty;
          rPAmount.amount -= penalty;

          if (rPAmount.rewardPool == REWARDPOOL.BASE) {
            s.tokenRewardData[address(this)].rewarded -= penalty;
            s.tokenRewardData[address(this)].paidOut += penalty;
          } else {
            s.accSdexRewardPool -= penalty;
            s.accSdexPaidOut += penalty;
          }
          penalty = 0;
        }

        SdexFacet(address(this)).transfer(
          msg.sender,
          refund
        );
        //s.vSdex -= refund;
        s.vSdex -= currentAmount;
        s.tokenRewardData[address(this)].blockAmountGlobal -= position.amount * blocksAhead;
        console.log('scope test2', penalty);
        s.tokenRewardData[address(this)].penalties += penalty;
        s.accSdexPenaltyPool += penaltyAcc + refundAcc;
        

    }
    position.amount = 0;
    position.shares = 0;
  }
}

