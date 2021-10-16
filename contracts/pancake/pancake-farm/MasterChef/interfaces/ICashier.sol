pragma solidity 0.8.7;

interface ICashier {
  function requestReward(address token, uint256 timeAmount) external;
}
