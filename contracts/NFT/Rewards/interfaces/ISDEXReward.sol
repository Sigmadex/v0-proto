pragma solidity 0.8.9;

import 'contracts/pancake/pancake-farm/ICakeVault.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IMasterPantry.sol';
interface ISDEXReward {
  function rewardNFT(address _to, address _token, uint256 _amount) external;
  function _withdraw(
    address sender,
    uint256 pid,
    IMasterPantry.PoolInfo memory poolInfo,
    IMasterPantry.UserInfo memory userInfo,
    uint256 _positionid) external;
  function _withdrawCakeVault(address _sender, ICakeVault.UserInfo memory userInfo, uint256 _positionid) external;
  function getBalanceOf(address _account, uint256 _nftid) external view returns (uint256);
}
