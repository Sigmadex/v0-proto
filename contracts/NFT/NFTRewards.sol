pragma solidity 0.8.7;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract NFTRewards is ERC1155 {

  constructor() ERC1155("https://nft.sigmadex.org/api/rewards/{id}.json") {
  }
}
