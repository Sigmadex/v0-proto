pragma solidity 0.8.9;

interface ICookBook {
  function pendingCake(uint256 _pid, address _user) external returns (uint256);
  function getMultiplier(uint256 _from, uint256 _to) external returns (uint256); 
	function calcRefund(uint256 timeStart, uint256 timeEnd, uint256 amount) external returns (uint256 refund, uint256 penalty);
}
