This page provides an indepth explanation of what state is tracked in the contract to provide its functionality.  We can divide this state into 5 different subsystems.
### Sdex Subsystem
The Sdex Subsystem is responsible for holding the state required to implement the ERC-20 compliant Sdex Token
```js

mapping(address => uint256) sdexBalances; // user address maps to amount of Sdex owned
mapping(address => mapping(address => uint256))  sdexAllowances; //user address allows other address the spending of amount
uint256 sdexTotalSupply; //total Amount of Sdex in existance

string sdexName; //name of token
string sdexSymbol; // symbol of token
uint8 sdexDecimals; // decimals for token

```
### Farm Subsystem
#### Pools
State concerning the pools are contained within the {PoolInfo} struct. Which are mapped by a unique id in the `poolInfo` mapping. the `poolLength` retreives the amount of pools if one wishes to iterate over all of them.
```js
struct PoolTokenData {
  IERC20 token; // An ERC20 interface of a token in a pool, can be LP tokens, Sdex, stables or others
  uint256 supply; // the total amount of this token within this specific pool
  uint256 accSdexPerShare; // the amount of accumulated blockrewards since the pools birth per unit supply
}

struct PoolInfo {
  PoolTokenData[] tokenData; // Array of PoolTokenDatas, normally of length 1, or 2, but can be many
  uint256 allocPoint; // allocation points, used to determine what proportion of block rewards this pool gets per block
  uint256 lastRewardBlock; // SDEX lazy updates on user input, sometimes many block go by before update, used to catch up state
}

mapping(uint256 => PoolInfo) poolInfo; // mapping holding all pools
uint256 poolLength // pool Iterator, max number of pools, used to add another and find an iterator over all pools
```
The Farm subsystem also uses these globals across all farms
```js
uint256 sdexPerBlock; // amount of Sdex emitted per block
uint256 BONUS_MULTIPLIER; // sdexPerBlock can be amplified or dampened temporaily by toggling this
uint256 totalAllocPoint; // total amount of farm allocation points, used in determining what proportion of sdex per block a farm receives
uint256 startBlock; // block where awards start being minted
```
#### Users
Data on specific users' claims within pools is stored through the `userInfo` mapping.  which takes a `poolid` and their `address` and outputs the {UserInfo} object. When a user deposits funds into a pool with `poolid` a {UserPosition} object is created with a `positionid`.  This {UserPosition} objects holds the specific deposit data, while the {UserTokenData} object keeps tracks of relevant sum totals of that user in that pool.
```js
struct UserPosition {
  uint256 startBlock; // block this position was created at
  uint256 endBlock; // block the user states is the finish of his staking period
  uint256[] amounts; // array of amounts deposited, same length and order as the pools `tokenData`
  uint256[] rewardDebts; // tracks users rewards at t-1 to know how much to give next
  address nftReward; // the address of the specific NFT reward if applied (address(0)) is no NFT
  uint256 nftid; // the id of the nft at the above address (0 for no NFT)
}

struct UserTokenData {
  uint256 amount; // sum of all tokens of this type across all open positions
  uint256 totalRewardDebt; // sum of all users rewards at t-1 to know what to give next
}

struct UserInfo {
  UserTokenData[] tokenData; // array of {TokenData} same order as pools tokenData
  UserPosition[] positions; // an array of all users created positions in this pool
  uint256 lastRewardBlock; // tracks how many blocks to update upon a lazy update initiated by user
}

mapping (uint256 => mapping (address => UserInfo)) userInfo; 
```

### Vault Subsystem
The Vault subsystem is a special 'trading bot' like system that operates on `poolid=0`, the SDEX only farm. It exposes deposit withdraw functionality for the end users, and continually reinvests any block rewards on behalf of the users. Like farms, when a user deposits in the vault, a {VaultUserPosition} is created inside their {VaultUserInfo}
```js
struct VaultUserPosition {
  uint256 startBlock; // block where the deposit of SDEX occured
  uint256 endBlock; // When the timestake is over
  uint256 amount; // amount staked
  uint256 shares; // proportion of ownership of assets in vault, used in calcs as Sdex is compounding
  address nftReward; // address of applied NFT reward, (address(0) for no NFT)
  uint256 nftid; // id of nft at address above, (0 for no NFT)
}

struct VaultUserInfo {
  uint256 shares; // number of total shares for a user
  uint256 lastDepositedTime; // keeps track of deposited time for potential penalty
  uint256 sdexAtLastUserAction; // keeps track of cake deposited at the last user action
  uint256 lastUserActionTime; // keeps track of the last user action time
  VaultUserPosition[] positions; // array of positions a user created by depositing
}

mapping(address => VaultUserInfo) vUserInfo; // user address maps to the {VaultUserInfo} object
```
The Vault also contains the following global state for the `harvest` functionality.  When compensates users a small amount in exchange for paying for the bot to autocompound everyones shares
```js
uint256 vSdex; //internal count of how much Sdex the bot 'owns' in the diamond

uint256 vTotalShares; // total amount of shares on vault
uint256 vLastHarvestedTime; // last block where the harvest function was executed
uint256 vTreasury; // an internal account of how much Sdex is collected by the perforance fee

uint256 vMAX_PERFORMANCE_FEE; // 5%, max performance fee that can be set
uint256 vMAX_CALL_FEE; // 1% , max call fee that can be set

uint256 vPerformanceFee; // 2% , 2% of pending rewards in the vault are sent to treasury on harvest execution
uint256 vCallFee; // 0.25%, 0.25% of pending rewards in the vault are sent to harvester
```
### Penalty Pool Subsystem
The penalty/reward subsystem is responsible, calculating, accounting and distributing penalties and rewards on the platform.  Each token that is listed on the platform has one penalty and reward pool, upon the exception of the SDEX token itself, which additionally has an accumulatedSdex penalty and reward pool respectively.  
```js

uint256 accSdexPenaltyPool; // amount of Sdex in the AccSdex Penalty Pool
uint256 accSdexRewardPool; // amount of claims outstanding in NFT rewards
uint256 accSdexPaidOut; // amount that has been paid out in NFT rewards


struct TokenRewardData {
  uint256 blockAmountGlobal; // sum of all blocksStaked*amountStaked for all positions in this token, used to calc amount received from penalty pool
  uint256 rewarded; // amount of claims currently outstanding of this token in NFT rewards
  uint256 penalties; // amount of tokens currently in penalty pool
  uint256 paidOut; // amount of NFT rewards that have been paid out over all time
}
mapping (address => TokenRewardData) tokenRewardData;
```


### NFT Reward Subsystem
The reward subsystem concerns acting as a middleware between the NFT rewards, the NFT Reward Facets,  and the Penalty Subsystem
```js
struct Reward{
  bytes4 withdrawSelector; // function signature for an NFT rewards withdraw function
  bytes4 vaultWithdrawSelector; // function signature for an NFT rewards vault withdraw selector
  bytes4 rewardSelector; // function signature for an NFT rewards' create reward selector
}
mapping (address => Reward) rewards; // nft address to {Reward} router struct

mapping (address => address[]) validRewards; // token address maps to nft addresses that can be minted for it
enum REWARDPOOL{BASE, ACC} // determines which reward pool the nft pulls its underlying value from
uint256 seed; // number that assists in the pseudo random picking of which nft to mint for reward

