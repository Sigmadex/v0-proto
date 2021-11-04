
# ReducedPenaltyFacet



> The {ReducedPenaltyFacet}  implements the custom reward,withdraw, vaultWithdraw logic for the {ReducedPenaltyReward} NFT.




## Functions

### rPAddress
the reduced Penalty Address is the address of the NFT



#### Declaration
```solidity
  function rPAddress(
  ) public returns (address)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`address` | location of NFT on blockchain
### rPReward
reduced penalty reward is charged with minting the NFT and updating the diamonds internal state relative to this NFT.



#### Declaration
```solidity
  function rPReward(
    address to,
    address token,
    uint256 amount
  ) external onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | address of the user receiving the reward
|`token` | address | the underlying asset the reduced penalty provides (eg USDT)
|`amount` | uint256 | the amount of the underlying asset that the NFT can reduce

### rPReductionAmount
returns {RPAmount} for the nft id in question



#### Declaration
```solidity
  function rPReductionAmount(
    uint256 id
  ) external returns (struct RPAmount)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`id` | uint256 | the nft id 

#### Returns:
| Type | Description |
| --- | --- |
|`RPAmount` | the amount of reduction it can provide in what token
### rPWithdraw
reduced Penalty Withdraw substitutes for the withdraw function of {TokenFarm} when withdrawing a {UserPosition} that has the {ReducedPenaltyReward} nft address associated with it.  Provides compensating the user the reduction amount in the even of an early withdraw



#### Declaration
```solidity
  function rPWithdraw(
    uint256 pid,
    uint256 positionid
  ) public
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`pid` | uint256 | the poolid of the pool in question
|`positionid` | uint256 | the position id in question, retreived from the array postion of {UserInfo}

### rPWithdrawVault
reduced Penalty Withdraw vaults substitutes the withdrawVault function in {SdexVaultFacet} in the event the {UserPosition} in {VaultUserInfo} has the reduced penalty nft address associated with it



#### Declaration
```solidity
  function rPWithdrawVault(
    uint256 positionid
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`positionid` | uint256 | the id of the associated position, found in the {UserPosition} array length - 1 of {VaultUserInfo}



