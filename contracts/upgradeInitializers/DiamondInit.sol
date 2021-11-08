// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
 * Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
 * EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
 *
 * Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "../libraries/LibDiamond.sol";
import { AppStorage, PoolInfo, PoolTokenData, Reward, UserTokenData } from '../libraries/LibAppStorage.sol';
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { IERC173 } from "../interfaces/IERC173.sol";
import { IERC165 } from "../interfaces/IERC165.sol";

import '../facets/SdexFacet.sol';

// It is exapected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init funciton if you need to.

/** @title DiamondInit
* @dev Holds the initialization function for SDEX's internal state, which is defined in {AppStorage}
*/
contract DiamondInit {
  AppStorage internal s;
  // You can add parameters to this function in order to pass in 
  // data to set your own state variables

  /**
  * called during deployment to intialize SDEX variables for the {SdexFacet} native governance token, the {TokenFarmFacet} yield farm, the {SdexVaultFacet}
 * @param reducedPenaltyReward address, will be array of GEN0 NFT soon 
 * @param _withdrawSelector function signature of the reduced penalty withdraw function.  will be array of GEN0 NFT withdraw function selectors soon
 * @param _vaultWithdrawSelector fn selectors for vault withdraw
 * @param _rewardSelector fn selectors for reward function
  */
  function init(
    address reducedPenaltyReward,
    bytes4 _withdrawSelector,
    bytes4 _vaultWithdrawSelector,
    bytes4 _rewardSelector
  ) external {
    // adding ERC165 data
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    ds.supportedInterfaces[type(IERC165).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
    ds.supportedInterfaces[type(IERC173).interfaceId] = true;

    // add your own state variables 
    // EIP-2535 specifies that the `diamondCut` function takes two optional 
    // arguments: address _init and bytes calldata _calldata
    // These arguments are used to execute an arbitrary function using delegatecall
    // in order to set state variables in the diamond during deployment or an upgrade
    // More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface

    // Farm
    s.unity = 1e27;
    s.sdexPerBlock = 1 ether;
    s.BONUS_MULTIPLIER = 1;
    s.startBlock = 0;
    //s.sdexRewarded = 0;
    s.poolInfo[0].allocPoint = 1000;
    s.poolInfo[0].lastRewardBlock = block.number;
    s.poolInfo[0].tokenData.push(
      PoolTokenData({
        token: SdexFacet(address(this)),
        supply:0,
        accSdexPerShare: 0
      })
    );
    s.userInfo[0][address(this)].tokenData.push(
      UserTokenData({
        amount:0,
        rewardDebt:0
      }) 
    );
    s.poolLength = 1;
    s.totalAllocPoint = 1000;
    // SDEX
    s.sdexTotalSupply = 0;
    s.sdexName = 'Sigmadex';
    s.sdexSymbol = 'SDEX';
    s.sdexDecimals = 18;

    // Vault Shares
    s.vSharesName = 'Vaultshares';
    s.vSharesSymbol = 'VSHR';
    s.vSharesDecimals = 18;

    // SDEX Vault
    s.vTotalShares = 0;
    s.vLastHarvestedTime = 0;
    s.vMAX_PERFORMANCE_FEE = 500;
    s.vMAX_CALL_FEE = 100;
    s.vPerformanceFee = 200;
    s.vCallFee = 25;

    // Rewards 
    s.seed = 11111460156937785151929026842503960837766832936;

    //Reduced Penalty Rewards
    s.reducedPenaltyReward = reducedPenaltyReward;
    s.rewards[reducedPenaltyReward] = Reward({
      withdrawSelector: _withdrawSelector,
      vaultWithdrawSelector: _vaultWithdrawSelector,
      rewardSelector: _rewardSelector
    });
    s.rPNextId = 1;


  }
}
