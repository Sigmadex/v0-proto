A Farm on Sigmadex, much like other platforms, consists of an area where users can stake their tokens in exchange for platform rewards. Here, a farm can consist of one or many ERC20 tokens, LP, stablecoins or otherwise.  When staking these tokens in a farm, a user provides the amounts staked, the amount of time to stake them, and, optionally, to provide an NFT reward that provides various bonuses.

## Deposit
For example, a Deposit in a USDT ETH Pool looks like

| Input | Input  | Description |
| --- | --- | --- |
| Amounts | [Amount USD, Amount ETH] | The list of amounts of various tokens, can be any amounts of either, though rewards are split between amounts, making the optimal allocation an equal value of the tokens
| stakeTime | Time in seconds  | The amount of time you are willing to stake the tokens for, can be any amount of time. Withdrawing before this timer is up costs a proportion of the tokens stake to be penalized.  Withdrawing after receives an NFT Reard
| nftReward | address of NFT | The address of the NFT one wants to use that grants specific bonuses.  For example, the {ReducedPenaltyReward} lessens the penalty in the event of a premature stake, it makes good insurance.  Use address(0) for no NFT.
| nftId | id of NFT | The id of the NFT to use at the above address, use 0 for no NFT |

:::danger
Once a deposit is submitted to the blockchain with a stake time, it is final, one will not be able to withdraw in case of a mistake without losing the large portion of their provided funds.  Sigmadex is considering implementing a small grace window in the future if this becomes an issue
:::

## Accruing SDEX
Running the Deposit function creates a {UserPosition}, which contains the start and end dates, the amounts deposited, and the NFT being consumed. Overtime, a position accrues SDEX block rewards according to the equation

$$
UserRewardPerBlock = RewardPerBlock \times proportionToFarm \times proportionUserPosition
$$
| variable | symbol | description |
| --- | --- | --- |
|SDEX Minted On Every Block | RewardPerBlock | SDEX mints {sdexPerBlock} of fresh tokens on every block, for example 1 Sdex per Block |
|Proportion sent to farm | proportionToFarm | a proportion of {sdexPerBlock} is divided amongst the existing pools according to ${poolInfo.allocPoint} \over {totalAllocPoint}$ these are the weights of the pool over the total weight of all pools.  For example if the USDT ETH pool had 1500 $pool.allocPoint$ and the SDEX pool had 1500 $pool.allocPoint$ the $totalAllocPoint$ is 3000. And with 1 sdex emitted per block, 1/2 goes to the ETH/USDT pool and 1/2 goes to the SDEX pool |
| Proportion of pool owned by user | proportionUserPosition | a proportion of users total ownership of the farm in proportion to the total amount in that farm.  For example, if a user owed 50% of the ETH/USDT pool, they will receive 1/4 of the total block emission |
:::tip
Pools with multiple tokens inside spread the reward per block evenly amonst the tokens meaning

$$
UserRewardPerBlock = \sum_{j=1}^n \frac{RewardPerBlock \times proportionToFarm \times proportionUserPosition_j}{n}
$$

So while its possible to stake only one token in a multi token pool, one will only have access to 1/(total Tokens) in rewards.  This incentivies trying to stake equal value of each token.
:::

## Withdraw

While most farms allow for the arbitrary withdrawal of funds, V0 of sigmadex only allows the full liquiditation of positions upon withdraws.  Considerations for implementing partial withdraw may come in the future if there is community demand. For example, a Withdraw takes the character

| Input | Variable | Description |
| --- | --- | --- |
| Pool | pid | the pool in question the user wants to withdraw from, such as USDT/ETH |
| Position | positionid | The position in question that the user wants to liquidate |

### Penalization
When the withdraw function is called on a position that has not yet passed its stake time.  Each token staked in the pool in this position is subject to a penalty function, that determines how much of this token is returned to the user, and how much is place in the penalty pool for another users future NFT reward. For V0 this function is linear, progressing from 100% penalty at the beginning to 0% at the time end, specifically

$$
  refund_j =stake_j \times \%timeElapsed \\ \\
  penalty_j = stake_j \times (100 - \%timeElapsed)
$$

:::note
In all instances, 100% of any accrued SDEX is sent to the $AccruedSdexPenaltyPool$
:::


### Reward
When the withdraw function is called after a position has passed.  2 things happen.  First Each token staked in the pool has a NFT Reward prepared for it. For V0, exactly which NFT is determined by a pseudorandom selector from a list of Valid NFT's for that token.  For example is USDT is staked, the user will receive a USDT flavoured reward.  Each Reward has an underlying value in that token, this is a real claim on the funds from the penalty pool. Specifically the value of this reward is given by

$$
  NFTRewardAmount_j = \frac{stakeTime \times stakeAmount_j}{\sum_{i=1}^m stakeTime_{ji} \times  stakeAmount_{ji}} \times PenaltyPoolAmount_j
$$   


| variable | symbol | description |
| --- | --- | --- |
| Token | j | The token whose reward is being prepared, such as USDT |
|time Staked For User | $stakeTime$ | The amount of time this position was staked for |
| Amount Staked | $stakeAmount_j$ | The amount of token j staked by user |
| Amount Staked | $stakeAmount_{ji}$ | The amount of token j staked by another user |
| numer of positions in pool | m | The total number of positions that involve this token as well, this user is included here as well |
| Amount in Penalty Pool of token j| PenaltyPoolAmount | the amount of token j that is currently in the penalty pool.  These are the funds that come from penalties |

:::note
Some tokens are part of multiple farms, this function is based relative to all timeAmounts (the product of time and amount) across all other pools
:::

### Special considerations for SDEX
Secondly, an NFT for the native token, SDEX is also prepared.  As it can also be a token in a pool, and it is accrued as block rewards over time, internally two separate penalty pools are tracked for it. The $SdexPenaltyPool$ and the $AccuredSdexPenaltyPool$  One for penalized staked tokens, such as ones lost like USDT or ETH, and another for accrued SDEX that was lost. Only by staking SDEX specifically can one draw from the former reward pile, while all others draw from the latter.  The penalty reward function is the same as other tokens in SDEX based farms, but for non SDEX farms, the reward function is based on the amount of SDEX accrued as rewards individually verse how much was emitted in total over the staked period of time.  Specifically

$$
   NFTRewardSDEX = \frac{UserAccruedSDEX}{TotalSdexAccruedByPool} \times AccruedSdexPenaltyPool 
$$

:::note
  Since Sdex is printed by block, and stakeTimes are calculated by second, A user will find the value of this reward increase by a small amount even as the stakeTime has passed
:::

### NFT
In the condition, that an NFT is applied to this withdrawl, one will find these same conditions apply, but with the bonus that that specific NFT indicates.  If for example, the NFT was the {PenaltyReductionReward} NFT, one will find the penalty decreased. More information is available about this in the [Reward](./Rewards) page.

## Vault

The Vault, inspired by PancakeSwaps autocompounding pool. Is a sort of smart contract bot with special permissions on the SDEX native farm.  Users can follow the deposit withdraw model, but the bot will automatically take the SDEX you deposit and automatically reinvest and accrued SDEX you farm while you hold the stake.


