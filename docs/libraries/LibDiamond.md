## `LibDiamond`






### `diamondStorage() → struct LibDiamond.DiamondStorage ds` (internal)





### `setContractOwner(address _newOwner)` (internal)





### `contractOwner() → address contractOwner_` (internal)





### `enforceIsContractOwner()` (internal)





### `diamondCut(struct IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata)` (internal)





### `addFunctions(address _facetAddress, bytes4[] _functionSelectors)` (internal)





### `replaceFunctions(address _facetAddress, bytes4[] _functionSelectors)` (internal)





### `removeFunctions(address _facetAddress, bytes4[] _functionSelectors)` (internal)





### `addFacet(struct LibDiamond.DiamondStorage ds, address _facetAddress)` (internal)





### `addFunction(struct LibDiamond.DiamondStorage ds, bytes4 _selector, uint96 _selectorPosition, address _facetAddress)` (internal)





### `removeFunction(struct LibDiamond.DiamondStorage ds, address _facetAddress, bytes4 _selector)` (internal)





### `initializeDiamondCut(address _init, bytes _calldata)` (internal)





### `enforceHasContractCode(address _contract, string _errorMessage)` (internal)






### `OwnershipTransferred(address previousOwner, address newOwner)`





### `DiamondCut(struct IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata)`






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



