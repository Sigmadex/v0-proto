
import { Address, BigInt, BigDecimal, store } from "@graphprotocol/graph-ts"
import { NftContract } from "../generated/schema";

import { ERC1155, TransferSingle, TransferBatch } from '../generated/ReducedPenaltyReward/ERC1155'

import { handleTransferSingle, handleTransferBatch, handleURI } from "./mapping"

export { handleURI }

export function iBRHandleTransferSingle(event: TransferSingle): void {
  ensureNftContract(event.address)
  handleTransferSingle(event)
}

export function iBRHandleTransferBatch(event: TransferBatch): void {
  ensureNftContract(event.address)
  handleTransferBatch(event)
}



function ensureNftContract(address: Address): void{
  if (NftContract.load(address.toHexString()) == null) {
    let nftContract = new NftContract(address.toHexString());
    nftContract.name = "Increased Block Reward";
    nftContract.symbol = "iBR";
    nftContract.platform = "IncreasedBlockReward";
    nftContract.save();
  }
}
