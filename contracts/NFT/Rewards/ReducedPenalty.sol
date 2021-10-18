pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol';
import './interfaces/ISDEXReward.sol';
contract ReducedPenaltyNFT is ERC1155PresetMinterPauser, ISDEXReward {

   
  constructor(
  ) ERC1155PresetMinterPauser("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
  }
  function mint() external {
    
  }
  function _beforeDeposit() external {
  }
  function _afterDeposit() external {
  }
  function _beforeUpdate() external {
  }
  function _afterUpdate() external {
  }
  function _beforeWithdraw() external {
  }
  function _afterWithdraw() external {
  }
}
