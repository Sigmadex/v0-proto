function iterateBlock() {
  return new Promise((resolve, reject) => {
    web3.eth.currentProvider.send({
      method: "evm_mine",
      jsonrpc: "2.0",
      id: new Date().getTime()
    }, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })

  })
}

function warpTime(seconds) {
  return new Promise((resolve, reject) => {
    web3.eth.currentProvider.send({
      method: 'evm_increaseTime',
      jsonrpc: "2.0",
      params: [Number(seconds)],
      id: 0
    }, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

async function advanceTime(seconds) {
  return await warpTime(seconds)
}

async function advanceBlocks(blocksAhead) {
  const currentBlock = await web3.eth.getBlockNumber()
  for (let i=currentBlock; i < currentBlock+blocksAhead; i++) {
    await iterateBlock()
  }
  return await web3.eth.getBlockNumber()
}

async function advanceChain(blocks, blockPerSecond) {
  const currentBlock = await web3.eth.getBlockNumber()
  for (let i=currentBlock; i < currentBlock+blocks; i++) {
    await iterateBlock()
    await advanceTime(blockPerSecond)
  }
}

module.exports = {
  advanceBlocks,
  advanceTime,
  advanceChain
}
