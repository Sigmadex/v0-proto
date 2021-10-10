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
contract MasterChefOld is Ownable {
  using SafeMath for uint256;
  using SafeBEP20 for IBEP20;

  // Info of each user.
  struct UserInfo {
    uint256 amount;     // How many LP tokens the user has provided.
    uint256 rewardDebt; // Reward debt. See explanation below.
    //
    // We do some fancy math here. Basically, any point in time, the amount of CAKEs
    // entitled to a user but is pending to be distributed is:
    //
    //   pending reward = (user.amount * pool.accCakePerShare) - user.rewardDebt
    //
    // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
    //   1. The pool's `accCakePerShare` (and `lastRewardBlock`) gets updated.
    //   2. User receives the pending reward sent to his/her address.
    //   3. User's `amount` gets updated.
    //   4. User's `rewardDebt` gets updated.
  }
  // Info of each user that stakes LP tokens.
  mapping (uint256 => mapping (address => UserInfo)) public userInfo;
  struct UserInfoNew {
    uint256 amountToken0;
    uint256 amountToken1;
    uint256 lastRewardBlock;
    uint256 accCakePerShareAmount0;
    uint256 accCakePerShareAmount1;
    uint256 rewardDebtToken0;
    uint256 rewardDebtToken1;
  }

  mapping (uint256 => mapping (address => UserInfoNew)) public userInfoNew;
  // Info of each pool.
  struct PoolInfo {
    IBEP20 lpToken;           // Address of LP token contract.
    uint256 allocPoint;       // How many allocation points assigned to this pool. CAKEs to distribute per block.
    uint256 lastRewardBlock;  // Last block number that CAKEs distribution occurs.
    uint256 accCakePerShare; // Accumulated CAKEs per share, times 1e27. See below.
  }
  // Info of each pool.
  PoolInfo[] public poolInfo;

  struct PoolInfoNew {
    IBEP20 token0;
    IBEP20 token1;
    uint256 token0Supply;
    uint256 token1Supply;
    uint256 allocPoint;
    uint256 lastRewardBlock;
    uint256 accCakePerShareToken0;
    uint256 accCakePerShareToken1;
  }
  PoolInfoNew[] public poolInfoNew;

  // The CAKE TOKEN!
  CakeToken public cake;
  // The SYRUP TOKEN!
  SyrupBar public syrup;
  // Dev address.
  address public devaddr;
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

  event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
  event DepositNew(address indexed user, uint256 indexed pid, uint256 amountToken0, uint256 amountToken1);
  event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
  event WithdrawNew(address indexed user, uint256 indexed pid);
  event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

  constructor(
    CakeToken _cake,
    SyrupBar _syrup,
    address _devaddr,
    uint256 _cakePerBlock
  ) public {
    cake = _cake;
    syrup = _syrup;
    devaddr = _devaddr;
    cakePerBlock = _cakePerBlock;
    startBlock = block.number;

    poolInfo.push(PoolInfo({
      lpToken: _cake,
      allocPoint: 1000,
      lastRewardBlock: startBlock,
      accCakePerShare: 0
    }));
    totalAllocPoint = 1000;
  }

  function updateMultiplier(uint256 multiplierNumber) public onlyOwner {
    BONUS_MULTIPLIER = multiplierNumber;
  }

  function poolLength() external view returns (uint256) {
    return poolInfo.length;
  }

  // Add a new lp to the pool. Can only be called by the owner.
  // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
  function add(uint256 _allocPoint, IBEP20 _lpToken, bool _withUpdate) public onlyOwner {
    if (_withUpdate) {
      massUpdatePools();
    }
    uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
    totalAllocPoint = totalAllocPoint.add(_allocPoint);
    poolInfo.push(PoolInfo({
      lpToken: _lpToken,
      allocPoint: _allocPoint,
      lastRewardBlock: lastRewardBlock,
      accCakePerShare: 0
    }));
    updateStakingPool();
  }

  function addNew(
    IBEP20 _token0,
    IBEP20 _token1,
    uint256 _allocPoint,
    bool _withUpdate
  ) public onlyOwner {
    if (_withUpdate) {
      massUpdatePoolsNew();
    }
    uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
    totalAllocPoint = totalAllocPoint.add(_allocPoint);
    poolInfoNew.push(
      PoolInfoNew({
      token0: _token0,
      token1: _token1,
      token0Supply: 0,
      token1Supply: 0,
      allocPoint: _allocPoint,
      lastRewardBlock: lastRewardBlock,
      accCakePerShareToken0: 0,
      accCakePerShareToken1: 0
    })
    );
    //updateStakingPoolNew();
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
    uint256 length = poolInfo.length;
    uint256 points = 0;
    // pid = 1 -> pid = 1 (rm cake pool)
    for (uint256 pid = 0; pid < length; ++pid) {
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
    IBEP20 lpToken = pool.lpToken;
    uint256 bal = lpToken.balanceOf(address(this));
    lpToken.safeApprove(address(migrator), bal);
    IBEP20 newLpToken = migrator.migrate(lpToken);
    require(bal == newLpToken.balanceOf(address(this)), "migrate: bad");
    pool.lpToken = newLpToken;
  }

  // Return reward multiplier over the given _from to _to block.
  function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
    return _to.sub(_from).mul(BONUS_MULTIPLIER);
  }

  // View function to see pending CAKEs on frontend.
  function pendingCake(uint256 _pid, address _user) external view returns (uint256) {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][_user];
    uint256 accCakePerShare = pool.accCakePerShare;
    uint256 lpSupply = pool.lpToken.balanceOf(address(this));
    if (block.number > pool.lastRewardBlock && lpSupply != 0) {
      uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
      uint256 cakeReward = multiplier.mul(cakePerBlock).mul(pool.allocPoint).div(totalAllocPoint);
      accCakePerShare = accCakePerShare.add(cakeReward.mul(1e27).div(lpSupply));
    }
    return user.amount.mul(accCakePerShare).div(1e27).sub(user.rewardDebt);
  }

  // Update reward variables for all pools. Be careful of gas spending!
  function massUpdatePools() public {
    uint256 length = poolInfo.length;
    for (uint256 pid = 0; pid < length; ++pid) {
      updatePool(pid);
    }
  }

  function massUpdatePoolsNew() public {
    uint256 length = poolInfo.length;
    for (uint256 pid = 0; pid < length; ++pid) {
      updatePoolNew(pid);
    }
  }

  // Update reward variables of the given pool to be up-to-date.
  function updatePool(uint256 _pid) public {
    PoolInfo storage pool = poolInfo[_pid];
    if (block.number <= pool.lastRewardBlock) {
      return;
    }
    uint256 lpSupply = pool.lpToken.balanceOf(address(this));
    if (lpSupply == 0) {
      pool.lastRewardBlock = block.number;
      return;
    }
    uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
    uint256 cakeReward = multiplier.mul(cakePerBlock).mul(pool.allocPoint).div(totalAllocPoint);
    // Lol - are they really taking 10% of cake mint to personal addr?
    //cake.mint(devaddr, cakeReward.div(10));
    cake.mint(address(this), cakeReward);
    pool.accCakePerShare = pool.accCakePerShare.add(cakeReward.mul(1e27).div(lpSupply));
    pool.lastRewardBlock = block.number;
  }



  function updatePoolNew(uint256 _pid) public {
    PoolInfoNew storage pool = poolInfoNew[_pid];
    if (block.number <= pool.lastRewardBlock) {
      return;
    }
    uint256 token0Supply = pool.token0.balanceOf(address(this));
    uint256 token1Supply = pool.token1.balanceOf(address(this));
    
    if (pool.token0Supply == 0 && pool.token1Supply == 0) {
      pool.lastRewardBlock = block.number;
      return;
    }
    uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
    uint256 cakeReward = multiplier.mul(cakePerBlock).mul(pool.allocPoint).div(totalAllocPoint);
    // Lol - are they really taking 10% of cake mint to personal addr?
    //cake.mint(devaddr, cakeReward.div(10));
    cake.mint(address(this), cakeReward);
    pool.accCakePerShareToken0 = pool.accCakePerShareToken0.add(
      cakeReward.mul(1e27).div(token0Supply)
    );
    pool.accCakePerShareToken1 = pool.accCakePerShareToken1.add(
      cakeReward.mul(1e27).div(token1Supply)
    );
    pool.lastRewardBlock = block.number;
  }

  function depositNew(
    uint256 _pid,
    uint256 _amountToken0,
    uint256 _amountToken1
  ) public {
    require (_amountToken0 > 0 && _amountToken1 > 0, 'If you wish to only stake this token, please use its single pool, otherwise please deposit the other token as well');
    PoolInfoNew storage pool = poolInfoNew[_pid];
    UserInfoNew storage user = userInfoNew[_pid][msg.sender];
    updatePoolNew(_pid);
    //reward debt question
    if (user.amountToken0 > 0) {
      uint256 pending0 = user.amountToken0.mul(pool.accCakePerShareToken0).div(1e27).sub(user.rewardDebtToken0);
      if (pending0 > 0) {
        safeCakeTransfer(msg.sender, pending0);
      }
    }
    if (user.amountToken1 > 0) {
      uint256 pending1 = user.amountToken1.mul(pool.accCakePerShareToken1).div(1e27).sub(user.rewardDebtToken1);
      if (pending1 > 0) {
        safeCakeTransfer(msg.sender, pending1);
      }
    }
    pool.token0.safeTransferFrom(
      address(msg.sender),
      address(this),
      _amountToken0
    );
    pool.token1.safeTransferFrom(
      address(msg.sender),
      address(this),
      _amountToken1
    );
    user.amountToken0 = user.amountToken0.add(_amountToken0);
    user.amountToken1 = user.amountToken1.add(_amountToken1);
    user.rewardDebtToken0 = user.amountToken0.mul(pool.accCakePerShareToken0).div(1e27);
    user.rewardDebtToken1 = user.amountToken1.mul(pool.accCakePerShareToken1).div(1e27);
    emit DepositNew(msg.sender, _pid, _amountToken0, _amountToken1);
  }
  // Deposit LP tokens to MasterChef for CAKE allocation.
  function deposit(uint256 _pid, uint256 _amount) public {
    // rm syrup pool
    //require (_pid != 0, 'deposit CAKE by staking');
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];
    updatePool(_pid);
    if (user.amount > 0) {
      uint256 pending = user.amount.mul(pool.accCakePerShare).div(1e27).sub(user.rewardDebt);
      if(pending > 0) {
        safeCakeTransfer(msg.sender, pending);
      }
    }
    if (_amount > 0) {
      pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
      user.amount = user.amount.add(_amount);
    }
    user.rewardDebt = user.amount.mul(pool.accCakePerShare).div(1e27);
    emit Deposit(msg.sender, _pid, _amount);
  }

  function withdrawNew(
    uint256 _pid
  ) public {
    PoolInfoNew storage pool = poolInfoNew[_pid];
    UserInfoNew storage user = userInfoNew[_pid][msg.sender];
    updatePoolNew(_pid);
    
    uint256 pendingToken0 = user.amountToken0.mul(pool.accCakePerShareToken0).div(1e27).sub(user.rewardDebtToken0);
    uint256 pendingToken1 = user.amountToken1.mul(pool.accCakePerShareToken1).div(1e27).sub(user.rewardDebtToken1);
    if (pendingToken0 > 0) {
      safeCakeTransfer(msg.sender, pendingToken0);
    }
    if (pendingToken1 > 0) {
      safeCakeTransfer(msg.sender, pendingToken1);
    }
    pool.token0.safeTransfer(address(msg.sender), user.amountToken0);
    pool.token1.safeTransfer(address(msg.sender), user.amountToken1);
    user.amountToken0 = 0;
    user.amountToken1 = 0;
    user.rewardDebtToken0 = user.amountToken0.mul(pool.accCakePerShareToken0).div(1e27);
    user.rewardDebtToken1 = user.amountToken1.mul(pool.accCakePerShareToken1).div(1e27);
    emit WithdrawNew(msg.sender, _pid);
  }

  // Withdraw LP tokens from MasterChef.
  function withdraw(uint256 _pid, uint256 _amount) public {
    // rm cake pool
    //require (_pid != 0, 'withdraw CAKE by unstaking');
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];
    require(user.amount >= _amount, "withdraw: not good");

    updatePool(_pid);
    // (user.amount * pool.accCakePerShare / 1e27) - user.rewardDebt
    uint256 pending = user.amount.mul(pool.accCakePerShare).div(1e27).sub(user.rewardDebt);

    if(pending > 0) {
      safeCakeTransfer(msg.sender, pending);
    }
    if(_amount > 0) {
      user.amount = user.amount.sub(_amount);
      pool.lpToken.safeTransfer(address(msg.sender), _amount);
    }
    user.rewardDebt = user.amount.mul(pool.accCakePerShare).div(1e27);
    emit Withdraw(msg.sender, _pid, _amount);
  }

  // Stake CAKE tokens to MasterChef
  
  function enterStaking(uint256 _amount) public {
    PoolInfo storage pool = poolInfo[0];
    UserInfo storage user = userInfo[0][msg.sender];
    updatePool(0);
    if (user.amount > 0) {
      uint256 pending = user.amount.mul(pool.accCakePerShare).div(1e27).sub(user.rewardDebt);
      if(pending > 0) {
        safeCakeTransfer(msg.sender, pending);
      }
    }
    if(_amount > 0) {
      pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
      user.amount = user.amount.add(_amount);
    }
    user.rewardDebt = user.amount.mul(pool.accCakePerShare).div(1e27);

    syrup.mint(msg.sender, _amount);
    emit Deposit(msg.sender, 0, _amount);
  }

  // Withdraw CAKE tokens from STAKING.
  function leaveStaking(uint256 _amount) public {
    PoolInfo storage pool = poolInfo[0];
    UserInfo storage user = userInfo[0][msg.sender];
    require(user.amount >= _amount, "withdraw: not good");
    updatePool(0);
    uint256 pending = user.amount.mul(pool.accCakePerShare).div(1e27).sub(user.rewardDebt);
    if(pending > 0) {
      safeCakeTransfer(msg.sender, pending);
    }
    if(_amount > 0) {
      user.amount = user.amount.sub(_amount);
      pool.lpToken.safeTransfer(address(msg.sender), _amount);
    }
    user.rewardDebt = user.amount.mul(pool.accCakePerShare).div(1e27);

    syrup.burn(msg.sender, _amount);
    emit Withdraw(msg.sender, 0, _amount);
  }
  // Withdraw without caring about rewards. EMERGENCY ONLY.
  function emergencyWithdraw(uint256 _pid) public {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];
    pool.lpToken.safeTransfer(address(msg.sender), user.amount);
    emit EmergencyWithdraw(msg.sender, _pid, user.amount);
    user.amount = 0;
    user.rewardDebt = 0;
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
