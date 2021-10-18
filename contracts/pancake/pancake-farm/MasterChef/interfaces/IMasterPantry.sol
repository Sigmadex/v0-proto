pragma solidity 0.8.9;

import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';

import "../../CakeToken.sol";
import "../../SyrupBar.sol";

import "./IMigratorChef.sol";


interface IMasterPantry {
  event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
  event Withdraw(address indexed user, uint256 indexed pid);
  event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256[] amounts);

  struct TokenRewardData {
    uint256 timeAmountGlobal;
    uint256 rewarded;
  }


  struct PoolTokenData {
    IBEP20 token;
    uint256 supply;
    uint256 accCakePerShare;
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
  }
  function poolLength() external view returns (uint256);
  function setPoolLength() external;
  function getPoolInfo(uint256 _pid) external view returns (PoolInfo memory);
  function setPoolInfo(uint256 _pid, PoolInfo calldata _poolInfo) external;
  function addPool(PoolInfo calldata _poolInfo) external;
  function getUserInfo(uint256 _pid, address _user) external view returns (UserInfo memory);
  function setUserInfo(uint256 _pid, address _user, UserInfo calldata _userInfo) external;
  function addPosition(uint256 _pid, address _user, UserPosition memory position) external;
  function BONUS_MULTIPLIER() external view returns (uint256);
  function cakePerBlock() external view returns (uint256);
  function totalAllocPoint() external view returns (uint256);
  function setTotalAllocPoint(uint256 _totalAllocPoint) external;
  function unity() external view returns (uint256);
  function penaltyAddress() external view returns (address);
  function cake() external view returns (CakeToken);
  function syrup() external view returns (SyrupBar);
  function startBlock() external view returns (uint256);
  function migrator() external view returns(IMigratorChef);
  function tokenRewardData(address _token) external view returns (TokenRewardData memory);
  function addTimeAmountGlobal(address _token, uint256 _timeAmount) external;
  function subTimeAmountGlobal(address _token, uint256 _timeAmount) external;
  function cakeRewarded() external view returns (uint256);
  function addCakeRewarded(uint256 _amount) external;
}
