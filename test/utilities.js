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

async function advanceBlocks(blocksAhead) {
  const currentBlock = await web3.eth.getBlockNumber()
  for (let i=currentBlock; i < currentBlock+blocksAhead; i++) {
    await iterateBlock()
  }
  return await web3.eth.getBlockNumber()
}


module.exports = {
  advanceBlocks
}
