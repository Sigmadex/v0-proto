
# ReducedPenaltyReward



> the Reduced Penalty Reward NFT provides the user a reduced penalty in the event of a premature withdraw on the position in question.  It comes with a reductionAmount for a specific token (such as USDT), and when applied to a pool containing that token, will provide an increased refund, up to that reduction amount.  Is only consumed in the event of a premature withdraw, so it can make a good insurance policy on that token

## Globals

> Note this contains internal vars as well due to a bug in the docgen procedure

| Var | Type |
| --- | --- |
| diamond | address |


## Modifiers

### onlyDiamond
No description


#### Declaration
```solidity
  modifier onlyDiamond
```





## Functions

### constructor
No description


#### Declaration
```solidity
  function constructor(
  ) public ERC1155PresetMinterPauser
```

#### Modifiers:
| Modifier |
| --- |
| ERC1155PresetMinterPauser |



### mint
Mint is exposed to onlyDiamond to provide the creation of rewards



#### Declaration
```solidity
  function mint(
    address to,
    uint256 id,
    uint256 amount,
    bytes data
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | address of the user receiving the reward
|`id` | uint256 | the id of the rewaerd being minted
|`amount` | uint256 | the amount of nft's being minted (usually 1)
|`data` | bytes | metadata of the NFT,



