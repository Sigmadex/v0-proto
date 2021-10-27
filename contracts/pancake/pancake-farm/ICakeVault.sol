pragma solidity 0.8.9;


interface ICakeVault {
  struct UserPosition {
    uint256 timeStart;
    uint256 timeEnd;
    uint256 amount;
    uint256 startBlock;
    address nftReward;
    uint256 nftid;
  }

  struct UserInfo {
    uint256 shares; // number of shares for a user
    uint256 lastDepositedTime; // keeps track of deposited time for potential penalty
    uint256 cakeAtLastUserAction; // keeps track of cake deposited at the last user action
    uint256 lastUserActionTime; // keeps track of the last user action time
    UserPosition[] positions; // tracks users staked for a time period
  }

  function getUserInfo(address _user) external returns (UserInfo memory);
  function totalShares() external returns (uint256);
  function setTotalShares(uint256 _amount) external;
  function setUserInfo(address user, UserInfo memory userInfo) external;
  function available() external returns (uint256);
  function treasury() external returns (address);
  function withdrawFee() external returns (uint256);
  function withdrawFeePeriod() external returns (uint256);
  function balanceOf() external returns (uint256);
}
