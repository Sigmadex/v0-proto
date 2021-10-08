const fromExponential = require('from-exponential')

const { advanceBlocks, advanceTime } = require('./utilities.js');
const CakeToken = artifacts.require('CakeToken');
const SyrupBar = artifacts.require('SyrupBar');
const MasterChef = artifacts.require('MasterChefNew');
const MockBEP20 = artifacts.require('pancake/pancake-farm/libs/MockBEP20');
const CakeVault = artifacts.require('CakeVault');
contract('MasterChef', () => {
  let accounts;
  let alice, bob, carol, dev, cakeVaultreasury, cakeVaultAdmin, minter = '';
  let cake;
  let syrup;
  let erc20A;
  let erc20B;
  let chef;
  let cakeVault;
  before(async () => {
    accounts = await web3.eth.getAccounts()
    dev = accounts[0]
    minter = accounts[1]
    cakeVaultTreasury = accounts[2]
    cakeVaultAdmin = accounts[3]
    alice = accounts[4]
    bob = accounts[5]
    carol = accounts[6]
    cake = await CakeToken.new({from: minter})
    syrup = await SyrupBar.new(cake.address, {from: minter})
    let cakePerBlock = web3.utils.toWei('1', 'ether')
    chef = await MasterChef.new(cake.address, syrup.address,  dev, cakePerBlock, { from: minter });
    cakeVault = await CakeVault.new(
      cake.address,
      syrup.address,
      chef.address,
      cakeVaultAdmin,
      cakeVaultTreasury,
      {from: minter}
    )
    await cake.transferOwnership(chef.address, { from: minter });
    await syrup.transferOwnership(chef.address, { from: minter });
    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    erc20a = await MockBEP20.new('ERC20A', 'ERC20A', erc20TotalSupply, { from: minter });
    erc20b = await MockBEP20.new('ERC20B', 'ERC20B', erc20TotalSupply, { from: minter });
    await erc20a.transfer(
      bob,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    await erc20a.transfer(
      alice,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    await erc20b.transfer(
      bob,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    await erc20b.transfer(
      alice,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
  })

  
  it("adds a yield farm", async () => {
    // The cake token is the first yield farm, kinda interesting
    // what use case could sdex have for the syrup pools
    let poolLength = (await chef.poolLength()).toString()
    assert.equal(poolLength, "1");
    //let balanceMinter1 = await lp1.balanceOf(minter, { from: minter})
    //console.log(web3.utils.fromWei(balanceMinter1))
    let initialAlloc = await chef.totalAllocPoint();
    let allocPoints = '2000'
    await chef.add(
      [erc20a.address, erc20b.address],
      allocPoints,
      true,
      { from: minter }
    );
    
    poolLength = (await chef.poolLength()).toString()
    const blockNumber = await web3.eth.getBlockNumber()
    
    assert.equal(poolLength, "2");
    const poolInfo = await chef.getPoolInfo.call(poolLength-1)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, 0)
    assert.equal(poolInfo.allocPoint, 2000)
    assert.equal(poolInfo.lastRewardBlock, blockNumber)

    let finalAlloc =  await chef.totalAllocPoint();
    assert.equal(finalAlloc - initialAlloc, allocPoints)
  })
  it("updates a pool", async() => {
    let poolId = (await chef.poolLength()).toString() - 1
    let poolInfo = await chef.getPoolInfo.call(poolId)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, 0)
    assert.equal(poolInfo.allocPoint, '2000')
    assert.equal(poolInfo.lastRewardBlock, await web3.eth.getBlockNumber())
    await chef.updatePool(poolId)
    poolInfo = await chef.getPoolInfo.call(poolId)

  })
  it("allows user to stake", async () => {
    let allocPoints = '2000'
    let poolId = (await chef.poolLength()).toString() - 1
    let stakeAmount = web3.utils.toWei('20', 'ether')
    await erc20a.approve(
      chef.address,
      stakeAmount,
      { from: alice }
    );
    await erc20b.approve(
      chef.address,
      stakeAmount,
      { from: alice }
    );

    assert.equal((await cake.balanceOf(alice)).toString(), '0');

    let aliceErc20ABalance1 = await erc20a.balanceOf(alice)
    let aliceErc20BBalance1 = await erc20b.balanceOf(alice)
    await chef.deposit(
      poolId,
      [stakeAmount, stakeAmount],
      { from: alice }
    )
    let poolInfo = await chef.getPoolInfo.call(poolId)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, stakeAmount)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, stakeAmount)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, 0)
    assert.equal(poolInfo.allocPoint, '2000')
    assert.equal(poolInfo.lastRewardBlock, await web3.eth.getBlockNumber())
    let aliceErc20ABalance2 = await erc20a.balanceOf(alice)
    let aliceErc20BBalance2 = await erc20b.balanceOf(alice)
    assert.equal(
      aliceErc20ABalance1 - aliceErc20ABalance2,
      stakeAmount
    )
    assert.equal(
      aliceErc20BBalance1 - aliceErc20BBalance2,
      stakeAmount
    )

    let userInfo = await chef.getUserInfo.call(poolId, alice)
    assert.equal((await cake.balanceOf(alice)).toString(), '0');
    assert.equal(
      userInfo.tokenData[0].amount,
      stakeAmount
    )
    assert.equal(
      userInfo.tokenData[1].amount,
      stakeAmount
    )
    const blocksForward = 1
    await advanceBlocks(blocksForward)
    await chef.withdraw(
      poolId,
      { from: alice }
    )
    userInfo = await chef.getUserInfo.call(
      poolId,
      alice
    )
    const cakePerBlock = (await chef.cakePerBlock()).toString()
    const totalAllocPoints = (await chef.totalAllocPoint()).toString()
    const poolAllocPoints = (await chef.getPoolInfo.call(1)).allocPoint.toString()
    // 1 cake per block, 100 blocks forward + current block
    let numer = (blocksForward+1)*cakePerBlock*poolAllocPoints
    const numerator = new web3.utils.BN(fromExponential(numer))
    const denominator = new web3.utils.BN(totalAllocPoints)
    const cakeReward = numerator.div(denominator)
    assert.equal((await cake.balanceOf(alice)).toString(), cakeReward.toString());
    assert.equal(
      userInfo.tokenData[0].amount,
      0
    )
    assert.equal(
      userInfo.tokenData[1].amount,
      0
    )
    const unity = new web3.utils.BN(fromExponential(1e27))
    const stakeBN = new web3.utils.BN(stakeAmount)
    const accCakePerShare = cakeReward.mul(unity).div(stakeBN)
    poolInfo = await chef.getPoolInfo.call(poolId)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, accCakePerShare.toString() / 2)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, accCakePerShare.toString() / 2)
    assert.equal(poolInfo.allocPoint, '2000')
    assert.equal(poolInfo.lastRewardBlock, await web3.eth.getBlockNumber())

    console.log((await cake.balanceOf(alice)).toString())

  })
  it("can deposit cake", async() => {
    let aliceBalance1 = (await cake.balanceOf(alice)).toString()
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    await cake.approve(
      cakeVault.address,
      cakeDeposit,
      {from: alice}
    )
    await cakeVault.deposit(cakeDeposit, {from: alice})
    assert.equal(cakeDeposit,(await cakeVault.userInfo(alice)).shares.toString())
    let aliceBalance2 =  (await cake.balanceOf(alice)).toString()
    assert.equal(aliceBalance1 - aliceBalance2, cakeDeposit)
  })
  /*

  it("can withdrawal cake", async() => {
    let aliceBalance1 = (await cake.balanceOf(alice)).toString()
    const aliceShares = (await cakeVault.userInfo(alice)).shares.toString()
    await cakeVault.withdraw(aliceShares, {from: alice})
    const withdrawFee = (await cakeVault.withdrawFee()).toString() / 10000
    let aliceBalance2 =  (await cake.balanceOf(alice)).toString()
    assert.equal(aliceBalance2 - aliceBalance1, aliceShares - (aliceShares*withdrawFee))
  })

  it("can withdraw cake after more elapsed time", async () => {
    let aliceBalance1 = (await cake.balanceOf(alice))
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    await cake.approve(
      cakeVault.address,
      cakeDeposit,
      {from: alice}
    )
    await cakeVault.deposit(cakeDeposit, {from: alice})
    const withdrawFeePeriod = (await cakeVault.withdrawFeePeriod()).toString()
    await advanceTime(withdrawFeePeriod)

    const aliceShares = (await cakeVault.userInfo(alice)).shares.toString()
    await cakeVault.withdraw(aliceShares, {from: alice})

    const cakePerBlock = (await chef.cakePerBlock()).toString()
    const totalAllocPoints = (await chef.totalAllocPoint()).toString()
    const cakeAllocPoints= (await chef.poolInfo(0)).allocPoint.toString()
    // only one block ahead, advance time doesn't jump block like one would think
    let numer = (1)*cakePerBlock*cakeAllocPoints
    const numerator = new web3.utils.BN(fromExponential(numer))
    const denominator = new web3.utils.BN(totalAllocPoints)
    const cakeReward = numerator.div(denominator)
    
    let aliceBalance2 =  (await cake.balanceOf(alice))
    assert.equal((aliceBalance1.add(cakeReward)).toString(), aliceBalance2.toString())
  })
*/
})


