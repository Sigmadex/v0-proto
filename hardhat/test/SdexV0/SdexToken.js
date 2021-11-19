const { deployDiamond } = require('../../scripts/deploy.js')
const SdexFacet = artifacts.require('SdexFacet')

contract("SdexFacet", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let sdexFacet;

  before(async () => {
    const diamondAddress = await deployDiamond()
    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
  })

  it("access params", async () => {
    const name = await sdexFacet.methods.name().call()
    assert.equal(name, 'Sigmadex')
    const decimals = await sdexFacet.methods.decimals().call()
    assert.equal(decimals, 18)
    const symbol = await sdexFacet.methods.symbol().call()
    assert.equal(symbol, 'SDEX')
    const totalSupply = await sdexFacet.methods.totalSupply().call()
    assert.equal(totalSupply.toString(), 0)
  })

  it("executive mints", async () => {
    let balanceOwner = await sdexFacet.methods.balanceOf(owner).call()
    assert.equal(balanceOwner.toString(), 0)
    const amountWei = web3.utils.toWei('10', 'ether')
    const mint = await sdexFacet.methods.executiveMint(owner, amountWei).send({ from: owner })
    balanceOwner = await sdexFacet.methods.balanceOf(owner).call()
    assert.equal(balanceOwner.toString(), amountWei)
  })

  it(" mint cannot be called by alice", async () => {
    const amountWei = web3.utils.toWei('10', 'ether')
    try {
      const mint = await sdexFacet.methods.executiveMint(alice, amountWei).send({ from: alice })
      assert.fail('should throw')
    } catch(e) {
      assert.include(e.message, 'LibDiamond: Must be contract owner')
    }
    try {
      const mint = await sdexFacet.methods.mint(alice, amountWei).send({ from: alice })
      assert.fail('should throw')
    } catch(e) {
      assert.include(e.message, "LibAppStorage: Caller Must be Diamond")
    }
    try {
      const mint = await sdexFacet.methods.mint(alice, amountWei).send({ from: owner })
      assert.fail('should throw')
    } catch(e) {
      assert.include(e.message, "LibAppStorage: Caller Must be Diamond")
    }
  })

  it(" can transfer", async () => {
    let balanceOwner = await sdexFacet.methods.balanceOf(owner).call()
    let balanceAlice = await sdexFacet.methods.balanceOf(alice).call()
    const amountWei = web3.utils.toWei('5', 'ether')
    const transfer = await sdexFacet.methods.transfer(alice, amountWei).send({from: owner})
    let balanceOwner2 = await sdexFacet.methods.balanceOf(owner).call()
    let balanceAlice2 = await sdexFacet.methods.balanceOf(alice).call()
    assert.equal(Number(balanceOwner) - Number(amountWei), balanceOwner2)
    assert.equal(Number(balanceAlice) + Number(amountWei), balanceAlice2)
  })

  it("approve and transferFrom", async () => {
    const amountWei2 = web3.utils.toWei('2.5', 'ether')
    try {
      await sdexFacet.methods.transferFrom(owner, bob, amountWei2).send({from:alice})
      assert.fail('should throw')
    } catch(e) {
      assert.include(e.message, 'transfer amount exceeds allowance')
    }
    let balanceOwner = await sdexFacet.methods.balanceOf(owner).call()
    let balanceAlice = await sdexFacet.methods.balanceOf(alice).call()
    let balanceBob = await sdexFacet.methods.balanceOf(bob).call()
    const allowanceOwner = await sdexFacet.methods.allowance(owner, alice).call({from: owner})
    assert.equal(allowanceOwner, 0)
    const amountWei = web3.utils.toWei('5', 'ether')
    const approve = await sdexFacet.methods.approve(alice, amountWei).send({from: owner})
    const allowanceOwner2 = await sdexFacet.methods.allowance(owner, alice).call({from: owner})
    assert.equal(allowanceOwner2, amountWei)

    const transferFrom = await sdexFacet.methods.transferFrom(owner, bob, amountWei2 ).send({from:alice})

    let balanceOwner2 = await sdexFacet.methods.balanceOf(owner).call()
    let balanceAlice2 = await sdexFacet.methods.balanceOf(alice).call()
    let balanceBob2 = await sdexFacet.methods.balanceOf(bob).call()
    
    assert.equal(Number(balanceOwner) - amountWei2, balanceOwner2)
    assert.equal(balanceAlice, balanceAlice2 )
    assert.equal(Number(balanceBob) + Number(amountWei2), balanceBob2)

    const allowanceOwner3 = await sdexFacet.methods.allowance(owner, alice).call({from: owner})
    assert.equal(Number(allowanceOwner2) - Number(amountWei2), allowanceOwner3)
  })
})
