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
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// It is exapected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init funciton if you need to.

/** @title DiamondInit
* @dev Holds the initialization function for SDEX's internal state, which is defined in {AppStorage}
*/
contract DiamondInit {

  AppStorage internal s;
  using EnumerableSet for EnumerableSet.AddressSet;
  
  event Add(uint256 indexed pid, address[] tokens, address[] validNFTs, uint256 allocPoint);
  // You can add parameters to this function in order to pass in 
  // data to set your own state variables

  /**
     * called during deployment to intialize SDEX variables for the {SdexFacet} native governance token, the {TokenFarmFacet} yield farm, the {SdexVaultFacet}
     * @param nftAddresses address[], array of GEN0 NFTs
     * @param _withdrawSelectors bytes4[]  array of GEN0 NFT withdraw function selectors
     * @param _vaultWithdrawSelectors bytes4[] fn selectors for vault withdraw
     * @param _rewardSelectors bytes4[] fn selectors for reward function
  */
  function init(
    address[] calldata nftAddresses,
    bytes4[] calldata _withdrawSelectors,
    bytes4[] calldata _vaultWithdrawSelectors,
    bytes4[] calldata _rewardSelectors
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
    for (uint j=0; j < nftAddresses.length; j++) {
      s.setValidNFTsForPool[0].add(nftAddresses[j]);

    }
    
    address[] memory tokens = new address[](1);
    tokens[0] = address(this);
    emit Add(0, tokens, nftAddresses, s.poolInfo[0].allocPoint);
    
    s.userInfo[0][address(this)].tokenData.push(
      UserTokenData({
        amount:0,
        totalRewardDebt:0
      }) 
    );
    s.poolLength = 1;
    s.totalAllocPoint = s.poolInfo[0].allocPoint;
    // SDEX
    s.sdexTotalSupply = 0;
    s.sdexName = 'Sigmadex';
    s.sdexSymbol = 'SDEX';
    s.sdexDecimals = 18;

    // Vault Shares
    //s.vSharesName = 'Vaultshares';
    ///s.vSharesSymbol = 'VSHR';
    //s.vSharesDecimals = 18;

    // SDEX Vault
    s.vTotalShares = 0;
    s.vLastHarvestedTime = 0;
    s.vMAX_PERFORMANCE_FEE = 500;
    s.vMAX_CALL_FEE = 100;
    s.vPerformanceFee = 200;
    s.vCallFee = 25;

    // Rewards 
    s.seed = 1;
    s.seedNext = 1;
    s.seedMax = 426547842461739379460149980002442288124894678853713953114433;


    //Reduced Penalty Rewards
    s.reducedPenaltyReward = nftAddresses[0];
    s.rewards[nftAddresses[0]] = Reward({
      withdrawSelector: _withdrawSelectors[0],
      vaultWithdrawSelector: _vaultWithdrawSelectors[0],
      rewardSelector: _rewardSelectors[0]
    });
    s.rPRNextId = 1;

    s.increasedBlockReward  = nftAddresses[1];
    s.rewards[nftAddresses[1]]= Reward({
      withdrawSelector: _withdrawSelectors[1],
      vaultWithdrawSelector: _vaultWithdrawSelectors[1],
      rewardSelector: _rewardSelectors[1]
    });
    s.iBRNextId = 1;

    s.rewardAmplifierReward  = nftAddresses[2];
    s.rewards[nftAddresses[2]]= Reward({
      withdrawSelector: _withdrawSelectors[2],
      vaultWithdrawSelector: _vaultWithdrawSelectors[2],
      rewardSelector: _rewardSelectors[2]
    });
    s.rARNextId = 1;

  }
}
