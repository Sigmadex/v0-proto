
# LibDiamond





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

  


