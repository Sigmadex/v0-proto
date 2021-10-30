pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserPosition, UserTokenData, UserInfo, Reward } from '../libraries/LibAppStorage.sol';
import './ToolShedFacet.sol';
import '../interfaces/ISdexReward.sol';
import './RewardFacet.sol';
import './RewardFacets/ReducedPenaltyFacet.sol';
contract TokenFarmFacet is Modifiers {
  event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
  event Withdraw(address indexed user, uint256 indexed pid);

  function add(
    IERC20[] memory _tokens,
    uint256 _allocPoint,
    bool _withUpdate
  ) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    if (_withUpdate) {
      ToolShedFacet(address(this)).massUpdatePools();
    }
    uint256 lastRewardBlock = block.number > s.startBlock ? block.number : s.startBlock;
    s.totalAllocPoint += _allocPoint;
    s.poolInfo[s.poolLength].allocPoint = _allocPoint;
    s.poolInfo[s.poolLength].lastRewardBlock = lastRewardBlock;
    for (uint j=0; j < _tokens.length; j++) {
      s.poolInfo[s.poolLength].tokenData.push(PoolTokenData({
        token: _tokens[j],
        supply: 0,
        accSdexPerShare: 0
      }));
    }
    s.poolLength++;
    ToolShedFacet(address(this)).updateStakingPool();
  }

  function deposit(
    uint256 pid,
    uint256[] memory amounts,
    uint256 timeStake,
    address nftReward,
    uint256 nftid
  ) public {
    require(pid != 0, "Please use the Self Chef or Cake vault for this token please");
    AppStorage storage s = LibAppStorage.diamondStorage();
    ToolShedFacet(address(this)).updatePool(pid);
    UserPosition memory newPosition  = UserPosition({
      timeStart: block.timestamp,
      timeEnd: block.timestamp + timeStake,
      amounts: amounts,
      startBlock: block.number,
      nftReward: address(0),
      nftid: 0
    });
    if (nftReward != address(0)) {
      // FLAG might now work in diamond //
      require(IERC1155(nftReward).balanceOf(msg.sender, nftid) > 0, "User does not have this nft");
      newPosition.nftReward = nftReward;
      newPosition.nftid = nftid;
    }
    PoolInfo storage pool = s.poolInfo[pid];
    UserInfo storage user = s.userInfo[pid][msg.sender];
    require(pool.tokenData.length == amounts.length, 'please insure the amounts match the amount of cryptos in pool');
    for (uint j=0; j < pool.tokenData.length; j++) {
      if (user.tokenData.length <= j) {
        //first deposit
        user.tokenData.push(UserTokenData({
          amount: 0,
          rewardDebt: 0
        }));
      }
      pool.tokenData[j].token.transferFrom(
        address(msg.sender),
        address(this),
        amounts[j]
      );
      user.tokenData[j].amount += amounts[j];
      user.tokenData[j].rewardDebt = user.tokenData[j].amount*pool.tokenData[j].accSdexPerShare;
      pool.tokenData[j].supply += amounts[j];
      s.tokenRewardData[address(pool.tokenData[j].token)].timeAmountGlobal += amounts[j]*timeStake;

    }
    user.positions.push(newPosition);
    emit Deposit(msg.sender, pid, amounts);
  }

  function withdraw(
    uint256 pid,
    uint256 positionid
  ) public {
    AppStorage storage s = LibAppStorage.diamondStorage();
    
    ToolShedFacet(address(this)).updatePool(pid);
    
    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];

    if (position.nftReward != address(0)) {
     Reward memory reward = s.rewards[position.nftReward];
     bytes memory fnCall = abi.encodeWithSelector(
       reward.withdrawSelector,
       msg.sender,
       pid,
       positionid
     );
     (bool success,) = address(this)
      .delegatecall(fnCall);
      require(success, "withdraw failed");
      
    } else {
      PoolInfo storage pool = s.poolInfo[pid];
      uint256 totalAmountShares = 0;
      //Manage Tokens 
      for (uint j=0; j < user.tokenData.length; j++) {
        IERC20 token = pool.tokenData[j].token;
        uint256 stakeTime = position.timeEnd - position.timeStart;
        totalAmountShares += position.amounts[j]*pool.tokenData[j].accSdexPerShare - user.tokenData[j].rewardDebt;
        if (position.timeEnd < block.timestamp) {
          //past expiry date
          //return tokens
          token.transfer(
            address(msg.sender),
            position.amounts[j]
          );
          //request nft Reward
          RewardFacet(address(this)).requestReward(
            msg.sender, address(token), stakeTime*position.amounts[j]
          );
        } else {
          (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
            position.timeStart, position.timeEnd, position.amounts[j]
          );

          token.transfer(
            msg.sender,
            refund
          );
          s.tokenRewardData[address(token)].timeAmountGlobal -= position.amounts[j] * stakeTime;
          s.tokenRewardData[address(token)].penalties += penalty;
        }
        user.tokenData[j].amount -= position.amounts[j];
        user.tokenData[j].rewardDebt = user.tokenData[j].amount*pool.tokenData[j].accSdexPerShare;
        pool.tokenData[j].supply -= position.amounts[j];
        position.amounts[j] = 0;
      }

      //Manage SDEX
      uint256 pending = totalAmountShares / s.unity;
      if (pending >0) {
        if (position.timeEnd < block.timestamp) {
          //Past Expiry Date
          SdexFacet(address(this)).transfer(msg.sender, pending);
          RewardFacet(address(this)).requestSdexReward(
            msg.sender, position.startBlock, pool.allocPoint, totalAmountShares
          );
        } else {
          //s.tokenRewardData[address(this)].penalties += pending;
        } 
      }
    }
  }

  function poolLength() external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.poolLength;
  }
  function poolInfo(uint256 pid) external view returns (PoolInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.poolInfo[pid];
  }
  function userInfo(uint256 pid, address user) public view returns (UserInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.userInfo[pid][user];
  }

}
