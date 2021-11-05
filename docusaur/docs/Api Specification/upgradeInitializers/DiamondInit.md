
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
    address reducedPenaltyReward,
    bytes4 _withdrawSelector,
    bytes4 _vaultWithdrawSelector,
    bytes4 _rewardSelector
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`reducedPenaltyReward` | address | address, will be array of GEN0 NFT soon 
|`_withdrawSelector` | bytes4 | function signature of the reduced penalty withdraw function.  will be array of GEN0 NFT withdraw function selectors soon
|`_vaultWithdrawSelector` | bytes4 | fn selectors for vault withdraw
|`_rewardSelector` | bytes4 | fn selectors for reward function



