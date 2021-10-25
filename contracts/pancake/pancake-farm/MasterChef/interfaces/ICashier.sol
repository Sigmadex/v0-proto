pragma solidity 0.8.9;
import './IMasterPantry.sol';
interface ICashier {
  function requestReward(address _to, address _token, uint256 _timeAmount) external;
  function requestCakeReward(address _to, uint256 _positionStartBlock, uint256 _poolAlloc,  uint256 _totalAmountShares) external;
}
