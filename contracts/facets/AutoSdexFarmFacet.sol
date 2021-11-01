pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserPosition, UserTokenData, UserInfo, Reward } from '../libraries/LibAppStorage.sol';
import './ToolShedFacet.sol';
import './RewardFacet.sol';
import './RewardFacets/ReducedPenaltyFacet.sol';
import 'hardhat/console.sol';
contract AutoSdexFarmFacet is Modifiers {
  event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
  event Withdraw(address indexed user, uint256 indexed pid);

  function enterStaking(
    uint256 amount
  ) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    ToolShedFacet(address(this)).updatePool(0);
    PoolInfo storage pool = s.poolInfo[0];
    UserInfo storage user = s.userInfo[0][address(this)];
    if (user.tokenData[0].amount > 0) {
      uint256 pending = (user.tokenData[0].amount * pool.tokenData[0].accSdexPerShare - user.tokenData[0].rewardDebt) / s.unity;
      console.log('pending', pending);
      if(pending > 0) {
        s.vSdex += pending;
      }
    }
    if (amount > 0) {
      s.vSdex -= amount;
    }
    user.tokenData[0].amount += amount;
    pool.tokenData[0].supply += amount;
    user.tokenData[0].rewardDebt = user.tokenData[0].amount*pool.tokenData[0].accSdexPerShare;
    s.vShares[address(this)] += amount;
    emit Deposit(msg.sender, 0, amount);
  }

  function leaveStaking(uint256 amount) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    ToolShedFacet(address(this)).updatePool(0);

    UserInfo storage user = s.userInfo[0][address(this)];
    PoolInfo storage pool = s.poolInfo[0];


    require(user.tokenData[0].amount >= amount, "withdraw: not good");
    console.log('amount', user.tokenData[0].amount);
    console.log('pending', pool.tokenData[0].accSdexPerShare*user.tokenData[0].amount - user.tokenData[0].rewardDebt);
    console.log('rewardDebt', user.tokenData[0].rewardDebt);
    uint256 pending = (user.tokenData[0].amount * pool.tokenData[0].accSdexPerShare - user.tokenData[0].rewardDebt) / s.unity;
    console.log('leavestaking pending', pending);
    if(pending > 0) {
      s.vSdex += pending;
    }
    if(amount > 0) {
      user.tokenData[0].amount -= amount;
      pool.tokenData[0].supply -= amount;
      s.vSdex += amount;
    }
    user.tokenData[0].rewardDebt = user.tokenData[0].amount*pool.tokenData[0].accSdexPerShare;
    s.vShares[address(this)] -= amount;
    //syrup.burn(msg.sender, amount);
    emit Withdraw(msg.sender, 0);
  }
}
