pragma solidity 0.8.7;

import 'contracts/pancake/pancake-lib/math/SafeMath.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';

import "./CakeToken.sol";
import "./SyrupBar.sol";

import "hardhat/console.sol";

interface IMigratorChef {
	// Perform LP token migration from legacy PancakeSwap to CakeSwap.
	// Take the current LP token address and return the new LP token address.
	// Migrator should have full access to the caller's LP token.
	// Return the new LP token address.
	//
	// XXX Migrator must have allowance access to PancakeSwap LP tokens.
	// CakeSwap must mint EXACTLY the same amount of CakeSwap LP tokens or
	// else something bad will happen. Traditional PancakeSwap does not
	// do that so be careful!
	function migrate(IBEP20 token) external returns (IBEP20);
}

// MasterChef is the master of Cake. He can make Cake and he is a fair guy.
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once CAKE is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.
contract MasterChefNew is Ownable {
	using SafeMath for uint256;
	using SafeBEP20 for IBEP20;

	uint256 unity = 1e27;

	struct UserPosition {
		uint256 timeStart;
		uint256 timeEnd;
		uint256[] amounts;
	}

	struct UserTokenData {
		uint256 amount;
		uint256 rewardDebt;
	}
	struct UserInfo {
		UserTokenData[] tokenData;
		UserPosition[] positions;
		uint256 lastRewardBlock;
	}
	// userInfo[poolId][userAddress]
	mapping (uint256 => mapping (address => UserInfo)) internal userInfo;
	// userInfoPositionIndices[poolId][userAddress][index]
	struct PoolTokenData {
		IBEP20 token;
		uint256 supply;
		uint256 accCakePerShare;
	}
	struct PoolInfo {
		PoolTokenData[] tokenData;
		uint256 allocPoint;
		uint256 lastRewardBlock;
	}
	uint256 public poolLength = 0;
	mapping(uint256 => PoolInfo) internal poolInfo;

	// The CAKE TOKEN!
	CakeToken public cake;
	// The SYRUP TOKEN!
	SyrupBar public syrup;
	// Dev address.
	address public devaddr;
	// Penalty pool Address
	address public penaltyAddress;
	// CAKE tokens created per block.
	uint256 public cakePerBlock;
	// Bonus muliplier for early cake makers.
	uint256 public BONUS_MULTIPLIER = 1;
	// The migrator contract. It has a lot of power. Can only be set through governance (owner).
	IMigratorChef public migrator;

	// Total allocation points. Must be the sum of all allocation points in all pools.
	uint256 public totalAllocPoint = 0;
	// The block number when CAKE mining starts.
	uint256 public startBlock;

	event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
	event Withdraw(address indexed user, uint256 indexed pid);
	event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256[] amounts);

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
	function updateStakingPool() internal {
		uint256 points = 0;
		// pid = 1 -> pid = 1 (rm cake pool)
		for (uint256 pid = 0; pid < poolLength; ++pid) {
			points = points.add(poolInfo[pid].allocPoint);
		}
		totalAllocPoint = points;
		/* The div(3) mystery and the cake pool
		if (points != 0) {
			points = points.div(3);
			totalAllocPoint = totalAllocPoint.sub(poolInfo[0].allocPoint).add(points);
			poolInfo[0].allocPoint = points;
			}
		 */
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

	// Return reward multiplier over the given _from to _to block.
	function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
		return _to.sub(_from).mul(BONUS_MULTIPLIER);
	}

	// View function to see pending CAKEs on frontend.
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

	// Update reward variables for all pools. Be careful of gas spending!
	function massUpdatePools() public {
		for (uint256 pid = 0; pid < poolLength; ++pid) {
			updatePool(pid);
		}
	}

	function updatePool(uint256 _pid) public {
		PoolInfo storage pool = poolInfo[_pid];
		if (block.number <= pool.lastRewardBlock) {
			return;
		}
		uint256[] memory supplies = new uint256[](pool.tokenData.length);
		uint256 supplySum = 0;
		for (uint j=0; j < pool.tokenData.length; j++) {
			supplies[j] = pool.tokenData[j].supply; 
			supplySum += pool.tokenData[j].supply;
		}
		if (supplySum == 0) {
			pool.lastRewardBlock = block.number;
			return;
		}
		uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
		uint256 cakeReward = multiplier.mul(cakePerBlock).mul(pool.allocPoint).div(totalAllocPoint);
		// Lol - are they really taking 10% of cake mint to personal addr?
		//cake.mint(devaddr, cakeReward.div(10));
		cake.mint(address(this), cakeReward);
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].accCakePerShare =  pool.tokenData[j].accCakePerShare + (cakeReward)* unity / (pool.tokenData.length*supplies[j]); 
		}
		pool.lastRewardBlock = block.number;
	}

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
		}

		for (uint i = _positionid; i<user.positions.length-1; i++){
			user.positions[i] = user.positions[i+1];
		}
		user.positions.pop(); 

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

	function calcRefund(uint256 timeStart, uint256 timeEnd, uint256 amount) public view returns (uint256 refund, uint256 penalty) {
		uint256 timeElapsed = block.timestamp - timeStart;
		uint256 timeTotal = timeEnd - timeStart;
		uint256 proportion = (timeElapsed * unity) / timeTotal;
		uint256 refund = amount * proportion / unity;
		uint256 penalty = amount - refund;
		require(amount == penalty + refund, 'calc fund is leaking rounding errors');
		return (refund, penalty);

	}
	// Stake CAKE tokens to MasterChef

	function enterStaking(
		uint256 _amount,
		uint256 _timeStake
	) public {
		PoolInfo storage pool = poolInfo[0];
		UserInfo storage user = userInfo[0][msg.sender];

		uint256[] memory amountArr = new uint256[](1);
		amountArr[0] = _amount;
		UserPosition memory newPosition  = UserPosition({
			timeStart: block.timestamp,
			timeEnd: block.timestamp + _timeStake,
			amounts: amountArr
		});

		updatePool(0);
		if (user.tokenData.length == 0) {
			//new staker
			UserTokenData memory cakeTokenData = UserTokenData({
				amount: 0,
				rewardDebt: 0
			});
			user.tokenData.push(cakeTokenData);
		}
		if(_amount > 0) {
			pool.tokenData[0].token.safeTransferFrom(address(msg.sender), address(this), _amount);
			user.tokenData[0].amount = user.tokenData[0].amount.add(_amount);
		}
		pool.tokenData[0].supply = pool.tokenData[0].supply + _amount;

		user.positions.push(newPosition);

		syrup.mint(msg.sender, _amount);
		emit Deposit(msg.sender, 0, amountArr);
	}

	// Withdraw CAKE tokens from STAKING.
	function leaveStaking(uint256 _position) public {
		PoolInfo storage pool = poolInfo[0];
		UserInfo storage user = userInfo[0][msg.sender];
		UserPosition memory currentPosition = user.positions[_position];
		uint256 _amount = currentPosition.amounts[0];
		require(user.tokenData[0].amount >= _amount, "withdraw: not good");
		updatePool(0);
		// further questions about the pending story 
		// especially 'rewardDebt'
		// storing amount in penalty, vs amount out penalty may be a good idea
		uint256 pending = _amount * pool.tokenData[0].accCakePerShare / unity;
		if (pending > 0) {
			if (block.timestamp < currentPosition.timeEnd) {
				safeCakeTransfer(penaltyAddress, pending);
			} else {
				safeCakeTransfer(msg.sender, pending);
			}  
		}

		if(_amount > 0) {
			user.tokenData[0].amount = user.tokenData[0].amount.sub(_amount);
			if (block.timestamp < currentPosition.timeEnd) {
				(uint256 refund, uint256 penalty) = calcRefund(
					user.positions[_position].timeStart,
					user.positions[_position].timeEnd,
					_amount
				);
				pool.tokenData[0].token.safeTransfer(
					address(msg.sender),
					refund
				);
				pool.tokenData[0].token.safeTransfer(
					penaltyAddress,
					penalty
				);
			} else {
				pool.tokenData[0].token.safeTransfer(address(msg.sender), _amount);
			}
			pool.tokenData[0].supply -= _amount;
		}
		for (uint i = _position; i<user.positions.length-1; i++){
			user.positions[i] = user.positions[i+1];
		}
		user.positions.pop(); 

		syrup.burn(msg.sender, _amount);
		emit Withdraw(msg.sender, 0);
	}
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

	// Safe cake transfer function, just in case if rounding error causes pool to not have enough CAKEs.
	function safeCakeTransfer(address _to, uint256 _amount) internal {
		uint256 cakeBal = cake.balanceOf(address(this));
		if (_amount > cakeBal) {
			cake.transfer(_to, cakeBal);
		} else {
			cake.transfer(_to, _amount);
		}
	}
	// Update dev address by the previous dev.
	function dev(address _devaddr) public {
		require(msg.sender == devaddr, "dev: wut?");
		devaddr = _devaddr;
	}
}
