To start, let's consider the overarching architecture of the protocol.  Sigmadex is built in compliance with a new and emerging standard call [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535).  Sigmadex is a Diamond.  To manage its internal state, we've chosen to utilize the [AppStorage](https://dev.to/mudgen/appstorage-pattern-for-state-variables-in-solidity-3lki) pattern. Functionality is distributed into smart contracts known as Facets, who are [delegatecalled](https://solidity-by-example.org/delegatecall/) from the diamond, which is the persistent non changing address of Sigmadex.  The NFT rewards are deployed as their own contracts, however, the unique state and functionality of each own have their own facets and appended AppStorage state.

This configuration gives us tremendous flexibility in terms of upgrading and expanding Sigmadex's feature set.  


