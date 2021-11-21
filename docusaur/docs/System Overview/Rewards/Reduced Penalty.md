The reduced Reward penalty is onchain as the [ReducedPenaltyReward](../../API%20Specification/Rewards/ReducedPenaltyReward), has internal state denoted bye the `rP` prefix and has its `Reward` interface defined in [ReducedPenaltyFacet](../../API%20Specification/facets/RewardFacets/ReducedPenaltyRewardFacet).  When applied to a {UserPosition} or {VaultUserPosition} it protects the user in the event they feel emplored to withdraw before their `endBlock`.  In this event, a user will find their refund greater up to the `reductionAmount` provided in the NFT.  This `reductionAmount` is derived from the value of the Reward when it was minted.  For example, if the reward Amount was 10 USDT, it will offer up to a 10 USDT penalty reduction.  In the event the penalty is less than the `reductionAmount`, $reductionAmount - penalty$ is taken from the `reductionAmount` and one can use the NFT again. In the event that no premature withdraw occurs, nothing happens to the value of the NFT.
:::danger
This NFT is not a {Premature Withdraw NFT} even if the penalty gets set to zero, no NFT award will be minted, and all accrued SDEX will still be lost
::: 



