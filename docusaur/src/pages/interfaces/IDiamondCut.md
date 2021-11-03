
# IDiamondCut





## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

  - [`FacetCut`](#facetcut)
- [Structs](#structs)
- [Functions](#functions)
  - [diamondCut](#diamondcut)
    - [Declaration](#declaration)
    - [Modifiers:](#modifiers)
    - [Args:](#args)
- [Events](#events)
  - [DiamondCut](#diamondcut)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


### `FacetCut`


address facetAddress


enum IDiamondCut.FacetCutAction action


bytes4[] functionSelectors



## Structs
| name | type |
| ---  | ---  |
| FacetCut | 



## Functions

### diamondCut
Add/replace/remove any number of functions and optionally execute
        a function with delegatecall



#### Declaration
```solidity
  function diamondCut(
    struct IDiamondCut.FacetCut[] _diamondCut,
    address _init,
    bytes _calldata
  ) external
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_diamondCut` | struct IDiamondCut.FacetCut[] | Contains the facet addresses and function selectors
|`_init` | address | The address of the contract or facet to execute _calldata
|`_calldata` | bytes | A function call, including function selector and arguments
                 _calldata is executed with delegatecall on _init



## Events

### DiamondCut
No description

  


