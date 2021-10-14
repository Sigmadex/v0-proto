pragma solidity 0.8.7;

import 'contracts/pancake/pancake-lib/math/SafeMath.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import "../CakeToken.sol";
import "../SyrupBar.sol";

import "./interfaces/IMigratorChef.sol";
import "./interfaces/IKitchen.sol";
import "./interfaces/IMasterPantry.sol";
import "./interfaces/ICookBook.sol";
import "hardhat/console.sol";


// MasterChef is the master of Cake. He can make Cake and he is a fair guy.
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once CAKE is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.
contract MasterChefRefactor is Ownable {
	using SafeMath for uint256;
	using SafeBEP20 for IBEP20;

	event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
	event Withdraw(address indexed user, uint256 indexed pid);

  IKitchen immutable kitchen;
  IMasterPantry immutable masterPantry;
  ICookBook immutable cookBook;

	constructor(
    address _masterPantry,
    address _kitchen,
    address _cookBook
	) public {
    masterPantry = IMasterPantry(_masterPantry);
    kitchen = IKitchen(_kitchen);
    cookBook = ICookBook(_cookBook);
	}

	// Add a new lp to the pool. Can only be called by the owner.
	// XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.

	function add(
		IBEP20[] memory _tokens,
		uint256 _allocPoint,
		bool _withUpdate
	) public onlyOwner {
		if (_withUpdate) {
			kitchen.massUpdatePools();
		}
		uint256 lastRewardBlock = block.number > masterPantry.startBlock() ? block.number : masterPantry.startBlock();
		uint256 totalAllocPoint = masterPantry.totalAllocPoint().add(_allocPoint);
    IMasterPantry.PoolInfo memory newPool = IMasterPantry.PoolInfo({
      tokenData: new IMasterPantry.PoolTokenData[](_tokens.length),
      allocPoint: _allocPoint,
      lastRewardBlock: lastRewardBlock
    });
		for (uint j=0; j < _tokens.length; j++) {
			newPool.tokenData[j] = (IMasterPantry.PoolTokenData({
				token: _tokens[j],
				supply: 0,
				accCakePerShare: 0
			}));
		}
    masterPantry.addPool(newPool);
    masterPantry.setTotalAllocPoint(totalAllocPoint);
		kitchen.updateStakingPool();
	}


	// View function to see pending CAKEs on frontend.
  /*
  */

	function deposit(
		uint256 _pid,
		uint256[] memory _amounts,
		uint256 timeStake
	) public {
		require(_pid != 0, 'cake farm detected, please use enterstaking, or the cakeVault.deposit');
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(_pid);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(_pid, msg.sender);
		require(pool.tokenData.length == _amounts.length, 'please insure the amounts match the amount of cryptos in pool');
		kitchen.updatePool(_pid);
		//reward debt question

		IMasterPantry.UserPosition memory newPosition  = IMasterPantry.UserPosition({
			timeStart: block.timestamp,
			timeEnd: block.timestamp + timeStake,
			amounts: _amounts
		});

		for (uint j=0; j < pool.tokenData.length; j++) {
			if (user.tokenData.length <= j) {
				//first deposit
				user.tokenData[j] = (IMasterPantry.UserTokenData({
					amount: 0,
					rewardDebt: 0
				}));
			}
			uint256 amount = user.tokenData[j].amount;
			uint256 rewardDebt = user.tokenData[j].rewardDebt;
			uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;

			pool.tokenData[j].token.safeTransferFrom(
				address(msg.sender),
				address(this),
				_amounts[j]
			);
			user.tokenData[j].amount = amount + _amounts[j];
			pool.tokenData[j].supply += _amounts[j];
		}
		user.positions[user.positions.length+1] = newPosition;
    masterPantry.setUserInfo(_pid, msg.sender, user);
    masterPantry.setPoolInfo(_pid, pool);
		emit Deposit(msg.sender, _pid, _amounts);
	}
	// Deposit LP tokens to MasterChef for CAKE allocation.

	function withdraw(
		uint256 _pid,
		uint256 _positionid
	) public {
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(_pid);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(_pid, msg.sender);
		kitchen.updatePool(_pid);
		IMasterPantry.UserPosition memory currentPosition = user.positions[_positionid];

		uint256 totalAmountShares = 0;
		for (uint j=0; j < user.tokenData.length; j++) {
			uint256 amount = currentPosition.amounts[j];
			uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;
			// pool level, verses position level pending question
			totalAmountShares += amount * accCakePerShare;
			if (currentPosition.timeEnd < block.timestamp) {
				pool.tokenData[j].token.safeTransfer(
					address(msg.sender),
					amount
				);
			} else {
				(uint256 refund, uint256 penalty) = cookBook.calcRefund(
					user.positions[_positionid].timeStart,
					user.positions[_positionid].timeEnd,
					amount
				);
				pool.tokenData[j].token.safeTransfer(
					address(msg.sender),
					refund
				);
				pool.tokenData[j].token.safeTransfer(
					masterPantry.penaltyAddress(),
					penalty
				);
			}
			user.tokenData[j].amount -= currentPosition.amounts[j];
			pool.tokenData[j].supply = pool.tokenData[j].supply - amount;
      user.positions[_positionid].amounts[j] = 0;
		}

		uint256 pending = totalAmountShares / masterPantry.unity();
		if (pending > 0) {
			if (currentPosition.timeEnd < block.timestamp) {
				kitchen.safeCakeTransfer(address(msg.sender), pending);
			} else {
				kitchen.safeCakeTransfer(masterPantry.penaltyAddress(), pending);
			}
		}
    masterPantry.setUserInfo(_pid, msg.sender, user);
    masterPantry.setPoolInfo(_pid, pool);
		emit Withdraw(msg.sender, _pid);
	}

}
