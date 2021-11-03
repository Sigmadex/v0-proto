
# LibDiamond





## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

  - [`FacetAddressAndPosition`](#facetaddressandposition)
  - [`FacetFunctionSelectors`](#facetfunctionselectors)
  - [`DiamondStorage`](#diamondstorage)
- [Structs](#structs)
- [Globals](#globals)
- [Functions](#functions)
  - [diamondStorage](#diamondstorage)
    - [Declaration](#declaration)
    - [Modifiers:](#modifiers)
  - [setContractOwner](#setcontractowner)
    - [Declaration](#declaration-1)
    - [Modifiers:](#modifiers-1)
  - [contractOwner](#contractowner)
    - [Declaration](#declaration-2)
    - [Modifiers:](#modifiers-2)
  - [enforceIsContractOwner](#enforceiscontractowner)
    - [Declaration](#declaration-3)
    - [Modifiers:](#modifiers-3)
  - [diamondCut](#diamondcut)
    - [Declaration](#declaration-4)
    - [Modifiers:](#modifiers-4)
  - [addFunctions](#addfunctions)
    - [Declaration](#declaration-5)
    - [Modifiers:](#modifiers-5)
  - [replaceFunctions](#replacefunctions)
    - [Declaration](#declaration-6)
    - [Modifiers:](#modifiers-6)
  - [removeFunctions](#removefunctions)
    - [Declaration](#declaration-7)
    - [Modifiers:](#modifiers-7)
  - [addFacet](#addfacet)
    - [Declaration](#declaration-8)
    - [Modifiers:](#modifiers-8)
  - [addFunction](#addfunction)
    - [Declaration](#declaration-9)
    - [Modifiers:](#modifiers-9)
  - [removeFunction](#removefunction)
    - [Declaration](#declaration-10)
    - [Modifiers:](#modifiers-10)
  - [initializeDiamondCut](#initializediamondcut)
    - [Declaration](#declaration-11)
    - [Modifiers:](#modifiers-11)
  - [enforceHasContractCode](#enforcehascontractcode)
    - [Declaration](#declaration-12)
    - [Modifiers:](#modifiers-12)
- [Events](#events)
  - [OwnershipTransferred](#ownershiptransferred)
  - [DiamondCut](#diamondcut)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


### `FacetAddressAndPosition`


address facetAddress


uint96 functionSelectorPosition


### `FacetFunctionSelectors`


bytes4[] functionSelectors


uint256 facetAddressPosition


### `DiamondStorage`


mapping(bytes4 => struct LibDiamond.FacetAddressAndPosition) selectorToFacetAndPosition


mapping(address => struct LibDiamond.FacetFunctionSelectors) facetFunctionSelectors


address[] facetAddresses


mapping(bytes4 => bool) supportedInterfaces


address contractOwner



## Structs
| name | type |
| ---  | ---  |
| FacetAddressAndPosition | 
| FacetFunctionSelectors | 
| DiamondStorage | 
## Globals

> Note this contains internal vars as well due to a bug in the docgen procedure

| Var | Type |
| --- | --- |
| DIAMOND_STORAGE_POSITION | bytes32 |



## Functions

### diamondStorage
No description


#### Declaration
```solidity
  function diamondStorage(
  ) internal returns (struct LibDiamond.DiamondStorage ds)
```

#### Modifiers:
No modifiers



### setContractOwner
No description


#### Declaration
```solidity
  function setContractOwner(
  ) internal
```

#### Modifiers:
No modifiers



### contractOwner
No description


#### Declaration
```solidity
  function contractOwner(
  ) internal returns (address contractOwner_)
```

#### Modifiers:
No modifiers



### enforceIsContractOwner
No description


#### Declaration
```solidity
  function enforceIsContractOwner(
  ) internal
```

#### Modifiers:
No modifiers



### diamondCut
No description


#### Declaration
```solidity
  function diamondCut(
  ) internal
```

#### Modifiers:
No modifiers



### addFunctions
No description


#### Declaration
```solidity
  function addFunctions(
  ) internal
```

#### Modifiers:
No modifiers



### replaceFunctions
No description


#### Declaration
```solidity
  function replaceFunctions(
  ) internal
```

#### Modifiers:
No modifiers



### removeFunctions
No description


#### Declaration
```solidity
  function removeFunctions(
  ) internal
```

#### Modifiers:
No modifiers



### addFacet
No description


#### Declaration
```solidity
  function addFacet(
  ) internal
```

#### Modifiers:
No modifiers



### addFunction
No description


#### Declaration
```solidity
  function addFunction(
  ) internal
```

#### Modifiers:
No modifiers



### removeFunction
No description


#### Declaration
```solidity
  function removeFunction(
  ) internal
```

#### Modifiers:
No modifiers



### initializeDiamondCut
No description


#### Declaration
```solidity
  function initializeDiamondCut(
  ) internal
```

#### Modifiers:
No modifiers



### enforceHasContractCode
No description


#### Declaration
```solidity
  function enforceHasContractCode(
  ) internal
```

#### Modifiers:
No modifiers





## Events

### OwnershipTransferred
No description

  


### DiamondCut
No description

  


