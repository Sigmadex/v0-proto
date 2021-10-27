const {deployments} = require('hardhat');

contract("Diamond", (accounts) => {
  console.log(accounts) 

  before(async () => {
    await deployments.fixture(['ADiamond'])
    const ADiamond = await deployments.get('ADiamond')
    console.log(ADiamond)
  })

  it("test", () => {
    console.log('hi')
  })
})
