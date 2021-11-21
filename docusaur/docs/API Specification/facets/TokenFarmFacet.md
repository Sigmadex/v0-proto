
# TokenFarmFacet



> Token Farm concerns creating and removing of positions from various created pools, as well as the associated getters for {UserInfo} and {PoolInfo}




## Functions

### add
Adds a new liquidity pool to the protocol



#### Declaration
```solidity
  function add(
    contract IERC20[] tokens,
    uint256 allocPoint,
    address[] withUpdate,
    bool validNFTs
  ) public onlyOwner
```

#### Modifiers:
| Modifier |
| --- |
| onlyOwner |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`tokens` | contract IERC20[] | tokens to be added to the pool, can be one or many (only currently tested for max 2)
|`allocPoint` | uint256 | allocation points for pool.  This determines what proportion of SDEX is given to this pool every block. allocPoint / TotalAllocPoint = proportion of sdexPerBlock
|`withUpdate` | address[] | runs the massUpdatePool option on execution to update all pool states
|`validNFTs` | bool | list of addresses of nft rewards that are valid for this pool

### changeValidNFTsForPool
No description


#### Declaration
```solidity
  function changeValidNFTsForPool(
  ) public onlyOwner
```

#### Modifiers:
| Modifier |
| --- |
| onlyOwner |



### isValidNFTForPool
No description


#### Declaration
```solidity
  function isValidNFTForPool(
  ) public returns (bool)
```

#### Modifiers:
No modifiers



### deposit
Used to deposit a users tokens in a pool for a specific time. Opens up a position in the pool for the amounts given for the time staked.  Users with NFT rewards attach here.



#### Declaration
```solidity
  function deposit(
    uint256 pid,
    uint256[] amounts,
    uint256 blocksAhead,
    address nftReward,
    uint256 nftid
  ) public
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`pid` | uint256 | Pool Id
|`amounts` | uint256[] | Array of amounts of each token, consult pool at pid for order and number
|`blocksAhead` | uint256 | the number of blocks in the future one wants to commit
|`nftReward` | address | address of nft reward token, address(0) for no NFT
|`nftid` | uint256 | The id of the nft at the nft address, 0 for noNFT

### withdraw
Withdraws a users tokens from a pool by position. Currently a no partial liquiditations are permitted, a withdraw before the stake time is subject to a penalty.  If only 50% of time has passed, only 50% of funds are returned, and all these tokens, and accrued SDEX is sent to the penalty pool as a gift for future stakers who complete their stakeTime.  Withdrawing after the stake time returns all tokens, accrued Sdex and an NFT gift from the penalty pool 



#### Declaration
```solidity
  function withdraw(
    uint256 pid,
    uint256 positionid
  ) public
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`pid` | uint256 | pool id 
|`positionid` | uint256 | id of position to withdraw

### poolLength
Getter function for the amount of pools in the protocol



#### Declaration
```solidity
  function poolLength(
  ) external returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`poolLength` | the amount of pools
### poolInfo
Getter function for the information of a pools



#### Declaration
```solidity
  function poolInfo(
    uint256 pid
  ) external returns (struct PoolInfo)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`pid` | uint256 | id for pool

#### Returns:
| Type | Description |
| --- | --- |
|`PoolInfo` | Information of the pools current state
### userInfo
Returns the Information of a user based on a specific pool, positions are found here.



#### Declaration
```solidity
  function userInfo(
    uint256 pid,
    address user
  ) public returns (struct UserInfo)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`pid` | uint256 | the id of a pool
|`user` | address | address of the user

#### Returns:
| Type | Description |
| --- | --- |
|`UserInfo` | Information of the user


## Events

### Add
No description

  


### Deposit
No description

  


### Withdraw
No description

  


### PoolUpdateNFT
No description

  


