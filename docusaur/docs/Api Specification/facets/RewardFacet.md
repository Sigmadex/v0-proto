
# RewardFacet



> The {RewardFacet} is tasked with minting Reward NFT's upon the withdrawal of a successfully completed stake by a user.




## Functions

### addReward
addReward is called by Sigmadex to add an NFT reward to a token that is found in one or more pools.  Many NFT rewards are token specific, A USDT pool will mint a USDT specific reward.  The valid rewards are found in this array



#### Declaration
```solidity
  function addReward(
    address tokenAddr,
    address nftRewardAddr
  ) public onlyOwner
```

#### Modifiers:
| Modifier |
| --- |
| onlyOwner |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`tokenAddr` | address | The address of the token this nft (such as USDT)
|`nftRewardAddr` | address | the address of the NFT reward (such as reduced penalty reward)

### mintReward
The mintReward Function is tasked with choosing a pseudorandom NFT choice from the list of available rewards, and minting it to the user who successfully completed their stake of the specified reward value



#### Declaration
```solidity
  function mintReward(
    address to,
    address token,
    uint256 rewardAmount
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | The future recipient of the NFT reward (you)
|`token` | address | The underlying token the NFT rewards (such as USDT)
|`rewardAmount` | uint256 | the amount of the Underlying token this NFT has available to consume (such as 10 USDT)

### requestReward
requestReward is called by the {TokenFarmFacet} and {SdexVaultFacet} upon the withdrawal of a successful position in a given pool by the user.  It is responsibile for calculating what proportion of the penalty pool the user receives in the form of an NFT reward.  The algorithm awards the proportion (timeStaked x amountStaked)/(totalStaked x totalTimeStaked) of the penalties pools current holding.



#### Declaration
```solidity
  function requestReward(
    address to,
    address token,
    uint256 blockAmount
  ) public onlyDiamond returns (uint256)
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | the address of the future Reward NFT holder
|`token` | address | the address of the token being withdrawed (such as USDT)
|`blockAmount` | uint256 | (blocksAhead*amountStaked) the product of the amount staked and how long.  Used to to determine what proportion the user receives from the penalty pool 

#### Returns:
| Type | Description |
| --- | --- |
|`rewardAmount` | amount rewarded to the user as an NFT reward, used by {TokenFarmFacet} and {SdexVaultFacet} in updating the state of the smart contract
### requestSdexReward
Internally two penalty pools for Sdex are kept, one for penalties lost on staking Sdex itself, and another for penalites derived from lost block rewards. For example a premature withdraw on USDT-ETH results in a loss of accrued Sdex from block rewards, while an SDEX-ETH pair premature withdraw results in both a loss of accrued block rewards, and the SDEX originally staked as well. requestSdexReward mints NFT rewards based on penalties accrued only from lost block rewards.



#### Declaration
```solidity
  function requestSdexReward(
    address to,
    uint256 startBlock,
    uint256 endBlock,
    uint256 poolAllocPoint,
    uint256 amountAccumulated
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | the address of the user receiving the reward
|`startBlock` | uint256 | the block the position started accruing sdex block rewards
|`endBlock` | uint256 | the block the position was commited to
|`poolAllocPoint` | uint256 | the allocation points of the specific pool. Divided by the totalAllocPoint of the farm to determine which proportion of the block rewards go to that pool
|`amountAccumulated` | uint256 | the amount of Sdex this position accrued as block rewards. Divided by the total amound of block rewards for the pool in the same time frame to determine what proportion of the SDEX block rewards pool is given

### getValidRewardsForToken
Returns a list of addresses belong to the valid NFT's for a specific token



#### Declaration
```solidity
  function getValidRewardsForToken(
    address token
  ) public returns (address[])
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`token` | address | the token, such as USDT in question

#### Returns:
| Type | Description |
| --- | --- |
|`validRewards` | an array of NFT addresses that are valid rewards for this token


