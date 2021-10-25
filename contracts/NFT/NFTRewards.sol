pragma solidity 0.8.9;

import './Rewards/interfaces/ISDEXReward.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IACL.sol';
import "contracts/pancake/pancake-lib/access/Ownable.sol";
contract NFTRewards is Ownable {
  IACL acl;
  //rewards[tokenaddress] = nftRewardAddresses;
  mapping (address => address[]) rewards;
  uint256 _seed = 11111460156937785151929026842503960837766832936;
  constructor(
    address _acl
  ) {
    acl = IACL(_acl);
  }

  modifier onlyACL() {
    acl.onlyACL(msg.sender);
    _;
  }

  function addNFTReward(address tokenAddr, address nftRewardAddr) public onlyOwner {
    for (uint i=0; i < rewards[tokenAddr].length; i++) {
      if (rewards[tokenAddr][i] == nftRewardAddr) {
        revert("nft already in list");
      }
    }
    rewards[tokenAddr].push(nftRewardAddr);
  }

  function mintReward(
    address _to,
    address _token,
    uint256 _rewardAmount
  ) public  onlyACL {
      uint256 kindaRandomId = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), _to, _seed))) % rewards[_token].length;
      ISDEXReward(rewards[_token][kindaRandomId]).rewardNFT(_to, _token, _rewardAmount);
  }
}
