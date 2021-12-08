
import { Address, BigInt, BigDecimal, store, Bytes, ByteArray } from "@graphprotocol/graph-ts"
import { UserPosition, PositionOwnership, Farm } from '../generated/schema'

import {TokenFarmFacet, Deposit, Add} from '../generated/TokenFarmFacet/TokenFarmFacet'


export function handleAddFarm(event: Add): void {
  let farmid = event.params.pid.toString()
  let farm = new Farm(farmid)
  farm.pid = event.params.pid
  
  farm.tokens = event.params.tokens.map<Bytes>((token) => token as Bytes)
  farm.validNFTs = event.params.validNFTs.map<Bytes>((nft) => nft as Bytes)
  farm.allocPoint = event.params.allocPoint
  farm.save()

}

export function handleTokenFarmDeposit(event: Deposit): void {
  let positionid = event.params.user.toHexString() + '/' + event.params.pid.toString() + '/' + event.params.positionid.toString()
  let userPosition = new UserPosition(positionid)
  userPosition.farm = event.params.pid.toString()
  userPosition.startBlock = event.params.startBlock
  userPosition.endBlock = event.params.endBlock
  userPosition.amounts = event.params.amounts
  userPosition.nftReward = event.params.nftAddr.toHexString()
  userPosition.save()

  updateUserPositionOwnership(positionid, event.params.user)
}


export function updateUserPositionOwnership(positionid:string, owner: Address): void {
  let ownershipid = positionid + "/" + owner.toHexString();

  let ownership  = new PositionOwnership(ownershipid)

  ownership.userPosition = positionid;
  ownership.owner = owner;
  ownership.save()
}
