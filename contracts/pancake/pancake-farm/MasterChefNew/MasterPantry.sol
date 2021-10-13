pragma solidity 0.8.7;


import "./interfaces/IMigratorChef.sol";
import "./interfaces/IMasterPantry.sol";
import "../CakeToken.sol";
import "../SyrupBar.sol";

import 'contracts/pancake/pancake-lib/access/Ownable.sol';

contract MasterPantry is Ownable {

	uint256 public unity = 1e27;

	// userInfo[poolId][userAddress]
	mapping (uint256 => mapping (address => IMasterPantry.UserInfo)) public userInfo;
  
  function setUserInfo(
    uint256 _poolId,
    address _user,
    IMasterPantry.UserInfo calldata _userInfo   
  ) public onlyOwner {
    userInfo[_poolId][_user] = _userInfo;
  }
	function getUserInfo(uint256 _pid, address addr) public view returns (IMasterPantry.UserInfo memory user) {
		IMasterPantry.UserInfo memory user = userInfo[_pid][addr];
		return user;
	}

	uint256 public poolLength = 0;
	mapping(uint256 => IMasterPantry.PoolInfo) public poolInfo;
  function setPoolLength(uint256 _poolLength) public onlyOwner {
    poolLength = _poolLength;
  }
  function addPool(IMasterPantry.PoolInfo calldata _poolInfo) public onlyOwner {
    poolInfo[poolLength] = _poolInfo;
    poolLength++;
  }
	function getPoolInfo(uint256 _pid) public returns (IMasterPantry.PoolInfo memory) {
		IMasterPantry.PoolInfo memory pool =  poolInfo[_pid];
    console.log(pool.tokenData[0].supply);
		return pool;
	}
  function setPoolInfo(
    uint256 _pid,
    IMasterPantry.PoolInfo calldata _poolInfo
  ) public onlyOwner {
    poolInfo[_pid] = _poolInfo;
  }


	// The CAKE TOKEN!
	CakeToken public cake;
	// The SYRUP TOKEN!
	SyrupBar public syrup;
	// Dev address.
	address public devAddress;
	function setDevAddress(address _devAddress) public {
		require(msg.sender == devAddress, "dev: wut?");
		devAddress = _devAddress;
	}
	// Penalty pool Address
	address public penaltyAddress;
  // CakeVault handles compounding auto restaking
  address public cakeVault;
	// CAKE tokens created per block.
	uint256 public cakePerBlock;
	// Bonus muliplier for early cake makers.
	uint256 public BONUS_MULTIPLIER = 1;
	// The migrator contract. It has a lot of power. Can only be set through governance (owner).
	IMigratorChef public migrator;
	// Set the migrator contract. Can only be called by the owner.
	function setMigrator(IMigratorChef _migrator) public onlyOwner {
		migrator = _migrator;
	}
	// Total allocation points. Must be the sum of all allocation points in all pools.
	uint256 public totalAllocPoint = 0;
  function setTotalAllocPoint(uint256 _totalAllocPoint) public onlyOwner {
    totalAllocPoint = _totalAllocPoint;
  }
	// The block number when CAKE mining starts.
	uint256 public startBlock;




  constructor(
    CakeToken _cake,
    SyrupBar _syrup,
    address _penaltyAddress,
    address _devAddress,
    uint256 _cakePerBlock
  ) {
    cake = _cake;
    syrup = _syrup;
    penaltyAddress = _penaltyAddress;
    devAddress = _devAddress;
    cakePerBlock = _cakePerBlock;
    
    startBlock = block.number;
    
		IMasterPantry.PoolTokenData memory poolTokenData = IMasterPantry.PoolTokenData({
			token: _cake,
			supply: 0,
			accCakePerShare: 0
		});
		IMasterPantry.PoolInfo storage cakePool = poolInfo[poolLength];
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
}
