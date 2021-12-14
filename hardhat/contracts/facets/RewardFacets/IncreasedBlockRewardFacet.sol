
pragma solidity 0.8.10;

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
  event RewardNFT(address to, address token, uint256 amount);
  event WithdrawVault(address indexed sender, uint256 amount, uint256 shares);
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
   * Return the next id to be minted of this nft class, thus number -1 can be thought of as total supply
   * @return uint256 the next id to be consumed
   */
  function iBRNextId() public returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.iBRNextId;
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
    console.log('iBRReward::reward::test');
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
    emit RewardNFT(to, token, amount);
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
    ToolShedFacet(address(this)).updatePool(pid);

    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];

    IERC1155(s.increasedBlockReward).incrementActive(position.nftid, false);

    PoolInfo storage pool = s.poolInfo[pid];
    uint256 totalAmountShares = 0;
    //Manage Tokens 
    uint256 timeElapsed = block.timestamp - position.startTime;
    for (uint j=0; j < user.tokenData.length; j++) {
      IERC20 token = pool.tokenData[j].token;
      uint256 stakeTime = position.endTime - position.startTime;
      totalAmountShares += (position.amounts[j]*pool.tokenData[j].accSdexPerShare - position.rewardDebts[j]);
      if (position.endTime <= block.timestamp) {
        //past expiry date
        //return tokens
        token.transfer(
          address(msg.sender),
          position.amounts[j]
        );
        //request nft Reward
        RewardFacet(address(this)).requestReward(
          msg.sender, address(token), stakeTime*position.amounts[j]
        );
      } else {
        (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
          position.startTime, position.endTime, position.amounts[j]
        );
        token.transfer(
          msg.sender,
          refund
        );
        s.tokenRewardData[address(token)].timeAmountGlobal -= position.amounts[j] * stakeTime;
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
    uint256 bonus = calcBonus(pending, position.startTime, position.nftid);
    pending += bonus;

    if (pending >0) {
      if (position.endTime <= block.timestamp) {
        //Past Expiry Date
        SdexFacet(address(this)).transfer(msg.sender, pending);
        RewardFacet(address(this)).requestSdexReward(
          msg.sender, position.startTime, position.endTime, pool.allocPoint, pending
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
    
    IERC1155(s.increasedBlockReward).incrementActive(position.nftid, false);
    
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
    uint256 stakeTime = position.endTime - position.startTime;
    uint256 accruedSdex = currentAmount - position.amount;
    /*******************/
    uint256 bonus = calcBonus(accruedSdex, position.startTime, position.nftid);
    /*******************/
    if (position.endTime <= block.timestamp) {
      SdexFacet(address(this)).transfer(
        msg.sender,
        currentAmount + bonus
      );
      s.vSdex -= currentAmount;
      //request nft Reward
      RewardFacet(address(this)).requestReward(
        msg.sender, address(this), position.amount*stakeTime
      );
      RewardFacet(address(this)).requestSdexReward(
        msg.sender, position.startTime, position.endTime, s.poolInfo[0].allocPoint, accruedSdex
      );
    } else {
      (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
        position.startTime, position.endTime, position.amount
      );
      (uint256 refundAcc, uint256 penaltyAcc) = ToolShedFacet(address(this)).calcRefund(
        position.startTime, position.endTime, accruedSdex + bonus
      );

      SdexFacet(address(this)).transfer(
        msg.sender,
        refund
      );
      s.vSdex -= currentAmount;

      s.accSdexPenaltyPool += penaltyAcc + refundAcc;
      s.tokenRewardData[address(this)].timeAmountGlobal -= position.amount * stakeTime;
      s.tokenRewardData[address(this)].penalties += penalty;
    }
    position.amount = 0;
    position.shares = 0;
    emit WithdrawVault(msg.sender, currentAmount, shares);
  }


  function calcBonus(
    uint256 accSdex,
    uint256 startTime,
    uint256 nftid

  ) private returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    IBRAmount storage iBRAmount = s.iBRAmounts[nftid];

    uint256 mintsElapsed = (block.timestamp - startTime) / 60;
    console.log('IncreasedBlockRewardFacet::calcBonus::mintsElapsed', mintsElapsed);
    console.log('IncreasedBlockRewardFacet::calcBonus::iBRAmount.amount', iBRAmount.amount);
    uint256 rewardPerMint = accSdex / mintsElapsed;
    // double rewardPerBlock until bonus is gone or left
    uint256 blocksOfBonus = iBRAmount.amount / rewardPerMint ;
    console.log('IncreasedBlockRewardFacet::calcBonus::blocksOfBonus', blocksOfBonus);

    uint256 bonus = 0;
    if (mintsElapsed > blocksOfBonus) {
      bonus =  iBRAmount.amount;
    } else {
      bonus = rewardPerMint * mintsElapsed;
    }
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

