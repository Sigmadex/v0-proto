function getSelectors(contract) {
  return  Object.keys(contract.methods).filter((key) => {
    return /^0x/.test(key)
  })
}

async function deploy(account, artifact, args) {
  const contract = new web3.eth.Contract(artifact.abi)
  let instance;
  await contract.deploy({
    data: artifact.bytecode,
    arguments: args ? args: []
  }).send({
    from: account,
    gas: 15000000,
    gasPrice: '1000000000'
  }).then((inst) => {
    instance = inst
  })
  return instance;
}

function initArgs(nftAddresses, nftArtifacts, prefixes) {
  const withdrawSigs = [];
  const vaultWithdrawSigs = [];
  const rewardSigs = [];
  
  nftArtifacts.forEach((artifact, i) => {
    const withdrawTest = new RegExp(`${prefixes[i]}Withdraw`)
    const withdrawVaultTest = new RegExp(`${prefixes[i]}WithdrawVault`)
    const rewardTest = new RegExp(`${prefixes[i]}Reward`)
    const wSig = web3.eth.abi.encodeFunctionSignature(
      artifact.abi.find((f) =>  withdrawTest.test(f.name) == true)
    )
    const vWSig = web3.eth.abi.encodeFunctionSignature(
      artifact.abi.find((f) =>  withdrawVaultTest.test(f.name) == true)
    )
    const rewardSig = web3.eth.abi.encodeFunctionSignature(
      artifact.abi.find((f) =>  rewardTest.test(f.name) == true)
    )
    withdrawSigs.push(wSig)
    vaultWithdrawSigs.push(vWSig)
    rewardSigs.push(rewardSig)
  })

  return [
    nftAddresses,
    withdrawSigs,
    vaultWithdrawSigs,
    rewardSigs
  ]
}

exports.getSelectors = getSelectors
exports.deploy = deploy
exports.initArgs = initArgs

exports.ADDRESSZERO = '0x0000000000000000000000000000000000000000'