/*
contract('MasterChef', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.cake = await CakeToken.new({ from: minter });
        this.syrup = await SyrupBar.new(this.cake.address, { from: minter });
        this.lp1 = await MockBEP20.new('LPToken', 'LP1', '1000000', { from: minter });
        this.lp2 = await MockBEP20.new('LPToken', 'LP2', '1000000', { from: minter });
        this.lp3 = await MockBEP20.new('LPToken', 'LP3', '1000000', { from: minter });
        this.chef = await MasterChef.new(this.cake.address, this.syrup.address, dev, '1000', '100', { from: minter });
        await this.cake.transferOwnership(this.chef.address, { from: minter });
        await this.syrup.transferOwnership(this.chef.address, { from: minter });

        await this.lp1.transfer(bob, '2000', { from: minter });
        await this.lp2.transfer(bob, '2000', { from: minter });
        await this.lp3.transfer(bob, '2000', { from: minter });

        await this.lp1.transfer(alice, '2000', { from: minter });
        await this.lp2.transfer(alice, '2000', { from: minter });
        await this.lp3.transfer(alice, '2000', { from: minter });
    });
    it('real case', async () => {
      this.lp4 = await MockBEP20.new('LPToken', 'LP1', '1000000', { from: minter });
      this.lp5 = await MockBEP20.new('LPToken', 'LP2', '1000000', { from: minter });
      this.lp6 = await MockBEP20.new('LPToken', 'LP3', '1000000', { from: minter });
      this.lp7 = await MockBEP20.new('LPToken', 'LP1', '1000000', { from: minter });
      this.lp8 = await MockBEP20.new('LPToken', 'LP2', '1000000', { from: minter });
      this.lp9 = await MockBEP20.new('LPToken', 'LP3', '1000000', { from: minter });
      await this.chef.add('2000', this.lp1.address, true, { from: minter });
      await this.chef.add('1000', this.lp2.address, true, { from: minter });
      await this.chef.add('500', this.lp3.address, true, { from: minter });
      await this.chef.add('500', this.lp3.address, true, { from: minter });
      await this.chef.add('500', this.lp3.address, true, { from: minter });
      await this.chef.add('500', this.lp3.address, true, { from: minter });
      await this.chef.add('500', this.lp3.address, true, { from: minter });
      await this.chef.add('100', this.lp3.address, true, { from: minter });
      await this.chef.add('100', this.lp3.address, true, { from: minter });
      assert.equal((await this.chef.poolLength()).toString(), "10");

      await time.advanceBlockTo('170');
      await this.lp1.approve(this.chef.address, '1000', { from: alice });
      assert.equal((await this.cake.balanceOf(alice)).toString(), '0');
      await this.chef.deposit(1, '20', { from: alice });
      await this.chef.withdraw(1, '20', { from: alice });
      assert.equal((await this.cake.balanceOf(alice)).toString(), '263');

      await this.cake.approve(this.chef.address, '1000', { from: alice });
      await this.chef.enterStaking('20', { from: alice });
      await this.chef.enterStaking('0', { from: alice });
      await this.chef.enterStaking('0', { from: alice });
      await this.chef.enterStaking('0', { from: alice });
      assert.equal((await this.cake.balanceOf(alice)).toString(), '993');
// assert.equal((await this.chef.getPoolPoint(0, { from: minter })).toString(), '1900');
    })


    it('deposit/withdraw', async () => {
      await this.chef.add('1000', this.lp1.address, true, { from: minter });
      await this.chef.add('1000', this.lp2.address, true, { from: minter });
      await this.chef.add('1000', this.lp3.address, true, { from: minter });

      await this.lp1.approve(this.chef.address, '100', { from: alice });
      await this.chef.deposit(1, '20', { from: alice });
      await this.chef.deposit(1, '0', { from: alice });
      await this.chef.deposit(1, '40', { from: alice });
      await this.chef.deposit(1, '0', { from: alice });
      assert.equal((await this.lp1.balanceOf(alice)).toString(), '1940');
      await this.chef.withdraw(1, '10', { from: alice });
      assert.equal((await this.lp1.balanceOf(alice)).toString(), '1950');
      assert.equal((await this.cake.balanceOf(alice)).toString(), '999');
      assert.equal((await this.cake.balanceOf(dev)).toString(), '100');

      await this.lp1.approve(this.chef.address, '100', { from: bob });
      assert.equal((await this.lp1.balanceOf(bob)).toString(), '2000');
      await this.chef.deposit(1, '50', { from: bob });
      assert.equal((await this.lp1.balanceOf(bob)).toString(), '1950');
      await this.chef.deposit(1, '0', { from: bob });
      assert.equal((await this.cake.balanceOf(bob)).toString(), '125');
      await this.chef.emergencyWithdraw(1, { from: bob });
      assert.equal((await this.lp1.balanceOf(bob)).toString(), '2000');
    })

    it('staking/unstaking', async () => {
      await this.chef.add('1000', this.lp1.address, true, { from: minter });
      await this.chef.add('1000', this.lp2.address, true, { from: minter });
      await this.chef.add('1000', this.lp3.address, true, { from: minter });

      await this.lp1.approve(this.chef.address, '10', { from: alice });
      await this.chef.deposit(1, '2', { from: alice }); //0
      await this.chef.withdraw(1, '2', { from: alice }); //1

      await this.cake.approve(this.chef.address, '250', { from: alice });
      await this.chef.enterStaking('240', { from: alice }); //3
      assert.equal((await this.syrup.balanceOf(alice)).toString(), '240');
      assert.equal((await this.cake.balanceOf(alice)).toString(), '10');
      await this.chef.enterStaking('10', { from: alice }); //4
      assert.equal((await this.syrup.balanceOf(alice)).toString(), '250');
      assert.equal((await this.cake.balanceOf(alice)).toString(), '249');
      await this.chef.leaveStaking(250);
      assert.equal((await this.syrup.balanceOf(alice)).toString(), '0');
      assert.equal((await this.cake.balanceOf(alice)).toString(), '749');

    });


    it('updaate multiplier', async () => {
      await this.chef.add('1000', this.lp1.address, true, { from: minter });
      await this.chef.add('1000', this.lp2.address, true, { from: minter });
      await this.chef.add('1000', this.lp3.address, true, { from: minter });

      await this.lp1.approve(this.chef.address, '100', { from: alice });
      await this.lp1.approve(this.chef.address, '100', { from: bob });
      await this.chef.deposit(1, '100', { from: alice });
      await this.chef.deposit(1, '100', { from: bob });
      await this.chef.deposit(1, '0', { from: alice });
      await this.chef.deposit(1, '0', { from: bob });

      await this.cake.approve(this.chef.address, '100', { from: alice });
      await this.cake.approve(this.chef.address, '100', { from: bob });
      await this.chef.enterStaking('50', { from: alice });
      await this.chef.enterStaking('100', { from: bob });

      await this.chef.updateMultiplier('0', { from: minter });

      await this.chef.enterStaking('0', { from: alice });
      await this.chef.enterStaking('0', { from: bob });
      await this.chef.deposit(1, '0', { from: alice });
      await this.chef.deposit(1, '0', { from: bob });

      assert.equal((await this.cake.balanceOf(alice)).toString(), '700');
      assert.equal((await this.cake.balanceOf(bob)).toString(), '150');

      await time.advanceBlockTo('265');

      await this.chef.enterStaking('0', { from: alice });
      await this.chef.enterStaking('0', { from: bob });
      await this.chef.deposit(1, '0', { from: alice });
      await this.chef.deposit(1, '0', { from: bob });

      assert.equal((await this.cake.balanceOf(alice)).toString(), '700');
      assert.equal((await this.cake.balanceOf(bob)).toString(), '150');

      await this.chef.leaveStaking('50', { from: alice });
      await this.chef.leaveStaking('100', { from: bob });
      await this.chef.withdraw(1, '100', { from: alice });
      await this.chef.withdraw(1, '100', { from: bob });

    });

    it('should allow dev and only dev to update dev', async () => {
        assert.equal((await this.chef.devaddr()).valueOf(), dev);
        await expectRevert(this.chef.dev(bob, { from: bob }), 'dev: wut?');
        await this.chef.dev(bob, { from: dev });
        assert.equal((await this.chef.devaddr()).valueOf(), bob);
        await this.chef.dev(alice, { from: bob });
        assert.equal((await this.chef.devaddr()).valueOf(), alice);
    })
});*/
