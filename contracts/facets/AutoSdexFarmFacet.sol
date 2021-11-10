pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserPosition, UserTokenData, UserInfo, Reward } from '../libraries/LibAppStorage.sol';
import './ToolShedFacet.sol';
import './RewardFacet.sol';
import './RewardFacets/ReducedPenaltyFacet.sol';
import 'hardhat/console.sol';

/**
  * @title AutoSdexFarmFacet
  * @dev The Native token vault (pid=0) has a special feature that can automatically reinvest Sdex farmed.  This Facet Is Internal to the Diamond, coordinating the restaking by the {SdexVaultFacet}
*/
contract AutoSdexFarmFacet is Modifiers {
  event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
  event Withdraw(address indexed user, uint256 indexed pid);

  /**
    * Enter Staking is called by by the Vault to reinvest any Sdex it has accrued into the pool
    * @param amount The amount of Sdex to be invested into the Sdex Pool (pid=0)
  */
  function enterStaking(
    uint256 amount
  ) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    ToolShedFacet(address(this)).updatePool(0);
    PoolInfo storage pool = s.poolInfo[0];
    UserInfo storage user = s.userInfo[0][address(this)];
    if (user.tokenData[0].amount > 0) {
      uint256 pending = (user.tokenData[0].amount * pool.tokenData[0].accSdexPerShare - user.tokenData[0].totalRewardDebt) / s.unity;
      if(pending > 0) {
        s.vSdex += pending;
      }
    }
    if (amount > 0) {
      s.vSdex -= amount;
    }
    user.tokenData[0].amount += amount;
    pool.tokenData[0].supply += amount;
    user.tokenData[0].totalRewardDebt = user.tokenData[0].amount*pool.tokenData[0].accSdexPerShare;
    //s.vShares[address(this)] += amount;
    emit Deposit(msg.sender, 0, amount);
  }
  
  /**
    *leave staking coordinates the {SdexVaultFacets} removal of funds from the pool to distribute to users or too recollect prior to restaking
    * @param amount The amount of funds the {SdexVaultFacet} withdraws from the Sdex pool (pid=1)
  */

  function leaveStaking(uint256 amount) public onlyDiamond {
    AppStorage storage s = LibAppStorage.diamondStorage();
    ToolShedFacet(address(this)).updatePool(0);

    UserInfo storage user = s.userInfo[0][address(this)];
    PoolInfo storage pool = s.poolInfo[0];


    require(user.tokenData[0].amount >= amount, "withdraw: not good");
    uint256 pending = (user.tokenData[0].amount * pool.tokenData[0].accSdexPerShare - user.tokenData[0].totalRewardDebt) / s.unity;
    if(pending > 0) {
      s.vSdex += pending;
    }
    if(amount > 0) {
      user.tokenData[0].amount -= amount;
      pool.tokenData[0].supply -= amount;
      s.vSdex += amount;
    }
    user.tokenData[0].totalRewardDebt = user.tokenData[0].amount*pool.tokenData[0].accSdexPerShare;
    //s.vShares[address(this)] -= amount;
    //syrup.burn(msg.sender, amount);
    emit Withdraw(msg.sender, 0);
  }
}
