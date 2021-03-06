
# SdexFacet



> The SdexFacet is the ERC20 compliant token native to the Sigmadex platform. SDEX!. used in onchain governance as the protocol decentralizes




## Functions

### mint
Mints Sdex, only callable by diamond



#### Declaration
```solidity
  function mint(
    address to,
    uint256 amount
  ) external onlyDiamond returns (bool)
```

#### Modifiers:
| Modifier |
| --- |
| onlyDiamond |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | address for receiving the tokens
|`amount` | uint256 | amount to receive 

#### Returns:
| Type | Description |
| --- | --- |
|`bool` | if successful
### executiveMint
executiveMint, only callable by owner for initial token generation event, planned to be disabled after protocol bootstrap



#### Declaration
```solidity
  function executiveMint(
    address to,
    uint256 amount
  ) external onlyOwner returns (bool)
```

#### Modifiers:
| Modifier |
| --- |
| onlyOwner |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`to` | address | address the tokens get minted to
|`amount` | uint256 | amount of tokens to be minted

#### Returns:
| Type | Description |
| --- | --- |
|`bool` | success of the mint
### name
returns the name of the token



#### Declaration
```solidity
  function name(
  ) public returns (string)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`string` | name of token
### decimals
returns the amount of decimals for the token



#### Declaration
```solidity
  function decimals(
  ) public returns (uint8)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint8` | amount of decimals
### symbol
returns the symbol of the token



#### Declaration
```solidity
  function symbol(
  ) public returns (string)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`string` | name of symbol
### totalSupply
Returns the amount of tokens in existence.



#### Declaration
```solidity
  function totalSupply(
  ) external returns (uint256)
```

#### Modifiers:
No modifiers


#### Returns:
| Type | Description |
| --- | --- |
|`uint256` | amount of tokens
### balanceOf
Returns the amount of tokens owned by `account`



#### Declaration
```solidity
  function balanceOf(
    address account
  ) external returns (uint256)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`account` | address | address of the account in question

#### Returns:
| Type | Description |
| --- | --- |
|`uint256` |  amount of SDEX tokens
### transfer
Moves `amount` tokens from the caller's account to `recipient`.



#### Declaration
```solidity
  function transfer(
    address recipient,
    uint256 amount
  ) external returns (bool)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`recipient` | address | the address of who is getting the tokens
|`amount` | uint256 | the amount of tokens recieved

#### Returns:
| Type | Description |
| --- | --- |
|`bool` | transfer success
Emits a {Transfer} event.
### allowance
No description
> Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called.

#### Declaration
```solidity
  function allowance(
  ) external returns (uint256)
```

#### Modifiers:
No modifiers



### approve
No description
> Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729



#### Declaration
```solidity
  function approve(
    address spender,
    uint256 amount
  ) external returns (bool)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`spender` | address | who you are allowing to spend your coins
|`amount` | uint256 | the amount your willing to let them spend

#### Returns:
| Type | Description |
| --- | --- |
|`bool` | approval success
Emits an {Approval} event.
### transferFrom
Moves `amount` tokens from `sender` to `recipient` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.



#### Declaration
```solidity
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool)
```

#### Modifiers:
No modifiers

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`sender` | address | address of who your taking coins from
|`recipient` | address | address of who your sending these coins to
|`amount` | uint256 | that amount of tokens that you are moving

#### Returns:
| Type | Description |
| --- | --- |
|`bool` | success of transferFrom
Emits a {Transfer} event.
### _transfer
No description


#### Declaration
```solidity
  function _transfer(
  ) internal
```

#### Modifiers:
No modifiers



### _approve
No description


#### Declaration
```solidity
  function _approve(
  ) internal
```

#### Modifiers:
No modifiers





