pragma solidity 0.8.7;

interface ICashier {
  function requestReward(address token, uint256 timeAmount) external;
  function requestCakeReward(uint256 _positionStartBlock, uint256 _poolAllocPoint, uint256 _totalAmountShares) external;
}
