
# DiamondInit



> Holds the initialization function for SDEX's internal state, which is defined in {AppStorage}

## Globals

> Note this contains internal vars as well due to a bug in the docgen procedure

| Var | Type |
| --- | --- |
| s | struct AppStorage |



## Functions

### init
called during deployment to intialize SDEX variables for the {SdexFacet} native governance token, the {TokenFarmFacet} yield farm, the {SdexVaultFacet}



#### Declaration
```solidity
  function init(
    address[] nftAddresses,
    bytes4[] _withdrawSelectors,
    bytes4[] _vaultWithdrawSelectors,
    bytes4[] _rewardSelectors
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`nftAddresses` | address[] | address[], array of GEN0 NFTs
|`_withdrawSelectors` | bytes4[] | bytes4[]  array of GEN0 NFT withdraw function selectors
|`_vaultWithdrawSelectors` | bytes4[] | bytes4[] fn selectors for vault withdraw
|`_rewardSelectors` | bytes4[] | bytes4[] fn selectors for reward function



