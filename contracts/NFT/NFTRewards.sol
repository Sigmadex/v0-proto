pragma solidity 0.8.9;
import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';
import 'contracts/pancake/pancake-lib/token/BEP20/SafeBEP20.sol';
import './Rewards/interfaces/ISDEXReward.sol';
import 'contracts/pancake/pancake-farm/MasterChef/interfaces/IACL.sol';
import "contracts/pancake/pancake-lib/access/Ownable.sol";
contract NFTRewards is Ownable {
  using SafeBEP20 for IBEP20;
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
      IBEP20(_token).approve(
        rewards[_token][kindaRandomId],
        type(uint256).max
      );
      console.log('reward token', rewards[_token][kindaRandomId]);
      ISDEXReward(rewards[_token][kindaRandomId]).rewardNFT(_to, _token, _rewardAmount);
  }
}
