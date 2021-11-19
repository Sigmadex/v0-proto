pragma solidity 0.8.10;

import { AppStorage, LibAppStorage, Modifiers } from '../libraries/LibAppStorage.sol';

contract OperationsFacet is Modifiers {
  // Farm
  function setBonusMultiplier(uint256 multiplier) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    s.BONUS_MULTIPLIER = multiplier;
  }

  function setSdexPerBlock(uint256 newBlockRate) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    s.sdexPerBlock = newBlockRate;
  }

  //Vault
  function setVaultPerformanceFee(uint256 newPerformanceFee) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(newPerformanceFee <= s.vMAX_PERFORMANCE_FEE, "must be lower than max");
    s.vPerformanceFee = newPerformanceFee;
  }
  function setVaultCallFee(uint256 newCallFee) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(newCallFee <= s.vMAX_CALL_FEE, "must be lower than max");
    s.vCallFee = newCallFee;
  }


}
