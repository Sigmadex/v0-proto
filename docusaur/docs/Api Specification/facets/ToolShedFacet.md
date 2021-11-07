
# ToolShedFacet








## Functions

### updatePool
the update pool function is called by the system as the first order of business on every deposit and withdraw and does the heavily lifting in terms of minting the SDEX block reward and distributing it out to the various pools.



#### Declaration
```solidity
  function updatePool(
    uint256 pid
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`pid` | uint256 | the pool id currently being updated

### updateStakingPool
Used during pool addtion, or allocPoint recalibration to manage total Allocation points for all pools


#### Declaration
```solidity
  function updateStakingPool(
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |



### massUpdatePools
massUpdatePools can be called to update the state of all pools


#### Declaration
```solidity
  function massUpdatePools(
  ) public
```

#### Modifiers:
No modifiers



### getMultiplier
Normally Sdex is emitted at a constant rate per block, though sometimes a multiplier may be added to multiply this number a certain factor, getMultiplier manages this



#### Declaration
```solidity
  function getMultiplier(
    uint256 from,
    uint256 to
  ) public returns (uint256)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`from` | uint256 | the starting block one wishes to calculate from
|`to` | uint256 | the final block one wishes to calculate from

#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | the multipler applied to all cake over this block period
### totalAllocPoint
totalAllocPoint returns the total allocation points over all pools.  This number is divided against to determine which proportion of the block emission goes to each pool



#### Declaration
```solidity
  function totalAllocPoint(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | total ammount of allocation points across all pools
### sdexPerBlock
returns how many SDEX tokens are being emitted per block, remember to pair with the getMultiplier function if the bonus multiplier is not 1



#### Declaration
```solidity
  function sdexPerBlock(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | amount of SDEX emitted per block
### tokenRewardData
tokenRewardData returns the inner tally of information that is kept on each token on the platform that concerns the distribution of rewards of each of these tokens from the penalty pool



#### Declaration
```solidity
  function tokenRewardData(
    address token
  ) public returns (struct TokenRewardData)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`token` | address | address of token in question

#### Returns:
| Type | Description |
| --- | --- |
|`TokenRewardData` | see {TokenRewardData} for more info
### accSdexPenaltyPool
accumulated Sdex Penalty pool returns the amount of SDEX currently inside the special additionaly penalty pool for SDex that is accumulated by positions from block rewards that are withdrawn early



#### Declaration
```solidity
  function accSdexPenaltyPool(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | the amount in the the accumulated Sdex Penalty Pool
### accSdexRewardPool
accumulated Sdex Reward pool returns the amount of SDEX currently allotted for Sdex rewards derived from the  accumulated Sdex Penalty Pool.



#### Declaration
```solidity
  function accSdexRewardPool(
  ) public returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | the amount of Sdex placed aside for rewards
### calcRefund
calcRefund returns the refund and penalty of an amount of a token given a startBlock (often the current Time) and the blockEnd (often the end of a stake) to determine how much is penalized and how much is refunded.  Generally if one makes it through 50% of the take, one is refunded 50% of the tokens



#### Declaration
```solidity
  function calcRefund(
    uint256 startBlock,
    uint256 blockEnd,
    uint256 amount
  ) public returns (uint256 refund, uint256 penalty)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`startBlock` | uint256 | the block where this position started
|`blockEnd` | uint256 |  the block where this position is no longer penalized for withdrawing
|`amount` | uint256 | the amount of a token in question

#### Returns:
| Type | Description |
| --- | --- |
|`refund` | how much is refunded if withdrawing at start time given endTime and how much is penalized
|`penalty` | how much one is penalized


