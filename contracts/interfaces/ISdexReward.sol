pragma solidity 0.8.9;

import { VaultUserInfo, PoolInfo, UserInfo } from '../libraries/LibAppStorage.sol';
import 'contracts/pancake/pancake-farm/ICakeVault.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IMasterPantry.sol';
interface ISdexReward {
  function rewardNFT(address _to, address _token, uint256 _amount) external;
  function withdraw(
    address sender,
    uint256 pid,
    uint256 _positionid) external;
  function withdrawVault(address sender, uint256 positionid) external;
}