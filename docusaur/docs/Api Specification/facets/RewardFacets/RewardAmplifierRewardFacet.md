
# RewardAmplifierRewardFacet



> The {RewardAmplifierFacet}  implements the custom reward,withdraw, vaultWithdraw logic for the {RewardAmplifier} NFT.




## Functions

### rARAddress
the multiplier Address is the address of the NFT



#### Declaration
```solidity
  function rARAddress(
  ) public returns (address)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`address` | location of NFT on blockchain
### rARAmount
No description


#### Declaration
```solidity
  function rARAmount(
  ) public returns (struct RARAmount)
```

#### Modifiers:
No modifiers



### rARReward
No description


#### Declaration
```solidity
  function rARReward(
  ) external onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |



### rARWithdraw
No description


#### Declaration
```solidity
  function rARWithdraw(
  ) public
```

#### Modifiers:
No modifiers



### rARWithdrawVault
No description


#### Declaration
```solidity
  function rARWithdrawVault(
  ) external
```

#### Modifiers:
No modifiers





