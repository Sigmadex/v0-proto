## `DiamondLoupeFacet`






### `facets() → struct IDiamondLoupe.Facet[] facets_` (external)

Gets all facets and their selectors.




### `facetFunctionSelectors(address _facet) → bytes4[] facetFunctionSelectors_` (external)

Gets all the function selectors provided by a facet.




### `facetAddresses() → address[] facetAddresses_` (external)

Get all the facet addresses used by a diamond.




### `facetAddress(bytes4 _functionSelector) → address facetAddress_` (external)

Gets the facet that supports the given selector.


If facet is not found return address(0).


### `supportsInterface(bytes4 _interfaceId) → bool` (external)








