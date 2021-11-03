
# IDiamondLoupe





## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

  - [`Facet`](#facet)
- [Structs](#structs)
- [Functions](#functions)
  - [facets](#facets)
    - [Declaration](#declaration)
    - [Modifiers:](#modifiers)
    - [Returns:](#returns)
  - [facetFunctionSelectors](#facetfunctionselectors)
    - [Declaration](#declaration-1)
    - [Modifiers:](#modifiers-1)
    - [Args:](#args)
  - [facetAddresses](#facetaddresses)
    - [Declaration](#declaration-2)
    - [Modifiers:](#modifiers-2)
  - [facetAddress](#facetaddress)
    - [Declaration](#declaration-3)
    - [Modifiers:](#modifiers-3)
    - [Args:](#args-1)
    - [Returns:](#returns-1)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


### `Facet`


address facetAddress


bytes4[] functionSelectors



## Structs
| name | type |
| ---  | ---  |
| Facet | 



## Functions

### facets
Gets all facet addresses and their four byte function selectors.



#### Declaration
```solidity
  function facets(
  ) external returns (struct IDiamondLoupe.Facet[] facets_)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`facets_` | Facet
### facetFunctionSelectors
Gets all the function selectors supported by a specific facet.



#### Declaration
```solidity
  function facetFunctionSelectors(
    address _facet
  ) external returns (bytes4[] facetFunctionSelectors_)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_facet` | address | The facet address.


### facetAddresses
Get all the facet addresses used by a diamond.



#### Declaration
```solidity
  function facetAddresses(
  ) external returns (address[] facetAddresses_)
```

#### Modifiers:
No modifiers



### facetAddress
Gets the facet that supports the given selector.

> If facet is not found return address(0).


#### Declaration
```solidity
  function facetAddress(
    bytes4 _functionSelector
  ) external returns (address facetAddress_)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_functionSelector` | bytes4 | The function selector.

#### Returns:
| Type | Description |
| --- | --- |
|`facetAddress_` | The facet address.


