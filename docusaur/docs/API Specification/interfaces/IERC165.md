
# IERC165








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


