pragma solidity 0.8.9;

interface IKitchen {
  function updatePool(uint256 _pid) external;
  function updateStakingPool() external;
  function massUpdatePools() external;
  function safeCakeTransfer(address _to, uint256 _amount) external;
  function emergencyWithdraw(uint256 _pid) external;
  function getMultiplier(uint256 _from, uint256 _to) external view returns (uint256);
}
