pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData } from '../libraries/LibAppStorage.sol';
import './ToolShedFacet.sol';
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

  function poolLength() external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.poolLength;
  }
  function poolInfo(uint256 pid) external view returns (PoolInfo memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.poolInfo[pid];
  }
}
