pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

import 'hardhat/console.sol';

contract ReducedPenaltyReward is ERC1155 {
  address diamond;
  constructor(
    address _diamond
  ) ERC1155("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
   diamond = _diamond; 
  }

  modifier onlyDiamond() {
    require(msg.sender == diamond, "diamond only");
    _;
  }
  function mint(address to, uint256 id, uint256 amount, bytes calldata data) public onlyDiamond {
    _mint(to, id, amount, data);
  }
}
