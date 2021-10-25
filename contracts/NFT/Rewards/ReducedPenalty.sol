pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import './interfaces/ISDEXReward.sol';

import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IMasterPantry.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/ICashier.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/ICookBook.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IKitchen.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IACL.sol';

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
  constructor(
    address _masterPantry,
    address _cashier,
    address _cookBook,
    address _kitchen,
    address _acl
  ) ERC1155("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
    masterPantry = IMasterPantry(_masterPantry);
    cashier = ICashier(_cashier);
    cookBook = ICookBook(_cookBook);
    kitchen = IKitchen(_kitchen);
    acl = IACL(_acl);

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

  function _deposit(address sender, uint256 _pid, uint256[] memory _amounts, uint256 _timeStake, uint256 _nftid) external {}

  function _withdraw(address sender, uint256 _pid, uint256 _positionid) external onlyACL {
    // In this architecture, the penalities have been offered, one must calculate the additional refund
    // and send it for each token
    IMasterPantry.UserInfo memory user = masterPantry.getUserInfo(_pid, sender);
    IMasterPantry.UserPosition memory currentPosition = user.positions[_positionid];
    IMasterPantry.PoolInfo memory pool = masterPantry.getPoolInfo(_pid);
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
            penalty -= bonus;
            refund += bonus;
            reductionAmounts[nftid].amount = 0;
          } else {
            uint256 residual = bonus - penalty; 
            refund += bonus;
            penalty = 0;
            reductionAmounts[nftid].amount -= residual;
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
    emit Withdraw(msg.sender, _pid);
  }

  function getBalanceOf(address _account, uint256 _nftid) external view returns (uint256) {
    return balanceOf(_account, _nftid);
  }
}
