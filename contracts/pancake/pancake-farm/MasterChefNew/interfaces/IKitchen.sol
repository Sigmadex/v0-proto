pragma solidity 0.8.7;

interface IKitchen {
  function updatePool(uint256 _pid) external;
  function updateStakingPool() external;
  function massUpdatePools() external;
  function safeCakeTransfer(address _to, uint256 _amount) external;
	function calcRefund(uint256 timeStart, uint256 timeEnd, uint256 amount) external returns (uint256 refund, uint256 penalty);

}
