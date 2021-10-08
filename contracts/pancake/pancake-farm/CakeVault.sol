/**
 *Submitted for verification at BscScan.com on 2021-04-29
 */

// File: @openzeppelin/contracts/utils/Context.sol

pragma solidity 0.8.7;

import 'contracts/pancake/pancake-lib/GSN/Context.sol';
import 'contracts/pancake/pancake-lib/math/SafeMath.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';
import 'contracts/pancake/pancake-lib/utils/Address.sol';
import 'hardhat/console.sol';

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @dev Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address recipient, uint256 amount) external returns (bool);

  /**
  * @dev Returns the remaining number of tokens that `spender` will be
  * allowed to spend on behalf of `owner` through {transferFrom}. This is
  * zero by default.
    *
    * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address owner, address spender) external view returns (uint256);

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
  function approve(address spender, uint256 amount) external returns (bool);

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
      ) external returns (bool);

  /**
  * @dev Emitted when `value` tokens are moved from one account (`from`) to
  * another (`to`).
  *
  * Note that `value` may be zero.
   */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /**
  * @dev Emitted when the allowance of a `spender` for an `owner` is set by
  * a call to {approve}. `value` is the new allowance.
    */
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
  using SafeMath for uint256;
  using Address for address;

  function safeTransfer(
    IERC20 token,
    address to,
    uint256 value
  ) internal {
    _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
  }

  function safeTransferFrom(
    IERC20 token,
    address from,
    address to,
    uint256 value
  ) internal {
    _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
  }

  /**
  * @dev Deprecated. This function has issues similar to the ones found in
  * {IERC20-approve}, and its usage is discouraged.
    *
    * Whenever possible, use {safeIncreaseAllowance} and
  * {safeDecreaseAllowance} instead.
    */
  function safeApprove(
    IERC20 token,
    address spender,
    uint256 value
  ) internal {
    // safeApprove should only be called when setting an initial allowance,
    // or when resetting it to zero. To increase and decrease it, use
    // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
    // solhint-disable-next-line max-line-length
    require(
      (value == 0) || (token.allowance(address(this), spender) == 0),
      "SafeERC20: approve from non-zero to non-zero allowance"
    );
    _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
  }

  function safeIncreaseAllowance(
    IERC20 token,
    address spender,
    uint256 value
  ) internal {
    uint256 newAllowance = token.allowance(address(this), spender).add(value);
    _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
  }

  function safeDecreaseAllowance(
    IERC20 token,
    address spender,
    uint256 value
  ) internal {
    uint256 newAllowance =
      token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
    _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
  }

  /**
  * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
  * on the return value: the return value is optional (but if data is returned, it must not be false).
      * @param token The token targeted by the call.
        * @param data The call data (encoded using abi.encode or one of its variants).
   */
  function _callOptionalReturn(IERC20 token, bytes memory data) private {
    // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
    // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
    // the target address contains contract code and also asserts for success in the low-level call.

  bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
  if (returndata.length > 0) {
    // Return data is optional
    // solhint-disable-next-line max-line-length
    require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
  }
}
}

// File: @openzeppelin/contracts/utils/Pausable.sol


