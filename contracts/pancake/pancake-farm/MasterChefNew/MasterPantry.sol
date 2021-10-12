pragma solidity 0.8.7;


import "./interfaces/IMigratorChef.sol";


import "../CakeToken.sol";
import "../SyrupBar.sol";

contract MasterPantry {

	event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
	event Withdraw(address indexed user, uint256 indexed pid);
	event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256[] amounts);

	uint256 public unity = 1e27;

	struct UserTokenData {
		uint256 amount;
		uint256 rewardDebt;
	}
  
	struct UserPosition {
		uint256 timeStart;
		uint256 timeEnd;
		uint256[] amounts;
	}

	struct UserInfo {
		UserTokenData[] tokenData;
		UserPosition[] positions;
		uint256 lastRewardBlock;
	}

	// userInfo[poolId][userAddress]
	mapping (uint256 => mapping (address => UserInfo)) internal userInfo;

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
  // CakeVault handles compounding auto restaking
  address public cakeVault;
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

}
