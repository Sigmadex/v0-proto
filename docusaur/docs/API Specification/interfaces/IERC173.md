
# IERC173








## Functions

### owner
Get the address of the owner



#### Declaration
```solidity
  function owner(
  ) external returns (address owner_)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`owner_` | The address of the owner.
### transferOwnership
Set the address of the new owner of the contract

> Set _newOwner to address(0) to renounce any ownership.


#### Declaration
```solidity
  function transferOwnership(
    address _newOwner
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_newOwner` | address | The address of the new owner of the contract



## Events

### OwnershipTransferred
No description
> This emits when ownership of a contract changes.
  


