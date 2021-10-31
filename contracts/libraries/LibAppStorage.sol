pragma solidity 0.8.9;

import { LibDiamond } from "../libraries/LibDiamond.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
struct TokenRewardData {
  uint256 timeAmountGlobal;
  uint256 rewarded;
  uint256 penalties;
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
  uint256 rewardDebt;
}
struct UserPosition {
  uint256 timeStart;
  uint256 timeEnd;
  uint256 startBlock;
  uint256[] amounts;
  address nftReward;
  uint256 nftid;
}


struct VaultUserInfo {
  uint256 shares; // number of shares for a user
  uint256 lastDepositedTime; // keeps track of deposited time for potential penalty
  uint256 sdexAtLastUserAction; // keeps track of cake deposited at the last user action
  uint256 lastUserActionTime; // keeps track of the last user action time
  UserPosition[] positions; // tracks users staked for a time period
}

struct RPAmount {
  address token;
  uint256 amount;
}

struct Reward{
  // Withdraw fn
  // Withdraw Vault fn
  bytes4 withdrawSelector;
  bytes4 vaultWithdrawSelector;
  bytes4 rewardSelector;
}
struct AppStorage {
  //Farm
  uint256 unity;
  mapping (address => TokenRewardData) tokenRewardData;
  mapping (uint256 => mapping (address => UserInfo)) userInfo; 
  uint256 poolLength;
  mapping(uint256 => PoolInfo) poolInfo;
  address devAddress;
  uint256 sdexPerBlock;
  uint256 BONUS_MULTIPLIER;
  uint256 totalAllocPoint;
  uint256 startBlock;
  uint256 sdexRewarded;

  //SDEX
  mapping(address => uint256) sdexBalances;
  mapping(address => mapping(address => uint256))  sdexAllowances;
  uint256 sdexTotalSupply;

  string sdexName;
  string sdexSymbol;
  uint8 sdexDecimals;

  //Vault Shares
  mapping(address => uint256) vSharesBalances;
  mapping(address => mapping(address => uint256))  vSharesAllowances;
  uint256 vSharesTotalSupply;

  string vSharesName;
  string vSharesSymbol;
  uint8 vSharesDecimals;

  //Vault
  mapping(address => VaultUserInfo) vaultUserInfo;

  uint256 vaultTotalShares;
  uint256 lastHarvestedTime;
  address treasury;

  uint256 MAX_PERFORMANCE_FEE; // 5%
  uint256 MAX_CALL_FEE; // 1%
  uint256 MAX_WITHDRAW_FEE; // 1%
  uint256 MAX_WITHDRAW_FEE_PERIOD; // 3 days

  uint256 performanceFee; // 2%
  uint256 callFee; // 0.25%
  uint256 withdrawFee; // 0.1%
  uint256 withdrawFeePeriod; // 3 days

  // NFT
  // Token addr => valid NFT rewards
  mapping (address => address[]) validRewards;
  // NFT Reward addres to reward struct
  mapping (address => Reward) rewards;
  uint256 seed;
  //Reduced Penalty Reward
  address reducedPenaltyReward;
  // ?
  mapping(uint256 => RPAmount)  rPAmounts;
  uint256 rPNextId;

}


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

