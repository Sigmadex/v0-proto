
import { Address, BigInt, BigDecimal, store, Bytes, ByteArray } from "@graphprotocol/graph-ts"
import { UserPosition, PositionOwnership, Farm, FarmingData } from '../generated/schema'

import {TokenFarmFacet, Deposit, Withdraw, Add} from '../generated/TokenFarmFacet/TokenFarmFacet'


export function handleAddFarm(event: Add): void {
  let farmid = event.params.pid.toString()
  let farm = new Farm(farmid)
  farm.pid = event.params.pid
  farm.tokens = event.params.tokens.map<Bytes>((token) => token as Bytes)
  farm.validNFTs = event.params.validNFTs.map<Bytes>((nft) => nft as Bytes)
  farm.allocPoint = event.params.allocPoint
  farm.activePositions = BigInt.fromI32(0)

  farm.save()

}

export function handleTokenFarmDeposit(event: Deposit): void {
  let farmingData  = FarmingData.load('0')
  if (farmingData == null) {
    farmingData = new FarmingData('0')
    farmingData.totalActivePositions = BigInt.fromI32(1)
  } else {
    farmingData.totalActivePositions = farmingData.totalActivePositions + BigInt.fromI32(1)
  }
  farmingData.save()

  let farm = Farm.load(event.params.pid.toString())
  if (farm !== null) {
    farm.activePositions = farm.activePositions + BigInt.fromI32(1)
    farm.save()
  }

  let positionid = event.params.user.toHexString() + '/' + event.params.pid.toString() + '/' + event.params.positionid.toString()
  let userPosition = new UserPosition(positionid)
  userPosition.farm = event.params.pid.toString()
  userPosition.startBlock = event.params.startBlock
  userPosition.endBlock = event.params.endBlock
  userPosition.amounts = event.params.amounts
  userPosition.nftReward = event.params.nftAddr.toHexString() + '/' + event.params.nftid.toString()
  userPosition.isActive = true
  userPosition.save()

  updateUserPositionOwnership(positionid, event.params.user)
}

export function handleTokenFarmWithdraw(event: Withdraw): void {
  let farmingData  = FarmingData.load('0')
  if (farmingData !== null) {
    farmingData.totalActivePositions = farmingData.totalActivePositions - BigInt.fromI32(1)
    farmingData.save()
  }


  let positionid = event.params.user.toHexString() + '/' + event.params.pid.toString() + '/' + event.params.positionid.toString()
  let userPosition = UserPosition.load(positionid)
  if (userPosition !== null) {
    userPosition.isActive = false
    userPosition.save()
  }

  let farm = Farm.load(event.params.pid.toString())
  if (farm !== null) {
    farm.activePositions = farm.activePositions - BigInt.fromI32(1)
    farm.save()
  }
}


export function updateUserPositionOwnership(positionid:string, owner: Address): void {
  let ownershipid = positionid + "/" + owner.toHexString();
  let ownership  = new PositionOwnership(ownershipid)
  ownership.userPosition = positionid;
  ownership.owner = owner;
  ownership.save()
}

