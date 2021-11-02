pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Context.sol';


import { AppStorage, LibAppStorage, Modifiers } from '../libraries/LibAppStorage.sol';
contract SdexFacet is IERC20, Context, Modifiers {

  function mint(address to, uint256 amount) external onlyDiamond returns (bool) {
    require(to != address(0), 'ERC20: mint to the zero address');
    AppStorage storage s = LibAppStorage.diamondStorage();

    s.sdexTotalSupply +=  amount;
    s.sdexBalances[to] += amount;

    emit Transfer(address(0), to, amount);
  }
  function executiveMint(address to, uint256 amount) external onlyOwner returns (bool) {
    require(to != address(0), 'ERC20: mint to the zero address');
    AppStorage storage s = LibAppStorage.diamondStorage();

    s.sdexTotalSupply +=  amount;
    s.sdexBalances[to] += amount;

    emit Transfer(address(0), to, amount);
  }

  function name() public  view returns (string memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexName;

  }
  function decimals() public  view returns (uint8) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexDecimals;
  }
  function symbol() public  view returns (string memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexSymbol;
  }

  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexTotalSupply;
  }

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexBalances[account];
  }

  /**
  * @dev Moves `amount` tokens from the caller's account to `recipient`.
  *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * Emits a {Transfer} event.
    */
  function transfer(address recipient, uint256 amount) external returns (bool) {
    _transfer(_msgSender(), recipient, amount);
    return true;
  }

  /**
  * @dev Returns the remaining number of tokens that `spender` will be
  * allowed to spend on behalf of `owner` through {transferFrom}. This is
  * zero by default.
    *
    * This value changes when {approve} or {transferFrom} are called.
    */
  function allowance(address owner, address spender) external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.sdexAllowances[owner][spender];
  }

  /**
  * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
  *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * IMPORTANT: Beware that changing an allowance with this method brings the risk
  * that someone may use both the old and the new allowance by unfortunate
  * transaction ordering. One possible solution to mitigate this race
  * condition is to first reduce the spender's allowance to 0 and set the
  * desired value afterwards:
  * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    *
    * Emits an {Approval} event.
    */
  function approve(address spender, uint256 amount) external returns (bool) {
    _approve(_msgSender(), spender, amount);
    return true;
  }

  /**
  * @dev Moves `amount` tokens from `sender` to `recipient` using the
  * allowance mechanism. `amount` is then deducted from the caller's
  * allowance.
  *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * Emits a {Transfer} event.
    */
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool) {
    AppStorage storage s = LibAppStorage.diamondStorage();

    _transfer(sender, recipient, amount);

    uint256 currentAllowance = s.sdexAllowances[sender][_msgSender()];
    require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
    unchecked {
      _approve(sender, _msgSender(), currentAllowance - amount);
    }

    return true;
  }

  function _transfer(
    address sender,
    address recipient,
    uint256 amount
  ) internal {
    require(sender != address(0), "ERC20: transfer from the zero address");
    require(recipient != address(0), "ERC20: transfer to the zero address");

    AppStorage storage s = LibAppStorage.diamondStorage();

    uint256 senderBalance = s.sdexBalances[sender];
    require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
    unchecked {
      s.sdexBalances[sender] = senderBalance - amount;
    }
    s.sdexBalances[recipient] += amount;

    emit Transfer(sender, recipient, amount);
  }
  function _approve(
    address owner,
    address spender,
    uint256 amount
  ) internal {
    require(owner != address(0), "ERC20: approve from the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");

    AppStorage storage s = LibAppStorage.diamondStorage();

    s.sdexAllowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }
}
