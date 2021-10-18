pragma solidity 0.8.9;


interface IAutoCakeChef {
  function leaveStakingCakeVault(uint256 _amount) external;
  function enterStakingCakeVault(uint256 _amount) external;
}
