pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserPosition, UserTokenData, UserInfo, Reward } from '../libraries/LibAppStorage.sol';
import './ToolShedFacet.sol';
import './RewardFacet.sol';

/**
  * @title TokenFarmFacet
  * @dev Token Farm concerns creating and removing of positions from various created pools, as well as the associated getters for {UserInfo} and {PoolInfo}
*/
contract TokenFarmFacet is Modifiers {
  event Deposit(address indexed user, uint256 indexed pid, uint256[] amounts);
  event Withdraw(address indexed user, uint256 indexed pid);

  /**
    *Adds a new liquidity pool to the protocol
    * @param tokens tokens to be added to the pool, can be one or many (only currently tested for max 2)
    * @param allocPoint allocation points for pool.  This determines what proportion of SDEX is given to this pool every block. allocPoint / TotalAllocPoint = proportion of sdexPerBlock
    * @param withUpdate runs the massUpdatePool option on execution to update all pool states
    * @param validNFTs list of addresses of nft rewards that are valid for this pool
  */
  function add(
    IERC20[] memory tokens,
    uint256 allocPoint,
    address[] memory validNFTs,
    bool withUpdate
  ) public onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    if (withUpdate) {
      ToolShedFacet(address(this)).massUpdatePools();
    }
    uint256 lastRewardBlock = block.number > s.startBlock ? block.number : s.startBlock;
    s.totalAllocPoint += allocPoint;
    s.poolInfo[s.poolLength].allocPoint = allocPoint;
    s.poolInfo[s.poolLength].lastRewardBlock = lastRewardBlock;
    for (uint j=0; j < tokens.length; j++) {
      s.poolInfo[s.poolLength].tokenData.push(PoolTokenData({
        token: tokens[j],
        supply: 0,
        accSdexPerShare: 0
      }));
    }
    for (uint j=0; j <validNFTs.length; j++) {
      s.validNFTsForPool[s.poolLength][validNFTs[j]] = true;
    }
    s.poolLength++;
    ToolShedFacet(address(this)).updateStakingPool();
  }

  function changeValidNFTsForPool(uint256 poolid, address[] memory nfts, bool[] memory newStates) public onlyOwner {
    require((nfts.length == newStates.length), 'please match nfts to newstates 1:1');
    AppStorage storage s = LibAppStorage.diamondStorage();
    for (uint j=0; j < nfts.length; j++) {
      s.validNFTsForPool[poolid][nfts[j]] = newStates[j];
    }
  }

  function isValidNFTForPool(uint256 poolid, address nft) public returns (bool) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.validNFTsForPool[poolid][nft];
  }
  /**
    * Used to deposit a users tokens in a pool for a specific time. Opens up a position in the pool for the amounts given for the time staked.  Users with NFT rewards attach here.
    * @param pid Pool Id
    * @param amounts Array of amounts of each token, consult pool at pid for order and number
    * @param blocksAhead the number of blocks in the future one wants to commit
    * @param nftReward address of nft reward token, address(0) for no NFT
    * @param nftid The id of the nft at the nft address, 0 for noNFT
  */
  function deposit(
    uint256 pid,
    uint256[] memory amounts,
    uint256 blocksAhead,
    address nftReward,
    uint256 nftid
  ) public {
    //require(pid != 0, "Please use the SdexVault or ManualSdexFarm Facets for this token please");
    AppStorage storage s = LibAppStorage.diamondStorage();
    ToolShedFacet(address(this)).updatePool(pid);

    UserPosition memory newPosition  = UserPosition({
      amounts: amounts,
      rewardDebts: new uint256[](2),
      startBlock: block.number,
      endBlock: block.number + blocksAhead,
      nftReward: address(0),
      nftid: 0
    });
    if (nftReward != address(0)) {
      // FLAG might now work in diamond //
      require(s.validNFTsForPool[pid][nftReward], 'chosen NFT is not part of the list of valid ones for this pool');
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
          totalRewardDebt: 0
        }));
      }

      pool.tokenData[j].token.transferFrom(
        address(msg.sender),
        address(this),
        amounts[j]
      );
      user.tokenData[j].amount += amounts[j];
      pool.tokenData[j].supply += amounts[j];
      s.tokenRewardData[address(pool.tokenData[j].token)].blockAmountGlobal += amounts[j]*blocksAhead;
      newPosition.rewardDebts[j] = newPosition.amounts[j]*pool.tokenData[j].accSdexPerShare; 
      user.tokenData[j].totalRewardDebt = user.tokenData[j].amount*pool.tokenData[j].accSdexPerShare;
    }
    user.positions.push(newPosition);
    if (pid == 0) {
      //s.vShares[msg.sender] += newPosition.amounts[0];
    }
    emit Deposit(msg.sender, pid, amounts);
  }
  /**
    * Withdraws a users tokens from a pool by position. Currently a no partial liquiditations are permitted, a withdraw before the stake time is subject to a penalty.  If only 50% of time has passed, only 50% of funds are returned, and all these tokens, and accrued SDEX is sent to the penalty pool as a gift for future stakers who complete their stakeTime.  Withdrawing after the stake time returns all tokens, accrued Sdex and an NFT gift from the penalty pool 
    * @param pid pool id 
    * @param positionid id of position to withdraw
  */
  function withdraw(
    uint256 pid,
    uint256 positionid
  ) public {
    AppStorage storage s = LibAppStorage.diamondStorage();

    ToolShedFacet(address(this)).updatePool(pid);

    UserInfo storage user = s.userInfo[pid][msg.sender];
    UserPosition storage position = user.positions[positionid];

    if (position.nftReward != address(0)) {
      console.log('TokenFarmFacet::inside');
      Reward memory reward = s.rewards[position.nftReward];
      bytes memory fnCall = abi.encodeWithSelector(
        reward.withdrawSelector,
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
        //uint256 stakeTime = position.timeEnd - position.timeStart;
        uint256 blocksAhead = position.endBlock - position.startBlock;
        totalAmountShares += (position.amounts[j]*pool.tokenData[j].accSdexPerShare - position.rewardDebts[j]);
        if (position.endBlock <= block.number) {
          //past expiry date
          //return tokens
          token.transfer(
            address(msg.sender),
            position.amounts[j]
          );
          //request nft Reward
          RewardFacet(address(this)).requestReward(
            msg.sender, address(token), blocksAhead*position.amounts[j]
          );
        } else {
          (uint256 refund, uint256 penalty) = ToolShedFacet(address(this)).calcRefund(
            position.startBlock, position.endBlock, position.amounts[j]
          );
          token.transfer(
            msg.sender,
            refund
          );
          s.tokenRewardData[address(token)].blockAmountGlobal -= position.amounts[j] * blocksAhead;
          s.tokenRewardData[address(token)].penalties += penalty;
        }
        user.tokenData[j].amount -= position.amounts[j];
        user.tokenData[j].totalRewardDebt = user.tokenData[j].amount*pool.tokenData[j].accSdexPerShare;
        pool.tokenData[j].supply -= position.amounts[j];
        position.amounts[j] = 0;
        position.rewardDebts[j] = 0;
      }

      //Manage SDEX
      uint256 pending = totalAmountShares / s.unity;
      if (pending >0) {
        if (position.endBlock <= block.number) {
          //Past Expiry Date
          SdexFacet(address(this)).transfer(msg.sender, pending);
          RewardFacet(address(this)).requestSdexReward(
            msg.sender, position.startBlock, position.endBlock, pool.allocPoint, pending
          );
        } else {
          s.accSdexPenaltyPool += pending;
        }
      }
    }
  }
  /**
    * Getter function for the amount of pools in the protocol
    * @return poolLength the amount of pools
  */
  function poolLength() external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.poolLength;
  }
  /**
    * Getter function for the information of a pools
    * @param pid id for pool
    * @return PoolInfo Information of the pools current state 
  */
  function poolInfo(uint256 pid) external view returns (PoolInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.poolInfo[pid];
  }
  /**
    * Returns the Information of a user based on a specific pool, positions are found here.
    * @param pid the id of a pool
    * @param user address of the user
    * @return UserInfo Information of the user
  */
  function userInfo(uint256 pid, address user) public view returns (UserInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.userInfo[pid][user];
  }

}
