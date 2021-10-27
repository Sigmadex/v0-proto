pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import './interfaces/ISDEXReward.sol';
import '../INFTRewards.sol';

import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IMasterPantry.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/ICashier.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/ICookBook.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IKitchen.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IACL.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IAutoCakeChef.sol';

import 'contracts/pancake/pancake-farm/ICakeVault.sol';

import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';

import 'hardhat/console.sol';

contract ReducedPenaltyNFT is ERC1155, ISDEXReward {
  using SafeBEP20 for IBEP20;

  event Withdraw(address indexed user, uint256 indexed pid);

  struct ReductionAmount {
    address token;
    uint256 amount;
  }
  mapping(uint256 => ReductionAmount) public reductionAmounts;
  // zero id is reserved;
  uint256 nextId = 1;

  IMasterPantry masterPantry;
  ICashier cashier;
  ICookBook cookBook;
  IKitchen kitchen;
  IACL acl;
  INFTRewards nftRewards;
  ICakeVault cakeVault;
  IAutoCakeChef autoCakeChef;
  IBEP20 cake;
  constructor(
    address _masterPantry,
    address _cashier,
    address _cookBook,
    address _kitchen,
    address _acl,
    address _nftRewards,
    address _cakeVault,
    address _autoCakeChef,
    address _cake
  ) ERC1155("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
    masterPantry = IMasterPantry(_masterPantry);
    cashier = ICashier(_cashier);
    cookBook = ICookBook(_cookBook);
    kitchen = IKitchen(_kitchen);
    acl = IACL(_acl);
    nftRewards = INFTRewards(_nftRewards);
    cakeVault = ICakeVault(_cakeVault);
    autoCakeChef = IAutoCakeChef(_autoCakeChef);
    cake = IBEP20(_cake);
  }

  modifier onlyACL() {
    acl.onlyACL(msg.sender);
    _;
  }
  function rewardNFT(
    address _to,
    address _token,
    uint256 _amount
  ) external {
    ReductionAmount memory reductionAmount = ReductionAmount({
      token: _token,
      amount: _amount
    });
    reductionAmounts[nextId] = reductionAmount;
    bytes memory data = 'data';
    _mint(_to, nextId, 1, data);
    nextId++;
  }


  function _withdraw(
    address sender,
    uint256 _pid,
    IMasterPantry.PoolInfo memory pool,
    IMasterPantry.UserInfo memory user,
    uint256 _positionid
  ) external onlyACL {
    // In this architecture, the penalities have been offered, one must calculate the additional refund
    // and send it for each token
    IMasterPantry.UserPosition memory currentPosition = user.positions[_positionid];
    uint256 nftid = currentPosition.nftid;
    uint256 totalAmountShares = 0;
    for (uint j=0; j < user.tokenData.length; j++) {
      uint256 amount = currentPosition.amounts[j];
      uint256 accCakePerShare = pool.tokenData[j].accCakePerShare;
      // pool level, verses position level pending question
      totalAmountShares += amount * accCakePerShare;
      if (currentPosition.timeEnd < block.timestamp) {
        pool.tokenData[j].token.safeTransfer(
          address(sender),
          amount
        );
        uint256 stakeTime = user.positions[_positionid].timeEnd - user.positions[_positionid].timeStart;
        cashier.requestReward(sender, address(pool.tokenData[j].token), stakeTime * amount);
      } else {
        (uint256 refund, uint256 penalty) = cookBook.calcRefund(
          user.positions[_positionid].timeStart,
          user.positions[_positionid].timeEnd,
          amount
        );

        if (address(pool.tokenData[j].token) == reductionAmounts[nftid].token) {
          uint256 bonus = reductionAmounts[nftid].amount;
          if (bonus <= penalty) {
            pool.tokenData[j].token.safeTransferFrom(
              address(nftRewards),
              sender,
              bonus
            );
            penalty -=  bonus;
            reductionAmounts[nftid].amount = 0;
          } else {
            
            pool.tokenData[j].token.safeTransferFrom(
              address(nftRewards),
              sender,
              penalty
            );
            reductionAmounts[nftid].amount -= penalty;
            penalty = 0;
          }
        }
        pool.tokenData[j].token.safeTransferFrom(
          msg.sender,
          address(sender),
          refund
        );
        pool.tokenData[j].token.safeTransferFrom(
          msg.sender,
          address(cashier),
          penalty
        );
      }
      user.tokenData[j].amount -= currentPosition.amounts[j];
      pool.tokenData[j].supply = pool.tokenData[j].supply - amount;

      masterPantry.subTimeAmountGlobal(
        address(pool.tokenData[j].token),
        (currentPosition.amounts[j]*(currentPosition.timeEnd - currentPosition.timeStart))
      );
      user.positions[_positionid].amounts[j] = 0;
    }

    uint256 pending = totalAmountShares / masterPantry.unity();
    if (pending > 0) {
      if (currentPosition.timeEnd < block.timestamp) {
        kitchen.safeCakeTransfer(address(sender), pending);
        cashier.requestCakeReward(
          sender,
          currentPosition.startBlock,
          pool.allocPoint,
          totalAmountShares
        );
      } else {
        kitchen.safeCakeTransfer(address(cashier), pending);
      }
    }
    masterPantry.setUserInfo(_pid, sender, user);
    masterPantry.setPoolInfo(_pid, pool);
  }

  function getBalanceOf(address _account, uint256 _nftid) external view returns (uint256) {
    return balanceOf(_account, _nftid);
  }

  function _withdrawCakeVault(address userAddr, ICakeVault.UserInfo memory user, uint256 _positionid) external onlyACL {
    uint256 totalShares = cakeVault.totalShares();
    uint256 shares = user.positions[_positionid].amount;
    ICakeVault.UserPosition memory currentPosition = user.positions[_positionid];
    require(shares > 0, "Nothing to withdraw");
    require(shares <= user.shares, "Withdraw amount exceeds balance");
    uint256 currentAmount = (cakeVault.balanceOf() * shares) / totalShares;
    user.shares -= shares;
    totalShares -= shares;

    uint256 bal = cakeVault.available();
    if (bal < currentAmount) {
      uint256 balWithdraw = currentAmount - (bal);
      autoCakeChef.leaveStakingCakeVault(balWithdraw);
      uint256 balAfter = cakeVault.available();
      //theoretical
      uint256 diff = balAfter - (bal);
      if (diff < balWithdraw) {
        currentAmount = bal + (diff);
      }
    }
    if (block.timestamp < user.lastDepositedTime + (cakeVault.withdrawFeePeriod())) {
      uint256 currentWithdrawFee = currentAmount * (cakeVault.withdrawFee()) / (10000);
      cake.transferFrom(address(cakeVault), cakeVault.treasury(), currentWithdrawFee);
      currentAmount = currentAmount - (currentWithdrawFee);
    }
    if (user.shares > 0) {
      user.cakeAtLastUserAction = user.shares * (cakeVault.balanceOf()) / (totalShares);
    } else {
      user.cakeAtLastUserAction = 0;
    }

    user.lastUserActionTime = block.timestamp;
    uint256 timeAmount = (currentPosition.amount*(currentPosition.timeEnd - currentPosition.timeStart));
    if ( block.timestamp >= user.positions[_positionid].timeEnd) {
      cashier.requestReward(
        userAddr,
        address(cake),
        timeAmount
      );
      cake.transferFrom(address(cakeVault), userAddr, currentAmount);
    } else {
        uint256 bonus = reductionAmounts[currentPosition.nftid].amount;
        (uint256 refund, uint256 penalty) = cookBook.calcRefund(
          currentPosition.timeStart,
          currentPosition.timeEnd,
          currentAmount
        );
        if (bonus <= penalty) {
          cake.safeTransferFrom(
            address(nftRewards),
            userAddr,
            bonus
          );
          penalty -=  bonus;
          reductionAmounts[currentPosition.nftid].amount = 0;
        } else {
          
          cake.safeTransferFrom(
            address(nftRewards),
            userAddr,
            penalty
          );
          reductionAmounts[currentPosition.nftid].amount -= penalty;
          penalty = 0;
        }
        cake.transferFrom(
          address(cakeVault),
          address(msg.sender),
          refund
        );
        cake.transferFrom(
          address(cakeVault),
          address(cashier),
          penalty
        );
    }
    masterPantry.subTimeAmountGlobal(
      address(cake),
      timeAmount
    );
    currentPosition.amount = 0;
    user.positions[_positionid] = currentPosition;
    cakeVault.setUserInfo(userAddr, user);
    cakeVault.setTotalShares(totalShares);
    emit Withdraw(userAddr, _positionid);
  }
}
