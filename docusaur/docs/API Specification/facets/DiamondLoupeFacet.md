
# DiamondLoupeFacet








## Functions

### facets
Gets all facets and their selectors.



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
Gets all the function selectors provided by a facet.



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
### supportsInterface
No description


#### Declaration
```solidity
  function supportsInterface(
  ) external returns (bool)
```

#### Modifiers:
No modifiers





