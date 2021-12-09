pragma solidity 0.8.10;

import { LibDiamond } from "../libraries/LibDiamond.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

struct TokenRewardData {
  uint256 blockAmountGlobal;
  uint256 rewarded;
  uint256 penalties;
  uint256 paidOut;
}

struct PoolTokenData {
  IERC20 token;
  uint256 supply;
  uint256 accSdexPerShare;
}

struct PoolInfo {
  PoolTokenData[] tokenData;
  uint256 allocPoint;
  uint256 lastRewardBlock;
}

struct UserInfo {
  UserTokenData[] tokenData;
  UserPosition[] positions;
  uint256 lastRewardBlock;
}

struct UserTokenData {
  uint256 amount;
  uint256 totalRewardDebt;
}
struct UserPosition {
  uint256 startBlock;
  uint256 endBlock;
  uint256[] amounts;
  uint256[] rewardDebts;
  address nftReward;
  uint256 nftid;
}

struct VaultUserPosition {
  uint256 startBlock;
  uint256 endBlock;
  uint256 amount;
  uint256 shares;
  address nftReward;
  uint256 nftid;
}

struct VaultUserInfo {
  uint256 shares; // number of shares for a user
  uint256 lastDepositedTime; // keeps track of deposited time for potential penalty
  uint256 sdexAtLastUserAction; // keeps track of cake deposited at the last user action
  uint256 lastUserActionTime; // keeps track of the last user action time
  VaultUserPosition[] positions; // tracks users staked for a time period
}

enum REWARDPOOL{BASE, ACC}

struct RPRAmount {
  address token;
  uint256 amount;
  REWARDPOOL rewardPool;
}

struct IBRAmount {
  address token;
  uint256 amount;
  REWARDPOOL rewardPool;
}

struct RARAmount {
  address token;
  uint256 amount;
  REWARDPOOL rewardPool;
}

struct Reward{
  // Withdraw fn
  // Withdraw Vault fn
  bytes4 withdrawSelector;
  bytes4 vaultWithdrawSelector;
  bytes4 rewardSelector;
}

/** @title AppStorage
  * @dev centralized storage
  * @struct AppStorage does stuff
  * @param unity something
*/
struct AppStorage {
  //Farm
  uint256 unity;
  mapping (address => TokenRewardData) tokenRewardData;
  uint256 accSdexPenaltyPool;
  uint256 accSdexRewardPool;
  uint256 accSdexPaidOut;
  mapping (uint256 => mapping (address => UserInfo)) userInfo; 
  uint256 poolLength;
  mapping(uint256 => PoolInfo) poolInfo;
  //address devAddress;
  uint256 sdexPerBlock;
  uint256 BONUS_MULTIPLIER;
  uint256 totalAllocPoint;
  uint256 startBlock;
  //uint256 sdexRewarded;

  //SDEX
  mapping(address => uint256) sdexBalances;
  mapping(address => mapping(address => uint256))  sdexAllowances;
  uint256 sdexTotalSupply;

  string sdexName;
  string sdexSymbol;
  uint8 sdexDecimals;

  uint256 vSdex;
  //Vault Shares
  //mapping(address => uint256) vShares;
  //mapping(address => mapping(address => uint256))  vAllowances;
  //uint256 vSharesTotalSupply;

  //string vSharesName;
  //string vSharesSymbol;
  //uint8 vSharesDecimals;

  //Vault
  mapping(address => VaultUserInfo) vUserInfo;

  uint256 vTotalShares;
  uint256 vLastHarvestedTime;
  uint256 vTreasury;

  uint256 vMAX_PERFORMANCE_FEE; // 5%
  uint256 vMAX_CALL_FEE; // 1%

  uint256 vPerformanceFee; // 2%
  uint256 vCallFee; // 0.25%

  // NFT
  // Can this NFT be applied to this pool
  // poolid => nftaddr ==> bool? O(1) Lookup

  // Testing Enumerable Set
  mapping (uint256 => EnumerableSet.AddressSet) setValidNFTsForPool;

  // Valid rewards for token
  // Can this NFT be minted for this Token?
  // Token addr => valid NFT rewards
  mapping (address => address[]) validRewards;
  
  // NFT Reward addres to reward struct
  mapping (address => Reward) rewards;
  uint256 seed;
  uint256 seedNext;
  uint256 seedMax;
  
  //Reduced Penalty Reward
  address reducedPenaltyReward;
  // ?
  mapping(uint256 => RPRAmount)  rPRAmounts;
  uint256 rPRNextId;

  //Increased Block Reward
  address increasedBlockReward;
  mapping (uint256 => IBRAmount) iBRAmounts;
  uint256 iBRNextId;

  //Reward Amplifier Reward
  address rewardAmplifierReward;
  mapping (uint256 => RARAmount) rARAmounts;
  uint256 rARNextId;

}

/** @title LibAppStorage
* @dev LibAppStorage defines the internal state of Sigmadex.  Is appended to over time as new functionalities requiring new state are added
*/
library LibAppStorage {
  function diamondStorage() internal pure returns (AppStorage storage ds) {
    assembly {
      ds.slot := 0
    }
  }

  function abs(int256 x) internal pure returns (uint256) {
    return uint256(x >= 0 ? x : -x);
  }
}

contract Modifiers {
  modifier onlyDiamond() {
    require(msg.sender == address(this), "LibAppStorage: Caller Must be Diamond");
    _;
  }
  modifier onlyOwner {
    LibDiamond.enforceIsContractOwner();
    _;
  }
}

