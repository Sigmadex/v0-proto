pragma solidity 0.8.7;
import 'contracts/lib/access/Ownable.sol';


contract PenaltyOracle is Ownable  {
  struct Asset {
    uint256 discountRate;
    int256 beta;
  }
  mapping(address => Asset) _assets;

  constructor() {

  }

  function updateParameters(
    address assetAddress, 
    uint256 discountRate,
    int256 beta
  ) public 
    onlyOwner {
      Asset storage asset =_assets[assetAddress];
      asset.discountRate = discountRate;
      asset.beta = beta;
  }

  function batchUpdateParameters(
    address[] memory assets,
    uint256[] memory discountRates,
    int256[] memory betas
  ) public
    onlyOwner {
    require((assets.length == discountRates.length), "row-column mismatch");
    require((assets.length == betas.length), "row-column mismatch");
    uint i = 0;
    for (i; i < assets.length; i++) {
      updateParameters(
        assets[i],
        discountRates[i],
        betas[i]
      );
    }
  }
}}
  }
}
