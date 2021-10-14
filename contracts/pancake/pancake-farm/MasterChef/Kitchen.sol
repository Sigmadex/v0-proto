pragma solidity 0.8.7;

import './CookBook.sol';
import './interfaces/IMasterPantry.sol';
import './interfaces/IACL.sol';
import 'contracts/pancake/pancake-lib/access/Ownable.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';

import '../CakeToken.sol';
contract Kitchen is Ownable {
	using SafeBEP20 for IBEP20;

	event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256[] amounts);

  IMasterPantry public  masterPantry;
	CakeToken public cake;
  IACL public acl;

  constructor(
    address _masterPantry,
    address _acl
  ) {
   masterPantry = IMasterPantry(_masterPantry);
   acl = IACL(_acl);
   cake = masterPantry.cake();
   
  }
  modifier onlyACL() {
    acl.onlyACL(msg.sender);
    _;
  }
	function updateStakingPool() public  {
		uint256 points = 0;
		// pid = 1 -> pid = 1 (rm cake pool)
		for (uint256 pid = 0; pid < masterPantry.poolLength(); ++pid) {
			points = points + masterPantry.getPoolInfo(pid).allocPoint;
		}
		masterPantry.setTotalAllocPoint(points);
		/* The div(3) mystery and the cake pool
		if (points != 0) {
			points = points.div(3);
			totalAllocPoint = totalAllocPoint.sub(poolInfo[0].allocPoint).add(points);
			poolInfo[0].allocPoint = points;
			}
		 */
	}

	// Return reward multiplier over the given _from to _to block.
	function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
		return _to - _from * masterPantry.BONUS_MULTIPLIER();
	}
	// Update reward variables for all pools. Be careful of gas spending!
	function massUpdatePools() public {
		for (uint256 pid = 0; pid < masterPantry.poolLength(); ++pid) {
			updatePool(pid);
		}
	}

	function updatePool(uint256 _pid) public {
		IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(_pid);
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
      masterPantry.setPoolInfo(_pid, pool);
			return;
		}
		uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
		uint256 cakeReward = multiplier *(masterPantry.cakePerBlock()) *(pool.allocPoint) / (masterPantry.totalAllocPoint());
		// Lol - are they really taking 10% of cake mint to personal addr?
		//cake.mint(devaddr, cakeReward.div(10));
    // cake is made in the kitchen, kept in the kitchen and provided from the kitchen 
		cake.mint(address(this), cakeReward);
		for (uint j=0; j < pool.tokenData.length; j++) {
			pool.tokenData[j].accCakePerShare =  pool.tokenData[j].accCakePerShare + cakeReward* masterPantry.unity() / (pool.tokenData.length*supplies[j]);
		}
		pool.lastRewardBlock = block.number;
    masterPantry.setPoolInfo(_pid, pool);
	}

	// Safe cake transfer function, just in case if rounding error causes pool to not have enough CAKEs.
	function safeCakeTransfer(address _to, uint256 _amount) public {
		uint256 cakeBal = cake.balanceOf(address(this));
		if (_amount > cakeBal) {
			cake.transfer(_to, cakeBal);
		} else {
			cake.transfer(_to, _amount);
		}
	}


	// Update the given pool's CAKE allocation point. Can only be called by the owner.
	function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public onlyACL {
		if (_withUpdate) {
			massUpdatePools();
		}
    IMasterPantry.PoolInfo memory poolInfo =  masterPantry.getPoolInfo(_pid);
    uint256 previousAllocPoint = poolInfo.allocPoint;
    poolInfo.allocPoint = _allocPoint;
		if (previousAllocPoint != _allocPoint) {
			uint256 totalAllocPoint = masterPantry.totalAllocPoint() - (previousAllocPoint) + (_allocPoint);
      masterPantry.setTotalAllocPoint(totalAllocPoint);
			updateStakingPool();
		}
	}

	// Migrate lp token to another lp contract. Can be called by anyone. We trust that migrator contract is good.
	function migrate(uint256 _pid) public {
		require(address(masterPantry.migrator()) != address(0), "migrate: no migrator");
		IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(_pid);
		for (uint j=0; j < pool.tokenData.length; j++) {
			IBEP20 token = pool.tokenData[j].token;
			uint256 bal = token.balanceOf(address(this));
			token.safeApprove(address(masterPantry.migrator()), bal);
			IBEP20 newToken = masterPantry.migrator().migrate(token);
			require(bal == newToken.balanceOf(address(this)), "migrate: bad");
			pool.tokenData[j].token = newToken;
      masterPantry.setPoolInfo(_pid, pool);
		}
	}

	function emergencyWithdraw(uint256 _pid) public {
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(_pid);
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(_pid, msg.sender);
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
    masterPantry.setUserInfo(_pid, msg.sender, user);
    masterPantry.setPoolInfo(_pid, pool);
		emit EmergencyWithdraw(msg.sender, _pid, amounts);
	}


}
