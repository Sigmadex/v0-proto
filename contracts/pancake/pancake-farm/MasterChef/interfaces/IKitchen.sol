pragma solidity 0.8.7;

interface IKitchen {
  function updatePool(uint256 _pid) external;
  function updateStakingPool() external;
  function massUpdatePools() external;
  function safeCakeTransfer(address _to, uint256 _amount) external;
  function emergencyWithdraw(uint256 _pid) external;

}
