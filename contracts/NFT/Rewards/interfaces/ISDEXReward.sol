pragma solidity 0.8.9;

interface ISDEXReward {
  function mint() external;
  function _beforeDeposit() external; 
  function _afterDeposit() external;
  function _beforeUpdate() external; 
  function _afterUpdate() external;
  function _beforeWithdraw() external;
  function _afterWithdraw() external; 
}
