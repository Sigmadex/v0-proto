/**
 *Submitted for verification at BscScan.com on 2021-04-29
 */

// File: @openzeppelin/contracts/utils/Context.sol

pragma solidity 0.8.9;

import 'contracts/pancake/pancake-lib/GSN/Context.sol';
import 'contracts/pancake/pancake-lib/math/SafeMath.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';
import 'contracts/pancake/pancake-lib/utils/Address.sol';
import 'hardhat/console.sol';


import './libs/IERC20.sol';
import './libs/SafeERC20.sol';
import './libs/Pausable.sol';

import './MasterChef/interfaces/IMasterPantry.sol';
import './MasterChef/interfaces/IAutoCakeChef.sol';
import './MasterChef/interfaces/IKitchen.sol';
import './MasterChef/interfaces/ICookBook.sol';
import './MasterChef/interfaces/ICashier.sol';

import 'contracts/NFT/Rewards/interfaces/ISDEXReward.sol';

contract CakeVault is Ownable, Pausable {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  uint256 unity = 1e27;

  struct UserPosition {
    uint256 timeStart;
    uint256 timeEnd;
    uint256 amount;
    uint256 startBlock;
    address nftReward;
    uint256 nftid;
  }

  struct UserInfo {
    uint256 shares; // number of shares for a user
    uint256 lastDepositedTime; // keeps track of deposited time for potential penalty
    uint256 cakeAtLastUserAction; // keeps track of cake deposited at the last user action
    uint256 lastUserActionTime; // keeps track of the last user action time
    UserPosition[] positions; // tracks users staked for a time period
  }

  IERC20 public  token; // Cake token
  IERC20 public immutable receiptToken; // Syrup token

  IMasterPantry masterPantry;
  IAutoCakeChef immutable autoCakeChef;
  IKitchen immutable kitchen;
  ICookBook immutable cookBook;
  ICashier  immutable cashier;

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

  constructor(
    //IERC20 _token,
    //IERC20 _receiptToken,
    address _masterPantry,
    address _kitchen,
    address _cookBook,
    address _autoCakeChef,
    address _cashier,
    address _admin,
    address _treasury
  ) public {
    masterPantry = IMasterPantry(_masterPantry);
    token = IERC20(address(masterPantry.cake()));
    receiptToken = IERC20(address(masterPantry.syrup()));
    autoCakeChef = IAutoCakeChef(_autoCakeChef);
    kitchen = IKitchen(_kitchen);
    cookBook = ICookBook(_cookBook);
    cashier = ICashier(_cashier);
    admin = _admin;
    treasury = _treasury;

    // Infinite approve
    IERC20(token).safeApprove(address(_autoCakeChef), type(uint256).max);
  }

  /**
  * @notice Checks if the msg.sender is the admin address
  */
  modifier onlyAdmin() {
    require(msg.sender == admin, "admin: wut?");
    _;
  }

  function getUserInfo(address _user) public view returns (UserInfo memory) {
    return userInfo[_user];
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
  function deposit(
    uint256 _amount,
    uint256 _timeStake,
    address _nftReward,
    uint256 _nftid
  ) external whenNotPaused notContract {
    require(_amount > 0, "Nothing to deposit");
    UserPosition memory newPosition = UserPosition({
      timeStart: block.timestamp,
      timeEnd: block.timestamp + _timeStake,
      amount: _amount,
      startBlock: block.number,
      nftReward: address(0),
      nftid: 0
    });
    if (_nftReward != address(0)) {
      require(ISDEXReward(_nftReward).getBalanceOf(msg.sender, _nftid) > 0, "User does not have this nft");
      newPosition.nftReward = _nftReward;
      newPosition.nftid = _nftid;
      uint256[] memory amounts = new uint256[](1);
      amounts[0] = _amount;
      ISDEXReward(_nftReward)._beforeDeposit(
        msg.sender,
        0,
        amounts,
        _timeStake,
        _nftid
      );
    }
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

    user.positions.push(newPosition);

    masterPantry.addTimeAmountGlobal(address(token), (_amount*_timeStake));
    
    _earn();

    if (_nftReward != address(0)) {
      uint256[] memory amounts = new uint256[](1);
      amounts[0] = _amount;
      ISDEXReward(_nftReward)._afterDeposit(
        msg.sender,
        0,
        amounts,
        _timeStake,
        _nftid
      );
    }

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
    autoCakeChef.leaveStakingCakeVault(0);
    // definitely question these in light of penalty
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
    kitchen.emergencyWithdraw(0);
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
  function calculateHarvestCakeRewards() public returns (uint256) {
    uint256 amount = cookBook.pendingCake(0, address(this));
    amount = amount.add(available());
    uint256 currentCallFee = amount.mul(callFee).div(10000);

    return currentCallFee;
  }

  /**
  * @notice Calculates the total pending rewards that can be restaked
  * @return Returns total pending cake rewards
  */
  function calculateTotalPendingCakeRewards() public returns (uint256) {
    uint256 amount = (cookBook.pendingCake(0, address(this)));
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
  * @param _positionid: Position index
  */
  function withdraw(uint256 _positionid) public notContract {
    UserInfo storage user = userInfo[msg.sender];
    if (user.positions[_positionid].nftReward != address(0)) {
      uint256[] memory amounts = new uint256[](1);
      amounts[0] = user.positions[_positionid].amount;
      ISDEXReward(user.positions[_positionid].nftReward)._beforeWithdraw(
        msg.sender,
        0,
        _positionid,
        user.positions[_positionid].nftid
      );
    }
    user = userInfo[msg.sender];
    uint256 shares = user.positions[_positionid].amount;
    require(shares > 0, "Nothing to withdraw");
    require(shares <= user.shares, "Withdraw amount exceeds balance");
    uint256 currentAmount = (balanceOf() * shares) / totalShares;
    user.shares -= shares;
    totalShares -= shares;

    uint256 bal = available();
    if (bal < currentAmount) {
      uint256 balWithdraw = currentAmount - (bal);
      autoCakeChef.leaveStakingCakeVault(balWithdraw);
      uint256 balAfter = available();
      //theoretical
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
    uint256 timeAmount = (user.positions[_positionid].amount*(user.positions[_positionid].timeEnd - user.positions[_positionid].timeStart));
    if ( block.timestamp >= user.positions[_positionid].timeEnd) {
      cashier.requestReward(
        msg.sender,
        address(token),
        timeAmount
      );
      token.safeTransfer(msg.sender, currentAmount);
    } else {
				(uint256 refund, uint256 penalty) = cookBook.calcRefund(
					user.positions[_positionid].timeStart,
					user.positions[_positionid].timeEnd,
					currentAmount
				);
				token.safeTransfer(
					address(msg.sender),
					refund
				);
			  token.safeTransfer(
					address(cashier),
					penalty
				);
    }
    masterPantry.subTimeAmountGlobal(
      address(token),
      timeAmount
    );
    user.positions[_positionid].amount = 0;
    if (user.positions[_positionid].nftReward != address(0)) {
      uint256[] memory amounts = new uint256[](1);
      amounts[0] = user.positions[_positionid].amount;
      ISDEXReward(user.positions[_positionid].nftReward)._afterWithdraw(
        msg.sender,
        0,
        _positionid,
        user.positions[_positionid].nftid
      );
    }

    emit Withdraw(msg.sender, currentAmount, shares);
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
    IMasterPantry.UserInfo memory chefUserInfo = masterPantry.getUserInfo(0, address(this));
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
      autoCakeChef.enterStakingCakeVault(bal);
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
