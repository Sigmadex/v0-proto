
# AutoSdexFarmFacet



> The Native token vault (pid=0) has a special feature that can automatically reinvest Sdex farmed.  This Facet Is Internal to the Diamond, coordinating the restaking by the {SdexVaultFacet}

## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Functions](#functions)
  - [enterStaking](#enterstaking)
    - [Declaration](#declaration)
    - [Modifiers:](#modifiers)
    - [Args:](#args)
  - [leaveStaking](#leavestaking)
    - [Declaration](#declaration-1)
    - [Modifiers:](#modifiers-1)
    - [Args:](#args-1)
- [Events](#events)
  - [Deposit](#deposit)
  - [Withdraw](#withdraw)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->





## Functions

### enterStaking
Enter Staking is called by by the Vault to reinvest any Sdex it has accrued into the pool



#### Declaration
```solidity
  function enterStaking(
    uint256 amount
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`amount` | uint256 | The amount of Sdex to be invested into the Sdex Pool (pid=0)

### leaveStaking
leave staking coordinates the {SdexVaultFacets} removal of funds from the pool to distribute to users or too recollect prior to restaking



#### Declaration
```solidity
  function leaveStaking(
    uint256 amount
  ) public onlyDiamond
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`amount` | uint256 | The amount of funds the {SdexVaultFacet} withdraws from the Sdex pool (pid=1)



## Events

### Deposit
No description

  


### Withdraw
No description

  


