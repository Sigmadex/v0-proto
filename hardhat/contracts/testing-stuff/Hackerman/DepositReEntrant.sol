pragma solidity 0.8.10;

import '../../facets/TokenFarmFacet.sol';
import '../MockERC20.sol';
import { AppStorage, LibAppStorage, Modifiers, PoolInfo, PoolTokenData, UserPosition, UserTokenData, UserInfo, Reward } from '../../libraries/LibAppStorage.sol';

import 'hardhat/console.sol';

contract DepositReEntrant {
  address diamond;
  address tokenA;
  address tokenB;
  uint256 poolid;
  uint256[] amounts;
  uint256 blocksToStake;
  TokenFarmFacet tokenFarmFacet;

  constructor(address _diamond, address tokenA, address tokenB) {
    diamond = _diamond;
    tokenFarmFacet = TokenFarmFacet(diamond);
    MockERC20(tokenA).approve(diamond, type(uint256).max);
    MockERC20(tokenB).approve(diamond, type(uint256).max);
  }

  fallback() external payable {
    console.log('fallback triggered (diamonds maybe reentrant proof)');
    UserInfo memory userInfo = TokenFarmFacet(diamond).userInfo(poolid, address(this));
    console.log('ReenterDeposit');
    console.log('token 1 amount', userInfo.tokenData[0].amount);
    tokenFarmFacet.deposit(
      poolid,
      amounts,
      blocksToStake,
      address(0),
      0
    );
  }


  function attack(
    uint256 _pid,
    uint256[] memory _amounts,
    uint256 _blocksToStake
  ) public payable{
    poolid = _pid;
    amounts = _amounts;
    blocksToStake = _blocksToStake;
    console.log('hello');

    tokenFarmFacet.deposit(
      _pid,
      _amounts,
      _blocksToStake,
      address(0),
      0
    );
    (bool success, ) = diamond.call{value: msg.value}("");
    console.log(success);
    
    console.log('hi');
  }


}
