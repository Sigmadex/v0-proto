pragma solidity 0.8.9;

import './Rewards/interfaces/ISDEXReward.sol';
contract NFTRewards {
  
  constructor(
  ) {
  }

  function batchMintRewards(
    address _to,
    address[] calldata _tokens,
    uint256[] calldata _rewardamounts
  ) public {
   /* 
     mintBatch(_to
      address to,
      uint256[] memory ids,
      uint256[] memory amounts,
      bytes memory data
      )
 */
  }
}
