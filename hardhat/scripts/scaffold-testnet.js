const fs = require('fs')
const { deploy, getSelectors, initArgs, ADDRESSZERO } = require('./libraries/diamond.js')

const SdexFacet = artifacts.require('SdexFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')

const RewardFacet = artifacts.require('RewardFacet')

const RewardAmplifierRewardFacet = artifacts.require('RewardAmplifierRewardFacet')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const MockERC20 = artifacts.require('MockERC20')

const Addresses = require('../../web/src/config/Addresses.json')
async function deployTestnetScaffold() {

  const diamondAddress = Addresses.diamond
  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const carol = accounts[3]
  const dan = accounts[4]
  const users = [alice, bob, carol, dan]

  let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
  const tokenA = await deploy(owner, MockERC20, ['Polkadot', 'DOT', erc20TotalSupply ])
  const tokenB = await deploy(owner, MockERC20, ['Wrapped BTC', 'WBTC', erc20TotalSupply ])
  const tokenC = await deploy(owner, MockERC20, ['USD Tether', 'USDT', erc20TotalSupply ])

  Addresses['tokenA'] = tokenA._address
  Addresses['tokenB'] = tokenB._address
  Addresses['tokenC'] = tokenC._address
  const data = JSON.stringify(Addresses)
  fs.writeFileSync('../web/src/config/Addresses.json', data, (err) => {
    if (err) {
      throw err
    } else {
      console.log('Diamond Address Written to the web/public directory')
    }
  })

  const amount = web3.utils.toWei('2000', 'ether')
  await tokenA.methods.transfer(alice, amount).send({ from: owner });
  await tokenB.methods.transfer(alice, amount).send({ from: owner });
  await tokenC.methods.transfer(alice, amount).send({ from: owner });
  await tokenA.methods.transfer(bob, amount).send({ from: owner });
  await tokenB.methods.transfer(bob, amount).send({ from: owner });
  await tokenC.methods.transfer(bob, amount).send({ from: owner });
  await tokenA.methods.transfer(carol, amount).send({ from: owner });
  await tokenB.methods.transfer(carol, amount).send({ from: owner });
  await tokenC.methods.transfer(carol, amount).send({ from: owner });
  await tokenA.methods.transfer(dan, amount).send({ from: owner });
  await tokenB.methods.transfer(dan, amount).send({ from: owner });
  await tokenC.methods.transfer(dan, amount).send({ from: owner });
  
  const sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)

  const sdexAmount = web3.utils.toWei('1000', 'ether')

  await sdexFacet.methods.executiveMint(owner, sdexAmount).send({ from:owner })
  await sdexFacet.methods.executiveMint(alice, sdexAmount).send({ from: owner })
  await sdexFacet.methods.executiveMint(bob, sdexAmount).send({ from: owner })
  await sdexFacet.methods.executiveMint(carol, sdexAmount).send({ from: owner })
  await sdexFacet.methods.executiveMint(dan, sdexAmount).send({ from: owner })

    const rewardAmplifierRewardFacet = new web3.eth.Contract(RewardAmplifierRewardFacet.abi, diamondAddress)
    const increasedBlockRewardFacet = new web3.eth.Contract(IncreasedBlockRewardFacet.abi, diamondAddress)
    const reducedPenaltyRewardFacet = new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, diamondAddress)

    const rARAddress = await rewardAmplifierRewardFacet.methods.rARAddress().call()
    const iBRAddress = await increasedBlockRewardFacet.methods.iBRAddress().call()
    const rPRAddress =  await reducedPenaltyRewardFacet.methods.rPRAddress().call()

    const rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)  

    await rewardFacet.methods.addReward(tokenA._address, rARAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rARAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rARAddress).send({from:owner})

    await rewardFacet.methods.addReward(tokenA._address, iBRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, iBRAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, iBRAddress).send({from:owner})


    await rewardFacet.methods.addReward(tokenA._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenC._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})



  const tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
  const sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)

  await tokenFarmFacet.methods.add(
    [tokenA._address, tokenB._address],
    '1000', //pool Alloc Points
    [iBRAddress, rARAddress, rPRAddress],
    true
  ).send(
    {from:owner}
  )
    
  await tokenFarmFacet.methods.add(
    [tokenA._address, tokenC._address],
    '1000', //pool Alloc Points
    [iBRAddress, rARAddress, rPRAddress],
    true
  ).send(
    {from:owner}
  )

  await tokenFarmFacet.methods.add(
    [tokenC._address, diamondAddress],
    '1000', //pool Alloc Points
    [iBRAddress, rARAddress, rPRAddress],
    true
  ).send(
    {from:owner}
  )
  const poolS = 0
  const poolAB = 1
  const poolAC = 2
  const poolCS = 3
  const initUsers = [bob, carol, dan]
  for (let user in initUsers) {
    for (let i=0; i <= 24; i++) {
      const stakeAmountA = web3.utils.toWei((Math.random() * (30 - 5) + 5).toFixed(18), 'ether');
      const stakeAmountB = web3.utils.toWei((Math.random() * (30 - 5) + 5).toFixed(18), 'ether');
      const blocksToStake = Math.floor(Math.random()* (40000 - 25) + 25)

      switch (i % 5) {
        case (0):
          await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:initUsers[user]})
          await tokenFarmFacet.methods.deposit(
            poolS,
            [stakeAmountA],
            blocksToStake,
            ADDRESSZERO,
            0
          ).send({from:initUsers[user]})
          break;
        
        case(1):
          await tokenA.methods.approve(diamondAddress, stakeAmountA).send({from:initUsers[user]})
          await tokenB.methods.approve(diamondAddress, stakeAmountB).send({from:initUsers[user]})
          await tokenFarmFacet.methods.deposit(
            poolAB,
            [stakeAmountA, stakeAmountB],
            blocksToStake,
            ADDRESSZERO,
            0
          ).send({from:initUsers[user]})
          break;
        case(2):
          await tokenA.methods.approve(diamondAddress, stakeAmountA).send({from:initUsers[user]})
          await tokenC.methods.approve(diamondAddress, stakeAmountB).send({from:initUsers[user]})
          await tokenFarmFacet.methods.deposit(
            poolAC,
            [stakeAmountA, stakeAmountB],
            blocksToStake,
            ADDRESSZERO,
            0
          ).send({from:initUsers[user]})
          break;
        case(3):

          await tokenC.methods.approve(diamondAddress, stakeAmountA).send({from:initUsers[user]})
          await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:initUsers[user]})
          await tokenFarmFacet.methods.deposit(
            poolCS,
            [stakeAmountA, stakeAmountB],
            blocksToStake,
            ADDRESSZERO,
            0
          ).send({from:initUsers[user]})
          break;
        case (4):
          await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:initUsers[user]})
          await sdexVaultFacet.methods.depositVault(
            stakeAmountA,
            blocksToStake,
            ADDRESSZERO,
            0
          ).send({from:initUsers[user]})
          break;
      }
    }
  }

  danUserInfo = await tokenFarmFacet.methods.userInfo(poolS, dan).call()
  // Dan 'funds' the penalty pools
        await tokenFarmFacet.methods.withdraw(
          poolS,
          0
        ).send({from:dan})
        await tokenFarmFacet.methods.withdraw(
          poolAB,
          0
        ).send({from:dan})
        await tokenFarmFacet.methods.withdraw(
          poolAC,
          0
        ).send({from:dan})
        await tokenFarmFacet.methods.withdraw(
          poolCS,
          0
        ).send({from:dan})
        await sdexVaultFacet.methods.withdrawVault(
          0
        ).send({from:dan})

        await tokenFarmFacet.methods.withdraw(
          poolS,
          1
        ).send({from:dan})
        await tokenFarmFacet.methods.withdraw(
          poolAB,
          1
        ).send({from:dan})
        await tokenFarmFacet.methods.withdraw(
          poolAC,
          1
        ).send({from:dan})
        await tokenFarmFacet.methods.withdraw(
          poolCS,
          1
        ).send({from:dan})
        await sdexVaultFacet.methods.withdrawVault(
          1
        ).send({from:dan})
  // nfts for alice
  for (let i = 0; i <= 5; i++) {
    const stakeAmountA = web3.utils.toWei((Math.random() * (30 - 5) + 5).toFixed(18), 'ether');
    const stakeAmountB = web3.utils.toWei((Math.random() * (30 - 5) + 5).toFixed(18), 'ether');
    const blocksToStake = 5
    switch (i % 4) {
      case (0):
      await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
      await tokenFarmFacet.methods.deposit(
        poolS,
        [stakeAmountA],
        blocksToStake,
        ADDRESSZERO,
        0
      ).send({from:alice})
      break
      case (1):
      await tokenA.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
      await tokenB.methods.approve(diamondAddress, stakeAmountB).send({from:alice})
      await tokenFarmFacet.methods.deposit(
        poolAB,
        [stakeAmountA, stakeAmountB],
        blocksToStake,
        ADDRESSZERO,
        0
      ).send({from:alice})
      break
      case (2):
      await tokenA.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
      await tokenC.methods.approve(diamondAddress, stakeAmountB).send({from:alice})
      await tokenFarmFacet.methods.deposit(
        poolAC,
        [stakeAmountA, stakeAmountB],
        blocksToStake,
        ADDRESSZERO,
        0
      ).send({from:alice})
      break
      case (3):
      await tokenC.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
      await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:alice})
      await tokenFarmFacet.methods.deposit(
        poolCS,
        [stakeAmountA, stakeAmountB],
        blocksToStake,
        ADDRESSZERO,
        0
      ).send({from:alice})
      break
    }
  }
    
    for (let i = 0; i <= 5; i++) {
      switch (i % 4) {
        case (0):
        await tokenFarmFacet.methods.withdraw(
          poolS,
          Math.floor(i/4)
        ).send({from:alice})
        break
        case (1):
        await tokenFarmFacet.methods.withdraw(
          poolAB,
          Math.floor(i/4)
        ).send({from:alice})
        break
        case (2):
        await tokenFarmFacet.methods.withdraw(
          poolAC,
          Math.floor(i/4)
        ).send({from:alice})
        break
        case (3):
        await tokenFarmFacet.methods.withdraw(
          poolCS,
          Math.floor(i/4)
        ).send({from:alice})
        break
      }
    }
  }
    


if (require.main === module) {
  deployTestnetScaffold()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployTestnetScaffold = deployTestnetScaffold
