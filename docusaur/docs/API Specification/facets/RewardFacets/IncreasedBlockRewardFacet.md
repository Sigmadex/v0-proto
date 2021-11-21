
# IncreasedBlockRewardFacet



> The {IncreasedBlockRewardFacet}  implements the custom reward,withdraw, vaultWithdraw logic for the {MultiplierReward} NFT.




## Functions

### iBRAddress
the multiplier Address is the address of the NFT



#### Declaration
```solidity
  function iBRAddress(
  ) public returns (address)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`address` | location of NFT on blockchain
### iBRReward
multiplier Reward is charged with minting the multiplier NFT as a reward



#### Declaration
```solidity
  function iBRReward(
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
|`amount` | uint256 | the amount of the underlying asset that the NFT that can be multipliered too

### iBRAmount
returns {RPAmount} for the nft id in question



#### Declaration
```solidity
  function iBRAmount(
    uint256 id
  ) external returns (struct IBRAmount)
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
### iBRWithdraw
reduced Penalty Withdraw substitutes for the withdraw function of {TokenFarm} when withdrawing a {UserPosition} that has the {ReducedPenaltyReward} nft address associated with it.  Provides compensating the user the reduction amount in the even of an early withdraw



#### Declaration
```solidity
  function iBRWithdraw(
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

### iBRWithdrawVault
reduced Penalty Withdraw vaults substitutes the withdrawVault function in {SdexVaultFacet} in the event the {UserPosition} in {VaultUserInfo} has the reduced penalty nft address associated with it



#### Declaration
```solidity
  function iBRWithdrawVault(
    uint256 positionid
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`positionid` | uint256 | the id of the associated position, found in the {UserPosition} array length - 1 of {VaultUserInfo}



## Events

### RewardNFT
No description

  


### WithdrawVault
No description

  


