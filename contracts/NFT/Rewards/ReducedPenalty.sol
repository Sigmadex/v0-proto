pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol';
import './interfaces/ISDEXReward.sol';

contract ReducedPenaltyNFT is ERC1155PresetMinterPauser, ISDEXReward {

  struct ReductionAmount {
    address token;
    uint256 amount;
  }
  mapping(uint256 => ReductionAmount) public reductionAmounts;
  // zero id is reserved;
  uint256 nextId = 1;

  constructor(
  ) ERC1155PresetMinterPauser("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
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
    mint(_to, nextId, 1, data);
    nextId++;
  }

  function _beforeDeposit(
    address sender,
    uint256 _pid,
    uint256[] memory _amounts,
    uint256 _timeStake,
    uint256 _nftid
  ) external {
  }
  function _afterDeposit(
    address sender,
    uint256 _pid,
    uint256[] memory _amounts,
    uint256 _timeStake,
    uint256 _nftid
  ) external {
  }
  /*
     function _beforeUpdate() external {
     }
     function _afterUpdate() external {
     }
   */
  function _beforeWithdraw(address sender, uint256 _pid, uint256 _positionid, uint256 _nftid) external {}
  function _afterWithdraw(address sender, uint256 _pid, uint256 _positionid, uint256 _nftid) external {}


  function getBalanceOf(address _account, uint256 _nftid) external view returns (uint256) {
    return balanceOf(_account, _nftid);
  }
}
