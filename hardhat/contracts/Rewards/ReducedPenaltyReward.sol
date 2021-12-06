pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol';


/**
* @title ReducedPenaltyReward NFT
* @dev the Reduced Penalty Reward NFT provides the user a reduced penalty in the event of a premature withdraw on the position in question.  It comes with a reductionAmount for a specific token (such as USDT), and when applied to a pool containing that token, will provide an increased refund, up to that reduction amount.  Is only consumed in the event of a premature withdraw, so it can make a good insurance policy on that token
*/
contract ReducedPenaltyReward is ERC1155PresetMinterPauser {
  event IncrementActive(uint256 indexed id, uint256 currentAmountActive);
  mapping (uint256 => uint256) public actives;
  address diamond;
  constructor(
    address _diamond
  ) ERC1155PresetMinterPauser("https://nft.sigmadex.org/api/rewards/reduced-penalty/{id}.json") {
   diamond = _diamond; 
  }

  modifier onlyDiamond() {
    require(msg.sender == diamond, "diamond only");
    _;
  }
  /**
  * Mint is exposed to onlyDiamond to provide the creation of rewards
  * @param to address of the user receiving the reward
  * @param id the id of the rewaerd being minted
  * @param amount the amount of nft's being minted (usually 1)
  * @param data metadata of the NFT, 
  */
  function mint(address to, uint256 id, uint256 amount, bytes calldata data) public override onlyDiamond {
    _mint(to, id, amount, data);
  }
  
  function incrementActive(uint256 id, bool isPositive) public onlyDiamond {
    if (isPositive) {
      actives[id]++;
    } else {
      actives[id]--;
      }
    emit IncrementActive(id, actives[id]);
  }
}
