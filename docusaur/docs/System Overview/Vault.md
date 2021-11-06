The Vault operates as a smart contract 'bot' that is a user in the SDEX native vault, whose code can be found in the [SdexVaultFacet](../Api%20Specification/facets/SdexVaultFacet).  It exposes similar deposit/withdraw functionality as the TokenFarm on its own end, but on inside it is constantly reinvesting and accrued Sdex back into the platform to earn its patrons- the users, compounding rewards.Users deposit Sdex, and optionally apply an NFT. and the Vault begins by assessing its `vSdex` a synthetic `balanceOf` call for how much the vault currently has in its wallet.  This is done as everything is under the `diamondAddress`. the `amount` deposited is converted into `shares` space the equation

$$
shares_i = \frac{amount * \sum_{j=1}^n shares_j}{  bot_{sdex}}
$$

| Variable | Symbol | Description |
| --- | --- | --- |
| shares to user | $shares_i$ | The amount of shares one has of the Vault |
| deposited amount | amount | the amount just deposited by the user |
| total amount of Shares | $\sum_{j=1}^n shares_j$ | the total amount of shares existing for the vault |
| Total amount of Sdex the bot owns | $bot_{sdex}$ | the toal amount of Sdex the bot 'owns' (vSdex + amount currently staked in native pool) |

This conversion is performed as the amount staked for a user is not constant, but compounds over time, what we do keep track of is the users proportion of assets relative to the whole.

A {VaultUserPosition} is created with its amount as its $shares_i$ and the tokenGlobal for the native Sdex pool is iterated to $shares_i$ * to handle rewards. The `earn()` function which instructs the bot to take any available Sdex it has and stake it into the Sdex Native farm using the `enterStaking`function [AutoSdexFarmFacet](../Api%20Specification/facets/AutoSdexFarmFacet#enterstaking), a middleware between the Vault and the Sdex TokenFarm. It is responsible for updating the {UserInfo} of the vault itself within the farm.

Withdraw also works similarily to the TokenFarmFacet.  A NFT Reward is checked for, than if the stakeTime is passed. If not, penalization happens. In the even of a reward, two SDEX NFT's are minted, one that draws from the $stakeTime * amountStaked$ from the reward pool, and $(amountReturned - amountStaked) \times stakeTime$ for one that draws from the accrued Sdex Reward Pool. 

The Vault also follows a lazy update architecture.  The `withdraw` function does not restake the remaining tokens automatically, meaning some funds sit lying around not in the pool.  Similar to Pancake swap as well, the [`harvest`](../Api%20Specification/facets/SdexVaultFacet#harvest) function enables users to earn a `callFee` for paying the gas to get the Vault to restake any left over tokens from withdraws.




