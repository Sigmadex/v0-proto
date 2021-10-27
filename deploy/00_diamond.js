const IDiamondCut = artifacts.require('IDiamondCut')
module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
  const {deploy} = deployments;
  const {deployer, diamondAdmin} = await getNamedAccounts();
  console.log('hi')
  console.log(deployer)
  const diamondCutFacet = await deploy('DiamondCutFacet', {
    from: deployer,
  })
  console.log(diamondCutFacet.address)
  const diamond = await deploy('Diamond', {
    from: deployer,
    args: [diamondAdmin, diamondCutFacet.address]
  })
  const diamondInit = await deploy('DiamondInit', {
    from: deployer,
  });
  
  const diamondLoupeFacet = await deploy('DiamondLoupeFacet', {
    from: deployer
  })
  const ownerShipFacet = await deploy('OwnershipFacet', {
    from: deployer
  })

  const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond.address)
  const fnCall = web3.eth.abi.encodeFunctionCall(
    diamondInit.abi.find((f) => f.name == 'init'),
    []
  )

  //console.log(diamondLoupeFacet.abi)
  const LoupeSigs = diamondLoupeFacet.abi.map((f) => {
    const params = f.inputs.map((i) => {
      return i.type
    }).join()
    const fn = `${f.name}(${params})` 
    return web3.eth.abi.encodeFunctionSignature(fn)
  })

  const tx = await diamondCut.methods.diamondCut({
    facetAddress: diamondLoupeFacet,
    action: 0,
    functionSelectors: LoupeSigs
  },
    diamondInit.address,
    fnCall
  )
};
