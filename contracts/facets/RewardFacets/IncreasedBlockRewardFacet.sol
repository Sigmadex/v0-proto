
pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, IBRAmount, PoolInfo, UserInfo, UserPosition, REWARDPOOL } from '../../libraries/LibAppStorage.sol';
import '../../interfaces/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../RewardFacet.sol';
import '../ToolShedFacet.sol';
import '../SdexVaultFacet.sol';
import '../SdexFacet.sol';

/**
  * @title IncreasedBlockRewardFacet
  * @dev The {IncreasedBlockRewardFacet}  implements the custom reward,withdraw, vaultWithdraw logic for the {MultiplierReward} NFT.    
*/
contract IncreasedBlockRewardFacet is  Modifiers {
  constructor() {
  }
  /**
    * the multiplier Address is the address of the NFT
    * @return address location of NFT on blockchain
  */
  function iBRAddress() public returns (address) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.increasedBlockReward;
  }

  /**
    * multiplier Reward is charged with minting the multiplier NFT as a reward
    * @param to address of the user receiving the reward
    * @param token the underlying asset the reduced penalty provides (eg USDT)
    * @param amount the amount of the underlying asset that the NFT that can be multipliered too
  */
  function iBRReward(
    address to,
    address token,
    uint256 amount,
    REWARDPOOL rewardPool
    
  ) external onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    IBRAmount memory reductionAmount = IBRAmount({
      token: token,
      amount: amount,
      rewardPool: rewardPool 
    });
    s.iBRAmounts[s.iBRNextId] = reductionAmount;
    bytes memory data = 'data';
    IERC1155(s.increasedBlockReward).mint(to, s.iBRNextId, 1, data);
    s.iBRNextId++;
  }

  /**
    * returns {RPAmount} for the nft id in question
    * @param id the nft id 
    * @return RPAmount the amount of reduction it can provide in what token
  */
  function iBRAmount(uint256 id) external returns (IBRAmount memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.iBRAmounts[id];
  }
  
  /**
    * reduced Penalty Withdraw substitutes for the withdraw function of {TokenFarm} when withdrawing a {UserPosition} that has the {ReducedPenaltyReward} nft address associated with it.  Provides compensating the user the reduction amount in the even of an early withdraw
    * @param pid the poolid of the pool in question
    * @param positionid the position id in question, retreived from the array postion of {UserInfo}
  */
  function iBRWithdraw(uint256 pid, uint256 positionid) public  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    console.log('IncreasedBlockRewardFacet::hello');

    ToolShedFacet(address(this)).updatePool(pid);

    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];

    PoolInfo storage pool = s.poolInfo[pid];
    uint256 totalAmountShares = 0;
    //Manage Tokens 
    uint256 blocksElapsed = block.number - position.startBlock;
    for (uint j=0; j < user.tokenData.length; j++) {
      IERC20 token = pool.tokenData[j].token;
      uint256 blocksAhead = position.endBlock - position.startBlock;
      totalAmountShares += (position.amounts[j]*pool.tokenData[j].accSdexPerShare - position.rewardDebts[j]);
      if (position.endBlock <= block.number) {
        //past expiry date
        //return tokens
        token.transfer(
          address(msg.sender),
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
        token.transfer(
          msg.sender,
          refund
        );
        s.tokenRewardData[address(token)].blockAmountGlobal -= position.amounts[j] * blocksAhead;
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
    uint256 bonus = calcBonus(pending, position.startBlock, position.nftid);
    pending += bonus;

    if (pending >0) {
      if (position.endBlock <= block.number) {
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
  function iBRWithdrawVault(uint256 positionid) external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];
    VaultUserPosition storage position = vUser.positions[positionid];
    uint256 shares = position.shares;
    require(shares > 0, "Nothing to withdraw");
    uint256 vaultBalance = SdexVaultFacet(address(this)).vaultBalance();
    uint256 currentAmount = shares * vaultBalance / s.vTotalShares;
    vUser.shares -= shares;
    // what if currentAmount?
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
    uint256 blocksAhead = position.endBlock - position.startBlock;
    uint256 accruedSdex = currentAmount - position.amount;
    /*******************/
    uint256 bonus = calcBonus(accruedSdex, position.startBlock, position.nftid);
    /*******************/
    if (position.endBlock <= block.number) {
      SdexFacet(address(this)).transfer(
        msg.sender,
        currentAmount + bonus
      );
      s.vSdex -= currentAmount;
      //request nft Reward
      RewardFacet(address(this)).requestReward(
        msg.sender, address(this), position.amount*blocksAhead
      );
      RewardFacet(address(this)).requestSdexReward(
        msg.sender, position.startBlock, position.endBlock, s.poolInfo[0].allocPoint, accruedSdex
      );
    } else {
      (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
        position.startBlock, position.endBlock, position.amount
      );
      (uint256 refundAcc, uint256 penaltyAcc) = ToolShedFacet(address(this)).calcRefund(
        position.startBlock, position.endBlock, accruedSdex + bonus
      );

      SdexFacet(address(this)).transfer(
        msg.sender,
        refund
      );
      s.vSdex -= currentAmount;

      s.accSdexPenaltyPool += penaltyAcc + refundAcc;
      s.tokenRewardData[address(this)].blockAmountGlobal -= position.amount * blocksAhead;
      s.tokenRewardData[address(this)].penalties += penalty;
    }
    position.amount = 0;
    position.shares = 0;
  }


  function calcBonus(
    uint256 accSdex,
    uint256 startBlock,
    uint256 nftid

  ) private returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    IBRAmount storage iBRAmount = s.iBRAmounts[nftid];

    uint256 blocksElapsed = block.number - startBlock;
    uint256 rewardPerBlock = accSdex / blocksElapsed;
    console.log('IBRewardFacet::rewardPerBlock', rewardPerBlock);
    // double rewardPerBlock until bonus is gone or left
    uint256 blocksOfBonus = iBRAmount.amount / rewardPerBlock ;
    console.log('IBRewardFacet::blocksOfBonus', blocksOfBonus);

    uint256 bonus = 0;
    if (blocksElapsed > blocksOfBonus) {
      bonus =  iBRAmount.amount;
    } else {
      bonus = rewardPerBlock * blocksElapsed;
    }
    console.log('IBRewardFacet::bonus', bonus);
    iBRAmount.amount -= bonus;
     
    if (s.iBRAmounts[nftid].rewardPool == REWARDPOOL.BASE) {
      s.tokenRewardData[address(this)].rewarded -= bonus;
      s.tokenRewardData[address(this)].paidOut += bonus;
    } else {
      s.accSdexRewardPool -= bonus;
      s.accSdexPaidOut += bonus;
    }
    return bonus;
  }
}

