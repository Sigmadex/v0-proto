pragma solidity 0.8.9;

interface ISDEXReward {
  function rewardNFT(address _to, address _token, uint256 _amount) external;
  function _beforeDeposit(address sender, uint256 _pid, uint256[] memory _amounts, uint256 _timeStake, uint256 _nftid) external; 
  function _afterDeposit(address sender, uint256 _pid, uint256[] memory _amounts, uint256 _timeStake, uint256 _nftid) external;
  //function _beforeUpdate() external; 
  //function _afterUpdate() external;
  function _beforeWithdraw(address sender, uint256 _pid, uint256 _positionid, uint256 _nftid) external; 
  function _afterWithdraw(address sender, uint256 _pid, uint256 _positionid, uint256 _nftid) external;
  function getBalanceOf(address _account, uint256 _nftid) external view returns (uint256);
}
