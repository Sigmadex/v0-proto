pragma solidity 0.8.9;

interface ICashier {
  function requestReward(address _to, address _token, uint256 _timeAmount) external;
  function requestCakeReward(uint256 _positionStartBlock, uint256 _poolAllocPoint, uint256 _totalAmountShares) external;
}
