
# IERC165





## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Functions](#functions)
  - [supportsInterface](#supportsinterface)
    - [Declaration](#declaration)
    - [Modifiers:](#modifiers)
    - [Args:](#args)
    - [Returns:](#returns)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->





## Functions

### supportsInterface
Query if a contract implements an interface

> Interface identification is specified in ERC-165. This function
 uses less than 30,000 gas.


#### Declaration
```solidity
  function supportsInterface(
    bytes4 interfaceId
  ) external returns (bool)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`interfaceId` | bytes4 | The interface identifier, as specified in ERC-165

#### Returns:
| Type | Description |
| --- | --- |
|`if` | the contract implements `interfaceID` and
 `interfaceID` is not 0xffffffff, `false` otherwise


