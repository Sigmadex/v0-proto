pragma solidity 0.8.9;
import 'contracts/pancake/pancake-lib/access/Ownable.sol';
import 'hardhat/console.sol';
contract ACL is Ownable {
  address public pantry;
  address public kitchen;
  address public masterChef;
  address public selfCakeChef;
  address public autoCakeChef;
  address public cakeVault;
  address public cashier;
  address public nftRewards;

  function setPantry(address _pantry) public onlyOwner {
    pantry = _pantry;
  }
  function setKitchen(address _kitchen) public onlyOwner {
    kitchen = _kitchen;
  }
  function setMasterChef(address _masterChef) public onlyOwner {
    masterChef = _masterChef;
  }
  function setSelfCakeChef(address _selfCakeChef) public onlyOwner {
    selfCakeChef = _selfCakeChef;
  }
  function setAutoCakeChef(address _autoCakeChef) public onlyOwner {
    autoCakeChef = _autoCakeChef;
  }
  function setCakeVault(address _cakeVault) public onlyOwner {
    cakeVault = _cakeVault;
  }
  function setCashier(address _cashier) public onlyOwner {
    cashier = _cashier;
  }
  function setNFTRewards(address _nftRewards) public onlyOwner {
    nftRewards = _nftRewards;
  }

  function onlyACL(address sender) public view {
    address[8] memory allowedAddresses = [pantry, kitchen, masterChef, selfCakeChef, autoCakeChef, cakeVault, cashier, nftRewards];
    for (uint i=0; i<allowedAddresses.length;i++) {
      if (allowedAddresses[i] == sender) {
        return;
      }
    }
    revert("Contract caller not authorized by ACL");
  }
}
