pragma solidity 0.8.10;

import { AppStorage, LibAppStorage, Modifiers } from '../libraries/LibAppStorage.sol';

contract OperationsFacet is Modifiers {
  event UpdateBonusMultiplier(uint256 multiplier);
  event UpdateSdexPerBlock(uint256 sdexPerBlock);
  event UpdateVaultPerformanceFee(uint256 performanceFee);
  event UpdateVaultCallFee(uint256 callFee);
  // Farm
  function setBonusMultiplier(uint256 multiplier) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    s.BONUS_MULTIPLIER = multiplier;
    emit UpdateBonusMultiplier(multiplier);
  }

  function setSdexPerMinute(uint256 newRate) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    s.sdexPerMinute = newRate;
    emit UpdateSdexPerBlock(newRate);
  }

  //Vault
  function setVaultPerformanceFee(uint256 newPerformanceFee) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(newPerformanceFee <= s.vMAX_PERFORMANCE_FEE, "must be lower than max");
    s.vPerformanceFee = newPerformanceFee;
    emit UpdateVaultPerformanceFee(newPerformanceFee);
  }
  function setVaultCallFee(uint256 newCallFee) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(newCallFee <= s.vMAX_CALL_FEE, "must be lower than max");
    s.vCallFee = newCallFee;
    emit UpdateVaultCallFee(newCallFee);
  }


}
