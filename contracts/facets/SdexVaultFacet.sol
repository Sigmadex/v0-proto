pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserTokenData, UserInfo, Reward, VaultUserInfo, VaultUserPosition } from '../libraries/LibAppStorage.sol';
import '../interfaces/IERC1155.sol';
import './AutoSdexFarmFacet.sol';
import './SdexFacet.sol';
import './ToolShedFacet.sol';
import './RewardFacet.sol';

/** @title SdexVaultFacet
  * @dev the {SdexVaultFacet} provides additional functionality to the native SDEX pool.  If one stakes their SDEX through here, their tokens are automatically restaked for compounding SDEX.  Insure not to withdrawal your position until the stakeTime expires, or a you will be penalized!
*/
contract SdexVaultFacet {
  event Deposit(address indexed sender, uint256 amount, uint256 shares, uint256 lastDepositedTime);
  event Withdraw(address indexed sender, uint256 amount, uint256 shares);
  event Harvest(address indexed sender, uint256 performanceFee, uint256 callFee);
  event Pause();
  event Unpause();


  /**
    * depositVault deposits ones funds in the SDEX vault, that auto restakes ones earnings to compound their returns.
    * @param amount amount of SDEX to stake in vault
    * @param blocksAhead the amount of blocks in the future a user wants to commit 
    * @param nftReward address of NFT reward to apply to position, address(0) for no NFT
    * @param nftid id of NFT reward to apply, 0 for no NFT
  */ 
  function depositVault(
    uint256 amount,
    uint256 blocksAhead,
    address nftReward,
    uint256 nftid
  ) external   {
    require(amount > 0, "Nothing to deposit");
    AppStorage storage s = LibAppStorage.diamondStorage();

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

    // Hmmmm this might not belong, worth noting
    s.tokenRewardData[address(this)].blockAmountGlobal += amount*blocksAhead;
    
    uint256[] memory amountArray = new uint256[](1);
    amountArray[0] =  currentShares;
    VaultUserPosition memory newPosition = VaultUserPosition({
      amount: amount,
      shares: currentShares,
      startBlock: block.number,
      endBlock: block.number + blocksAhead,
      nftReward: address(0),
      nftid: 0
    });
    if (nftReward != address(0)) {
      // FLAG might now work in diamond //
      require(IERC1155(nftReward).balanceOf(msg.sender, nftid) > 0, "User does not have this nft");
      newPosition.nftReward = nftReward;
      newPosition.nftid = nftid;
    }
    s.vUserInfo[msg.sender].positions.push(newPosition);
    
    earn();

    emit Deposit(msg.sender, amount, currentShares, block.timestamp);
  }

  /**
    * the harvest function can be called by any user to instruct the vault to reinvest any non staked crypto it is currently holding but not in a vault.  User receives a small reward for doing so called the callFee.
  */
  function harvest() external  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    AutoSdexFarmFacet(address(this)).leaveStaking(0);
    uint256 bal = s.vSdex;
    uint256 currentPerformanceFee = bal * s.vPerformanceFee / 10000;
    s.vTreasury += currentPerformanceFee;
    s.vSdex -= currentPerformanceFee;

    uint256 currentCallFee = bal * s.vCallFee / 10000;

    SdexFacet(address(this)).transfer(msg.sender, currentCallFee);
    s.vSdex -= currentCallFee;

    earn();

    s.vLastHarvestedTime = block.timestamp;
    emit Harvest(msg.sender, currentPerformanceFee, currentCallFee);
  }
  
  /**
    * withdrawVault is called by a user to instruct the vault to liquidate their position, premature withdrawals are penalized according to the proportion of the time they have completed.
    * @param positionid the id of the position in question, attained from the positions array in the {UserVaultInfo} struct 
  */
  function withdrawVault(uint256 positionid) public  {
    AppStorage storage s = LibAppStorage.diamondStorage();
    VaultUserInfo storage vUser = s.vUserInfo[msg.sender];
    VaultUserPosition storage position = vUser.positions[positionid];
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
      uint256 shares = position.shares;
      require(shares > 0, "Nothing to withdraw");
      uint256 currentAmount = shares * vaultBalance() / s.vTotalShares;
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
        vUser.sdexAtLastUserAction = vUser.shares * vaultBalance() / s.vTotalShares;
      } else {
        vUser.sdexAtLastUserAction = 0;
      }
      vUser.lastUserActionTime = block.timestamp;
      uint256 blocksAhead = position.endBlock - position.startBlock;
      if (position.endBlock < block.number) {
          SdexFacet(address(this)).transfer(
            msg.sender,
            currentAmount
          );
          s.vSdex -= currentAmount;
          //request nft Reward
          uint256 rewardAmount = RewardFacet(address(this)).requestReward(
            msg.sender, address(this), position.amount*blocksAhead
          );
          s.tokenRewardData[address(this)].blockAmountGlobal -= position.amount * blocksAhead;
          s.tokenRewardData[address(this)].rewarded += rewardAmount;
          s.tokenRewardData[address(this)].penalties -= rewardAmount;
          uint256 accruedSdex = currentAmount - position.amount;
          RewardFacet(address(this)).requestSdexReward(
            msg.sender, position.startBlock, position.endBlock, s.poolInfo[0].allocPoint, accruedSdex
          );

      } else {
          (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
            position.startBlock, position.endBlock, currentAmount
          );

          SdexFacet(address(this)).transfer(
            msg.sender,
            refund
          );
          s.vSdex -= currentAmount;
          s.accSdexPenaltyPool += penalty;
          s.tokenRewardData[address(this)].blockAmountGlobal -= position.amount * blocksAhead;
          s.tokenRewardData[address(this)].penalties += penalty;
      }
      position.amount = 0;
      position.shares = 0;
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
  /**
   * vaultBalance returns the amount of available SDex for the vault to stake in the SDEX pool
   * @return uint256 the amount available for the Sdexvault to stake 
  */
  function vaultBalance() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
      return s.vSdex + s.userInfo[0][address(this)].tokenData[0].amount; //- s.tokenRewardData[address(this)].penalties; //probable need an indicator for other sdex pool here as well
  }
 
  /**
   * returns the amount of Sdex currently held by the SdexVaultFacet.  Diamonds are proxied all under the same address, so a synthetic tally must be kept
   * @return uint256 amount of sdex held by the vault
  */
  function vSdex() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vSdex;
  }
  /**
   * the harvest function also provides a small fee to the SdexVault itself, no plans for this amount are currently of note, though it may pad the penalty pool in the future
   * @return uint256 amount in the vault treasury
  */
  function vTreasury() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vTreasury;
  }
  /**
    * returns the {VaultUserInfo} struct for a user staked in the vault, contains the total amounts staked, as well as their various positions
    * @param user address of user in question
    * @return VaultUserInfo the information pertaining to the user
  */ 
  function vUserInfo(address user) public view returns (VaultUserInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vUserInfo[user];
  }

  /**
    * As users can also manually stake in the SDEX vault, the proportion of ownership of the assets are tallied by the vaultShares, this function returns the total amount of vault shares currently in existance
    * @return uint256 total amount of vault shares
  */
  function vTotalShares() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vTotalShares;
  }
  /**
   * Returns an individuals amount of shares they have on the assets on the vault
   * @param user address of the user in question
   * @return uint256 amount of shares they have on the vault assets
  */
  function vShares(address user) public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vShares[user];
  }

  /**
   * the vault Call Fee determines the proportion (divided by 10000) is multiplied by the total vault assets on harvest to give to the user harvesting.
   * @return uint256 current call Fee (div 10000 for percent)
  */
  function vCallFee() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vCallFee;
  }
  /**
    * the vault performance fee determines the proportion (divided by 10000) is multiplied by the total vault assets on havest to give to the sdex vault itself
    * @return uint256 current Performance Fee (div 10000 for percent) 
  */
  function vPerformanceFee() public view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.vPerformanceFee;
  }

}
