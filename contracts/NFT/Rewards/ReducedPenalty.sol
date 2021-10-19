pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol';
import './interfaces/ISDEXReward.sol';
contract ReducedPenaltyNFT is ERC1155PresetMinterPauser, ISDEXReward {

   
  constructor(
  ) ERC1155PresetMinterPauser("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
  }
  function mint() external {
    
  }
  function _beforeDeposit(
    address sender,
    uint256 _pid,
    uint256[] memory _amounts,
    uint256 _timeStake,
    uint256 _nftid
  ) external {
  }
  function _afterDeposit(
    address sender,
    uint256 _pid,
    uint256[] memory _amounts,
    uint256 _timeStake,
    uint256 _nftid
  ) external {
  }
  /*
  function _beforeUpdate() external {
  }
  function _afterUpdate() external {
  }
 */
  function _beforeWithdraw(address sender, uint256 _pid, uint256 _positionid, uint256 _nftid) external {}
  function _afterWithdraw(address sender, uint256 _pid, uint256 _positionid, uint256 _nftid) external {}


  function getBalanceOf(address _account, uint256 _nftid) external view returns (uint256) {
    return balanceOf(_account, _nftid);
  }
}
