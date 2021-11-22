import { Address, BigInt, BigDecimal, store } from "@graphprotocol/graph-ts"
import { ERC1155, TransferSingle, TransferBatch, URI } from '../generated/ReducedPenaltyReward/ERC1155'
import { Nft, Ownership } from '../generated/schema'; 
import { NftContract } from "../generated/schema";


export let ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");

export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);

export function handleTransferSingle(event: TransferSingle): void {
	transferBase(
		event.address,
		event.params.from,
		event.params.to,
		event.params.id,
		event.params.value,
		event.block.timestamp
	);
}

export function handleTransferBatch(event: TransferBatch): void {
	if (event.params.ids.length != event.params.values.length) {
		throw new Error("Inconsistent arrays length in TransferBatch");
	}

	for (let i = 0; i < event.params.ids.length; i++) {
		let ids = event.params.ids;
		let values = event.params.values;
		transferBase(
			event.address,
			event.params.from,
			event.params.to,
			ids[i],
			values[i],
			event.block.timestamp
		);
	}
	//do
}

function transferBase(contractAddress: Address, from: Address, to: Address, id: BigInt, value: BigInt, timestamp: BigInt): void {
	let nftId = contractAddress.toHexString() + "/" + id.toString();
	let nft = Nft.load(nftId);
	if (nft == null) {
		let contract = ERC1155.bind(contractAddress);
		nft = new Nft(nftId);
		nft.contract = contractAddress.toHexString();
		nft.tokenID = id;
		nft.tokenURI = contract.uri(id);
		nft.createdAt = timestamp;
		nft.save();
	}

	if (to == ZERO_ADDRESS) {
		// burn token
		nft.removedAt = timestamp;
		nft.save();
	}

	if (from != ZERO_ADDRESS) {
		updateOwnership(nftId, from, BIGINT_ZERO.minus(value));
	}
	updateOwnership(nftId, to, value);
}


export function updateOwnership(nftId: string, owner: Address, deltaQuantity: BigInt): void {
  let ownershipId = nftId + "/" + owner.toHexString();
  let ownership = Ownership.load(ownershipId);

  if (ownership == null) {
    ownership = new Ownership(ownershipId);
    ownership.nft = nftId;
    ownership.owner = owner;
    ownership.quantity = BIGINT_ZERO;
  }

  let newQuantity = ownership.quantity.plus(deltaQuantity);

  if (newQuantity.lt(BIGINT_ZERO)) {
    throw new Error("Negative token quantity")
  }

  if (newQuantity.isZero()) {
    store.remove('Ownership', ownershipId);
  } else {
    ownership.quantity = newQuantity;
    ownership.save();
  }
}

export function handleURI(event: URI): void {
    let id = event.address.toHexString() + "/" + event.params.id.toString();
    let nft = Nft.load(id);
    if (nft != null) {
        nft.tokenURI = event.params.value;
        nft.save();
    }
}
