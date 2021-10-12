pragma solidity 0.8.7;

import 'contracts/pancake/pancake-lib/math/SafeMath.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import "../CakeToken.sol";
import "../SyrupBar.sol";

import "./AutoCakeChef.sol";
import "./SelfCakeChef.sol";
import "./Kitchen.sol";
import "./MasterPantry.sol";


import "hardhat/console.sol";


// MasterChef is the master of Cake. He can make Cake and he is a fair guy.
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once CAKE is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.
contract MasterChefRefactor is Ownable, AutoCakeChef, SelfCakeChef {
	using SafeMath for uint256;
	using SafeBEP20 for IBEP20;


	constructor(
		CakeToken _cake,
		SyrupBar _syrup,
		address _devaddr,
		address _penaltyAddress,
		uint256 _cakePerBlock
	) public {
		cake = _cake; 
		syrup = _syrup;
		devaddr = _devaddr;
		penaltyAddress = _penaltyAddress;
		cakePerBlock = _cakePerBlock;
		startBlock = block.number;

		PoolTokenData memory poolTokenData = PoolTokenData({
			token: _cake,
			supply: 0,
			accCakePerShare: 0
		});
		PoolInfo storage cakePool = poolInfo[poolLength];
		cakePool.tokenData.push(poolTokenData);
		cakePool.allocPoint = 1000;
		cakePool.lastRewardBlock = startBlock;
		poolLength += 1;
		totalAllocPoint = 1000;
	}
  function setCakeVault(address _cakeVault) public onlyOwner {
    cakeVault = _cakeVault;
  }

	function updateMultiplier(uint256 multiplierNumber) public onlyOwner {
		BONUS_MULTIPLIER = multiplierNumber;
	}

	// Add a new lp to the pool. Can only be called by the owner.
	// XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.

	function getPoolInfo(uint256 _pid) public returns (PoolInfo memory pool) {
		PoolInfo memory pool =  poolInfo[_pid];
		return pool;
	}

	function getUserInfo(uint256 _pid, address addr) public view returns (UserInfo memory user) {
		UserInfo memory user = userInfo[_pid][addr];
		return user;
	}

	function add(
		IBEP20[] memory _tokens,
		uint256 _allocPoint,
		bool _withUpdate
	) public onlyOwner {
		if (_withUpdate) {
			massUpdatePools();
		}
		uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
		totalAllocPoint = totalAllocPoint.add(_allocPoint);
		PoolInfo storage newPool = poolInfo[poolLength];
		newPool.allocPoint = _allocPoint;
		newPool.lastRewardBlock = lastRewardBlock;
		for (uint j=0; j < _tokens.length; j++) {
			newPool.tokenData.push(PoolTokenData({
				token: _tokens[j],
				supply: 0,
				accCakePerShare: 0
			}));
		}
		poolLength += 1;
		updateStakingPool();
	}

	// Update the given pool's CAKE allocation point. Can only be called by the owner.
	function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public onlyOwner {
		if (_withUpdate) {
			massUpdatePools();
		}
		uint256 prevAllocPoint = poolInfo[_pid].allocPoint;
		poolInfo[_pid].allocPoint = _allocPoint;
		if (prevAllocPoint != _allocPoint) {
			totalAllocPoint = totalAllocPoint.sub(prevAllocPoint).add(_allocPoint);
			updateStakingPool();
		}
	}
	// Set the migrator contract. Can only be called by the owner.
	function setMigrator(IMigratorChef _migrator) public onlyOwner {
		migrator = _migrator;
	}

	// Migrate lp token to another lp contract. Can be called by anyone. We trust that migrator contract is good.
	function migrate(uint256 _pid) public {
		require(address(migrator) != address(0), "migrate: no migrator");
		PoolInfo storage pool = poolInfo[_pid];
		for (uint j=0; j < pool.tokenData.length; j++) {
			IBEP20 token = pool.tokenData[j].token;
			uint256 bal = token.balanceOf(address(this));
			token.safeApprove(address(migrator), bal);
			IBEP20 newToken = migrator.migrate(token);
			require(bal == newToken.balanceOf(address(this)), "migrate: bad");
			pool.tokenData[j].token = newToken;
		}
	}


	// View function to see pending CAKEs on frontend.
  /*
	function pendingCake(uint256 _pid, address _user) external view returns (uint256) {
		uint256 returnResult = 0;
		PoolInfo storage pool = poolInfo[_pid];
		UserInfo storage user = userInfo[_pid][_user];
		uint256 supply = 0;
		for (uint j=0; j < pool.tokenData.length; j++) {
			supply += pool.tokenData[j].supply;
		}
		if (block.number > pool.lastRewardBlock && supply != 0) {
			uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
			uint256 cakeReward = multiplier.mul(cakePerBlock).mul(pool.allocPoint).div(totalAllocPoint); 
			for (uint j=0; j < pool.tokenData.length; j++) {
				uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;
				uint256 supply = pool.tokenData[j].supply;
				accCakePerShare = accCakePerShare + cakeReward * unity / supply;
				returnResult += user.tokenData[j].amount * accCakePerShare / unity - user.tokenData[j].rewardDebt;
			}
			return returnResult;
		}
		for (uint j=0; j < pool.tokenData.length; j++) {
			uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;
			uint256 supply = pool.tokenData[j].supply;
			returnResult += user.tokenData[j].amount * accCakePerShare / unity - user.tokenData[j].rewardDebt;
		}
		return returnResult;
	}
  */

	function deposit(
		uint256 _pid,
		uint256[] memory _amounts,
		uint256 timeStake
	) public {
		require(_pid != 0, 'cake farm detected, please use enterstaking, or the cakeVault.deposit');
		PoolInfo storage pool = poolInfo[_pid];
		UserInfo storage user = userInfo[_pid][msg.sender];
		require(pool.tokenData.length == _amounts.length, 'please insure the amounts match the amount of cryptos in pool');
		updatePool(_pid);
		//reward debt question

		UserPosition memory newPosition  = UserPosition({
			timeStart: block.timestamp,
			timeEnd: block.timestamp + timeStake,
			amounts: _amounts
		});

		for (uint j=0; j < pool.tokenData.length; j++) {
			if (user.tokenData.length <= j) {
				//first deposit
				user.tokenData.push(UserTokenData({
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
		user.positions.push(newPosition);
		emit Deposit(msg.sender, _pid, _amounts);
	}
	// Deposit LP tokens to MasterChef for CAKE allocation.

	function withdraw(
		uint256 _pid,
		uint256 _positionid
	) public {
		PoolInfo storage pool = poolInfo[_pid];
		UserInfo storage user = userInfo[_pid][msg.sender];
		updatePool(_pid);
		UserPosition memory currentPosition = user.positions[_positionid];

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
				(uint256 refund, uint256 penalty) = calcRefund(
					user.positions[_positionid].timeStart,
					user.positions[_positionid].timeEnd,
					amount
				);
				pool.tokenData[j].token.safeTransfer(
					address(msg.sender),
					refund
				);
				pool.tokenData[j].token.safeTransfer(
					penaltyAddress,
					penalty
				);
			}
			user.tokenData[j].amount -= currentPosition.amounts[j];
			pool.tokenData[j].supply = pool.tokenData[j].supply - amount;
      user.positions[_positionid].amounts[j] = 0;
		}

		uint256 pending = totalAmountShares / unity;
		if (pending > 0) {
			if (currentPosition.timeEnd < block.timestamp) {
				safeCakeTransfer(address(msg.sender), pending);
			} else {
				safeCakeTransfer(penaltyAddress, pending);
			}
		}
		emit Withdraw(msg.sender, _pid);
	}

	// Stake CAKE tokens to MasterChef



  
  // Withdraw CAKE tokens from STAKING.

	// Withdraw CAKE tokens from STAKING.
	// Withdraw without caring about rewards. EMERGENCY ONLY.
	function emergencyWithdraw(uint256 _pid) public {
		PoolInfo storage pool = poolInfo[_pid];
		UserInfo storage user = userInfo[_pid][msg.sender];
		uint256[] memory  amounts = new uint256[](pool.tokenData.length);
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].token.safeTransfer(
				address(msg.sender),
				user.tokenData[j].amount
			);
			amounts[j] = user.tokenData[j].amount;
			user.tokenData[j].amount = 0;
			user.tokenData[j].rewardDebt = 0;
		}
		emit EmergencyWithdraw(msg.sender, _pid, amounts);
	}

	// Update dev address by the previous dev.
	function dev(address _devaddr) public {
		require(msg.sender == devaddr, "dev: wut?");
		devaddr = _devaddr;
	}
}
