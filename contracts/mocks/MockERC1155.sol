
pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

import 'hardhat/console.sol';

contract MockERC1155 is ERC1155{
  uint256 public constant GOLD = 0;
  constructor(

  ) ERC1155("https://nft.sigmadex.org/api/rewards/increased-block-reward/{id}.json") {
   _mint(msg.sender, GOLD, 10**18, "");
  }
}
