## `IDiamondLoupe`






### `facets() → struct IDiamondLoupe.Facet[] facets_` (external)

Gets all facet addresses and their four byte function selectors.




### `facetFunctionSelectors(address _facet) → bytes4[] facetFunctionSelectors_` (external)

Gets all the function selectors supported by a specific facet.




### `facetAddresses() → address[] facetAddresses_` (external)

Get all the facet addresses used by a diamond.




### `facetAddress(bytes4 _functionSelector) → address facetAddress_` (external)

Gets the facet that supports the given selector.


If facet is not found return address(0).




### `Facet`


address facetAddress


bytes4[] functionSelectors



