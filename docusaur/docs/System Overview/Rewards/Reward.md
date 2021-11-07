---
sidebar_position: 1
---

The Reward Subsystem in Sigmadex is mostly managed in the [RewardFacet](../../Api%20Specification/facets/RewardFacet) and various individual NFT Reward Facets. It is tasked with adding NFTs to the {ValidNFT} list for each token, and acting as middleware between the farms and the NFT themselves, which are deployed as separate [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155).  Using one ERC-1155 contract was considered, but after much deliberations separating them into many gives us the atomic management and upgradability we need to handle the diverse and creative NFT implementations planned for future versions.

Upon a withdrawal of a {UserPosition} or {VaultUserPosition} whose time has expired a series of NFTs are created, one for each token available in a vault, and an extra SDEX based NFT.  The value of these NFTs are sourced from a proportion of the penalty pools of those token.  What proportion one receives is based on on the `blockAmount` or $stakeTime \times stakeAmount$ divided by the `globalBlockAmount` or the sum of all other `blockAmounts` for that token. For the extra special SDEX based NFT, this amount is calculated as the proportion of personally accrued rewards by block emission vs the total emission over the `startBlock` to the `endBlock`
:::note
`blockAmounts` are *cross-pool* on a per token basis. For example there can be many USDT denominated pools.  When calculating the received reward, on looks at the total USDT in the penalty pool and the proportion of their `blockAmount` against the `globalBlockAmount` for USDT.
::: 

Every token in the system has a list of NFTs that can be minted for it, this is called the {ValidRewards} array.  In V0, a pseudorandom number generator selects exactly which on is minted.  In future versions we plan to make this much more random with [Chainlink VRF](https://docs.chain.link/docs/chainlink-vrf/). 

When an NFT is applied to a deposit, and is subsequently withdrawed, they actually hijack the entire control flow of the withdraw to apply their custom logic.  To do this they every reward implements an interface that is compliant with the {Reward} struct.  That is, they provide a `reward`, `withdraw`, and `vault` withdraw functions.  In future versions, this will be extended into swaps, pools, loans and other decentralized products that we offer.  These functions are than `delegatecalled` by the diamond to implement this customized logic held in the specific {NFTRewardFacet}.

## Rewards

### [Reduced Penalty](./Reduced%20Penalty)
In the event of a premature withdraw, the penalty is lessened up to the `reductionAmount`, depletes as used, good as insurance
