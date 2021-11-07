
# SdexVaultFacet



> the {SdexVaultFacet} provides additional functionality to the native SDEX pool.  If one stakes their SDEX through here, their tokens are automatically restaked for compounding SDEX.  Insure not to withdrawal your position until the stakeTime expires, or a you will be penalized!




## Functions

### depositVault
depositVault deposits ones funds in the SDEX vault, that auto restakes ones earnings to compound their returns.



#### Declaration
```solidity
  function depositVault(
    uint256 amount,
    uint256 blocksAhead,
    address nftReward,
    uint256 nftid
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`amount` | uint256 | amount of SDEX to stake in vault
|`blocksAhead` | uint256 | the amount of blocks in the future a user wants to commit 
|`nftReward` | address | address of NFT reward to apply to position, address(0) for no NFT
|`nftid` | uint256 | id of NFT reward to apply, 0 for no NFT

### harvest
the harvest function can be called by any user to instruct the vault to reinvest any non staked crypto it is currently holding but not in a vault.  User receives a small reward for doing so called the callFee.


#### Declaration
```solidity
  function harvest(
  ) external
```

#### Modifiers:
No modifiers



### withdrawVault
withdrawVault is called by a user to instruct the vault to liquidate their position, premature withdrawals are penalized according to the proportion of the time they have completed.



#### Declaration
```solidity
  function withdrawVault(
    uint256 positionid
  ) public
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`positionid` | uint256 | the id of the position in question, attained from the positions array in the {UserVaultInfo} struct

### earn
No description


#### Declaration
```solidity
  function earn(
  ) internal
```

#### Modifiers:
No modifiers



### vaultBalance
vaultBalance returns the amount of available SDex for the vault to stake in the SDEX pool



#### Declaration
```solidity
  function vaultBalance(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | the amount available for the Sdexvault to stake
### vSdex
returns the amount of Sdex currently held by the SdexVaultFacet.  Diamonds are proxied all under the same address, so a synthetic tally must be kept



#### Declaration
```solidity
  function vSdex(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | amount of sdex held by the vault
### vTreasury
the harvest function also provides a small fee to the SdexVault itself, no plans for this amount are currently of note, though it may pad the penalty pool in the future



#### Declaration
```solidity
  function vTreasury(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | amount in the vault treasury
### vUserInfo
returns the {VaultUserInfo} struct for a user staked in the vault, contains the total amounts staked, as well as their various positions



#### Declaration
```solidity
  function vUserInfo(
    address user
  ) public returns (struct VaultUserInfo)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`user` | address | address of user in question

#### Returns:
| Type | Description |
| --- | --- |
|`VaultUserInfo` | the information pertaining to the user
### vTotalShares
As users can also manually stake in the SDEX vault, the proportion of ownership of the assets are tallied by the vaultShares, this function returns the total amount of vault shares currently in existance



#### Declaration
```solidity
  function vTotalShares(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | total amount of vault shares
### vShares
Returns an individuals amount of shares they have on the assets on the vault



#### Declaration
```solidity
  function vShares(
    address user
  ) public returns (uint256)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`user` | address | address of the user in question

#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | amount of shares they have on the vault assets
### vCallFee
the vault Call Fee determines the proportion (divided by 10000) is multiplied by the total vault assets on harvest to give to the user harvesting.



#### Declaration
```solidity
  function vCallFee(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | current call Fee (div 10000 for percent)
### vPerformanceFee
the vault performance fee determines the proportion (divided by 10000) is multiplied by the total vault assets on havest to give to the sdex vault itself



#### Declaration
```solidity
  function vPerformanceFee(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | current Performance Fee (div 10000 for percent)


## Events

### Deposit
No description

  


### Withdraw
No description

  


### Harvest
No description

  


### Pause
No description

  


### Unpause
No description

  