/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
  /**
  * @dev Emitted when the pause is triggered by `account`.
   */
  event Paused(address account);

  /**
  * @dev Emitted when the pause is lifted by `account`.
  */
  event Unpaused(address account);

  bool private _paused;

  /**
  * @dev Initializes the contract in unpaused state.
   */
  constructor() internal {
    _paused = false;
  }

  /**
   * @dev Returns true if the contract is paused, and false otherwise.
   */
  function paused() public view virtual returns (bool) {
    return _paused;
  }

  /**
  * @dev Modifier to make a function callable only when the contract is not paused.
  *
    * Requirements:
    *
    * - The contract must not be paused.
   */
  modifier whenNotPaused() {
    require(!paused(), "Pausable: paused");
    _;
  }

  /**
  * @dev Modifier to make a function callable only when the contract is paused.
  *
    * Requirements:
    *
    * - The contract must be paused.
   */
  modifier whenPaused() {
    require(paused(), "Pausable: not paused");
    _;
  }

  /**
  * @dev Triggers stopped state.
  *
    * Requirements:
    *
    * - The contract must not be paused.
   */
  function _pause() internal virtual whenNotPaused {
    _paused = true;
    emit Paused(_msgSender());
  }

  /**
  * @dev Returns to normal state.
  *
    * Requirements:
    *
    * - The contract must be paused.
   */
  function _unpause() internal virtual whenPaused {
    _paused = false;
    emit Unpaused(_msgSender());
  }
}


  interface IMasterChefNew {
    struct UserTokenData {
      uint256 amount;
      uint256 rewardDebt;
    }
    struct UserInfo {
      UserTokenData[] tokenData;
      uint256 lastRewardBlock;
    }
    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function enterStaking(uint256 _amount) external;

    function leaveStaking(uint256 _amount) external;

    function pendingCake(uint256 _pid, address _user) external view returns (uint256);

    function getUserInfo(uint256 _pid, address _user) external view returns (UserInfo memory);

    function emergencyWithdraw(uint256 _pid) external;
  }

  // File: contracts/CakeVault.sol


  contract CakeVault is Ownable, Pausable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct UserInfo {
      uint256 shares; // number of shares for a user
      uint256 lastDepositedTime; // keeps track of deposited time for potential penalty
      uint256 cakeAtLastUserAction; // keeps track of cake deposited at the last user action
      uint256 lastUserActionTime; // keeps track of the last user action time
    }

    IERC20 public immutable token; // Cake token
    IERC20 public immutable receiptToken; // Syrup token

    IMasterChefNew public immutable masterchef;

    mapping(address => UserInfo) public userInfo;

    uint256 public totalShares;
    uint256 public lastHarvestedTime;
    address public admin;
    address public treasury;

    uint256 public constant MAX_PERFORMANCE_FEE = 500; // 5%
    uint256 public constant MAX_CALL_FEE = 100; // 1%
    uint256 public constant MAX_WITHDRAW_FEE = 100; // 1%
    uint256 public constant MAX_WITHDRAW_FEE_PERIOD = 72 hours; // 3 days

    uint256 public performanceFee = 200; // 2%
    uint256 public callFee = 25; // 0.25%
    uint256 public withdrawFee = 10; // 0.1%
    uint256 public withdrawFeePeriod = 72 hours; // 3 days

    event Deposit(address indexed sender, uint256 amount, uint256 shares, uint256 lastDepositedTime);
    event Withdraw(address indexed sender, uint256 amount, uint256 shares);
    event Harvest(address indexed sender, uint256 performanceFee, uint256 callFee);
    event Pause();
    event Unpause();

    /**
    * @notice Constructor
    * @param _token: Cake token contract
    * @param _receiptToken: Syrup token contract
    * @param _masterchef: MasterChef contract
    * @param _admin: address of the admin
    * @param _treasury: address of the treasury (collects fees)
    */
    constructor(
      IERC20 _token,
      IERC20 _receiptToken,
      IMasterChefNew _masterchef,
      address _admin,
      address _treasury
    ) public {
      token = _token;
      receiptToken = _receiptToken;
      masterchef = IMasterChefNew(_masterchef);
      admin = _admin;
      treasury = _treasury;

      // Infinite approve
      IERC20(_token).safeApprove(address(_masterchef), type(uint256).max);
    }

    /**
    * @notice Checks if the msg.sender is the admin address
    */
    modifier onlyAdmin() {
      require(msg.sender == admin, "admin: wut?");
      _;
    }

    /**
    * @notice Checks if the msg.sender is a contract or a proxy
    */
    modifier notContract() {
      require(!_isContract(msg.sender), "contract not allowed");
      require(msg.sender == tx.origin, "proxy contract not allowed");
      _;
    }

    /**
    * @notice Deposits funds into the Cake Vault
    * @dev Only possible when contract not paused.
      * @param _amount: number of tokens to deposit (in CAKE)
    */
    function deposit(uint256 _amount) external whenNotPaused notContract {
      require(_amount > 0, "Nothing to deposit");

      uint256 pool = balanceOf();
      token.safeTransferFrom(msg.sender, address(this), _amount);
      uint256 currentShares = 0;
      if (totalShares != 0) {
        currentShares = (_amount.mul(totalShares)).div(pool);
      } else {
        currentShares = _amount;
      }
      UserInfo storage user = userInfo[msg.sender];

      user.shares = user.shares.add(currentShares);
      user.lastDepositedTime = block.timestamp;

      totalShares = totalShares.add(currentShares);

      user.cakeAtLastUserAction = user.shares.mul(balanceOf()).div(totalShares);
      user.lastUserActionTime = block.timestamp;

      _earn();

      emit Deposit(msg.sender, _amount, currentShares, block.timestamp);
    }

    /**
    * @notice Withdraws all funds for a user
    */
    function withdrawAll() external notContract {
      withdraw(userInfo[msg.sender].shares);
    }

    /**
    * @notice Reinvests CAKE tokens into MasterChef
    * @dev Only possible when contract not paused.
      */
    function harvest() external notContract whenNotPaused {
      IMasterChefNew(masterchef).leaveStaking(0);

      uint256 bal = available();
      uint256 currentPerformanceFee = bal.mul(performanceFee).div(10000);
      token.safeTransfer(treasury, currentPerformanceFee);

      uint256 currentCallFee = bal.mul(callFee).div(10000);
      token.safeTransfer(msg.sender, currentCallFee);

      _earn();

      lastHarvestedTime = block.timestamp;

      emit Harvest(msg.sender, currentPerformanceFee, currentCallFee);
    }

    /**
    * @notice Sets admin address
    * @dev Only callable by the contract owner.
      */
    function setAdmin(address _admin) external onlyOwner {
      require(_admin != address(0), "Cannot be zero address");
      admin = _admin;
    }

    /**
    * @notice Sets treasury address
    * @dev Only callable by the contract owner.
      */
    function setTreasury(address _treasury) external onlyOwner {
      require(_treasury != address(0), "Cannot be zero address");
      treasury = _treasury;
    }

    /**
    * @notice Sets performance fee
    * @dev Only callable by the contract admin.
      */
    function setPerformanceFee(uint256 _performanceFee) external onlyAdmin {
      require(_performanceFee <= MAX_PERFORMANCE_FEE, "performanceFee cannot be more than MAX_PERFORMANCE_FEE");
      performanceFee = _performanceFee;
    }

    /**
    * @notice Sets call fee
    * @dev Only callable by the contract admin.
      */
    function setCallFee(uint256 _callFee) external onlyAdmin {
      require(_callFee <= MAX_CALL_FEE, "callFee cannot be more than MAX_CALL_FEE");
      callFee = _callFee;
    }

    /**
    * @notice Sets withdraw fee
    * @dev Only callable by the contract admin.
      */
    function setWithdrawFee(uint256 _withdrawFee) external onlyAdmin {
      require(_withdrawFee <= MAX_WITHDRAW_FEE, "withdrawFee cannot be more than MAX_WITHDRAW_FEE");
      withdrawFee = _withdrawFee;
    }

    /**
    * @notice Sets withdraw fee period
    * @dev Only callable by the contract admin.
      */
    function setWithdrawFeePeriod(uint256 _withdrawFeePeriod) external onlyAdmin {
      require(
        _withdrawFeePeriod <= MAX_WITHDRAW_FEE_PERIOD,
        "withdrawFeePeriod cannot be more than MAX_WITHDRAW_FEE_PERIOD"
      );
      withdrawFeePeriod = _withdrawFeePeriod;
    }

    /**
    * @notice Withdraws from MasterChef to Vault without caring about rewards.
    * @dev EMERGENCY ONLY. Only callable by the contract admin.
      */
    function emergencyWithdraw() external onlyAdmin {
      IMasterChefNew(masterchef).emergencyWithdraw(0);
    }

    /**
    * @notice Withdraw unexpected tokens sent to the Cake Vault
    */
    function inCaseTokensGetStuck(address _token) external onlyAdmin {
      require(_token != address(token), "Token cannot be same as deposit token");
      require(_token != address(receiptToken), "Token cannot be same as receipt token");

      uint256 amount = IERC20(_token).balanceOf(address(this));
      IERC20(_token).safeTransfer(msg.sender, amount);
    }

    /**
    * @notice Triggers stopped state
    * @dev Only possible when contract not paused.
      */
    function pause() external onlyAdmin whenNotPaused {
      _pause();
      emit Pause();
    }

    /**
    * @notice Returns to normal state
    * @dev Only possible when contract is paused.
      */
    function unpause() external onlyAdmin whenPaused {
      _unpause();
      emit Unpause();
    }

    /**
    * @notice Calculates the expected harvest reward from third party
    * @return Expected reward to collect in CAKE
    */
    function calculateHarvestCakeRewards() external view returns (uint256) {
      uint256 amount = IMasterChefNew(masterchef).pendingCake(0, address(this));
      amount = amount.add(available());
      uint256 currentCallFee = amount.mul(callFee).div(10000);

      return currentCallFee;
    }

    /**
    * @notice Calculates the total pending rewards that can be restaked
    * @return Returns total pending cake rewards
    */
    function calculateTotalPendingCakeRewards() external view returns (uint256) {
      uint256 amount = IMasterChefNew(masterchef).pendingCake(0, address(this));
      amount = amount.add(available());

      return amount;
    }

    /**
    * @notice Calculates the price per share
    */
    function getPricePerFullShare() external view returns (uint256) {
      return totalShares == 0 ? 1e18 : balanceOf().mul(1e18).div(totalShares);
    }

    /**
    * @notice Withdraws from funds from the Cake Vault
    * @param _shares: Number of shares to withdraw
    */
    function withdraw(uint256 _shares) public notContract {
      UserInfo storage user = userInfo[msg.sender];
      require(_shares > 0, "Nothing to withdraw");
      require(_shares <= user.shares, "Withdraw amount exceeds balance");

      uint256 currentAmount = (balanceOf().mul(_shares)).div(totalShares);
      user.shares = user.shares.sub(_shares);
      totalShares = totalShares.sub(_shares);
      uint256 bal = available();
      if (bal < currentAmount) {
        uint256 balWithdraw = currentAmount.sub(bal);
        IMasterChefNew(masterchef).leaveStaking(balWithdraw);
        uint256 balAfter = available();
        uint256 diff = balAfter.sub(bal);
        if (diff < balWithdraw) {
          currentAmount = bal.add(diff);
        }
      }
      if (block.timestamp < user.lastDepositedTime.add(withdrawFeePeriod)) {
        uint256 currentWithdrawFee = currentAmount.mul(withdrawFee).div(10000);
        token.safeTransfer(treasury, currentWithdrawFee);
        currentAmount = currentAmount.sub(currentWithdrawFee);
      }
      if (user.shares > 0) {
        user.cakeAtLastUserAction = user.shares.mul(balanceOf()).div(totalShares);
      } else {
        user.cakeAtLastUserAction = 0;
      }

      user.lastUserActionTime = block.timestamp;
      token.safeTransfer(msg.sender, currentAmount);

      emit Withdraw(msg.sender, currentAmount, _shares);
    }

    /**
    * @notice Custom logic for how much the vault allows to be borrowed
    * @dev The contract puts 100% of the tokens to work.
     */
    function available() public view returns (uint256) {
      return token.balanceOf(address(this));
    }

    /**
    * @notice Calculates the total underlying tokens
    * @dev It includes tokens held by the contract and held in MasterChef
    */
    function balanceOf() public view returns (uint256) {
      IMasterChefNew.UserInfo memory chefUserInfo = IMasterChefNew(masterchef).getUserInfo(0, address(this));
      if (chefUserInfo.tokenData.length == 0) {
        return token.balanceOf(address(this));
      } else {
        return token.balanceOf(address(this)).add(chefUserInfo.tokenData[0].amount);
      }
    }

    /**
     * @notice Deposits tokens into MasterChef to earn staking rewards
     */
    function _earn() internal {
      uint256 bal = available();
      if (bal > 0) {
        IMasterChefNew(masterchef).enterStaking(bal);
      }
    }

    /**
    * @notice Checks if address is a contract
    * @dev It prevents contract from being targetted
     */
    function _isContract(address addr) internal view returns (bool) {
      uint256 size;
      assembly {
        size := extcodesize(addr)
      }
      return size > 0;
    }
  }
