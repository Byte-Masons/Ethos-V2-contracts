const deploymentHelper = require("../utils/deploymentHelpers.js")
const testHelpers = require("../utils/testHelpers.js")

const th = testHelpers.TestHelper
const dec = th.dec
const toBN = th.toBN
const getDifference = th.getDifference
const mv = testHelpers.MoneyValues

const TroveManagerTester = artifacts.require("TroveManagerTester")
const LUSDToken = artifacts.require("LUSDToken")

contract('TroveManager - Redistribution reward calculations', async accounts => {

  const [
    owner,
    alice, bob, carol, dennis, erin, freddy, greta, harry, ida,
    A, B, C, D, E,
    whale, defaulter_1, defaulter_2, defaulter_3, defaulter_4] = accounts;

    const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000)

  let priceFeed
  let lusdToken
  let sortedTroves
  let troveManager
  let nameRegistry
  let activePool
  let stabilityPool
  let defaultPool
  let functionCaller
  let borrowerOperations
  let collaterals

  let contracts
  let liquidationReserve

  const getOpenTroveLUSDAmount = async (totalDebt) => th.getOpenTroveLUSDAmount(contracts, totalDebt)
  const getNetBorrowingAmount = async (debtWithFee) => th.getNetBorrowingAmount(contracts, debtWithFee)
  const openTrove = async (params) => th.openTrove(contracts, params)
  const mintCollateralAndApproveBorrowerOps = async (collateral, user, amount) => {
    await collateral.mint(user, amount)
    await collateral.approveInternal(user, borrowerOperations.address, amount)
  }

  beforeEach(async () => {
    contracts = await deploymentHelper.deployTestCollaterals(await deploymentHelper.deployLiquityCore())
    contracts.troveManager = await TroveManagerTester.new()
    contracts.lusdToken = await LUSDToken.new(
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.borrowerOperations.address,
      contracts.governance.address,
      contracts.guardian.address
    )
    const LQTYContracts = await deploymentHelper.deployLQTYContracts(bountyAddress, lpRewardsAddress, multisig)

    priceFeed = contracts.priceFeedTestnet
    lusdToken = contracts.lusdToken
    sortedTroves = contracts.sortedTroves
    troveManager = contracts.troveManager
    nameRegistry = contracts.nameRegistry
    activePool = contracts.activePool
    stabilityPool = contracts.stabilityPool
    defaultPool = contracts.defaultPool
    functionCaller = contracts.functionCaller
    borrowerOperations = contracts.borrowerOperations
    collaterals = contracts.collaterals

    await deploymentHelper.connectLQTYContracts(LQTYContracts)
    await deploymentHelper.connectCoreContracts(contracts, LQTYContracts)
    await deploymentHelper.connectLQTYContractsToCore(LQTYContracts, contracts)

    liquidationReserve = await troveManager.LUSD_GAS_COMPENSATION()
  })

  it("redistribution: A, B Open. B Liquidated. C, D Open. D Liquidated. Distributes correct rewards", async () => {
    // A, B open trove
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(430, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(230, 16)), extraParams: { from: bob } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // L1: B liquidated
    const txB = await troveManager.liquidate(bob, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, bob))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // C, D open troves
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(440, 16)), extraParams: { from: carol } })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(230, 16)), extraParams: { from: dennis } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // L2: D Liquidated
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Get entire coll of A and C
    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()
    const carol_Coll = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    /* Expected collateral:
    A: Alice receives 0.995 ETH from L1, and ~3/5*0.995 ETH from L2.
    expect aliceColl = 2 + 0.995 + 2.995/4.995 * 0.995 = 3.5916 ETH

    C: Carol receives ~2/5 ETH from L2
    expect carolColl = 2 + 2/4.995 * 0.995 = 2.398 ETH

    Total coll = 4 + 2 * 0.995 ETH
    */
    const A_collAfterL1 = A_coll.add(th.applyLiquidationFee(B_coll))
    assert.isAtMost(th.getDifference(alice_Coll, A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(D_coll)).div(A_collAfterL1.add(C_coll)))), 1000)
    assert.isAtMost(th.getDifference(carol_Coll, C_coll.add(C_coll.mul(th.applyLiquidationFee(D_coll)).div(A_collAfterL1.add(C_coll)))), 1000)


    const entireSystemColl = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    assert.equal(entireSystemColl, A_coll.add(C_coll).add(th.applyLiquidationFee(B_coll.add(D_coll))))

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: A, B Open. Minting paused. B Liquidated. Minting resumed. C, D Open. D Liquidated. Distributes correct rewards", async () => {
    // A, B open trove
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(430, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(230, 16)), extraParams: { from: bob } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // pause minting
    await contracts.guardian.execute(lusdToken.address, 0, th.getTransactionData('pauseMinting()', []), 0, 100_000);

    // L1: B liquidated
    const txB = await troveManager.liquidate(bob, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, bob))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // unpause minting
    await contracts.governance.execute(lusdToken.address, 0, th.getTransactionData('unpauseMinting()', []), 0, 100_000);

    // C, D open troves
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(440, 16)), extraParams: { from: carol } })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(230, 16)), extraParams: { from: dennis } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // L2: D Liquidated
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Get entire coll of A and C
    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()
    const carol_Coll = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    /* Expected collateral:
    A: Alice receives 0.995 ETH from L1, and ~3/5*0.995 ETH from L2.
    expect aliceColl = 2 + 0.995 + 2.995/4.995 * 0.995 = 3.5916 ETH

    C: Carol receives ~2/5 ETH from L2
    expect carolColl = 2 + 2/4.995 * 0.995 = 2.398 ETH

    Total coll = 4 + 2 * 0.995 ETH
    */
    const A_collAfterL1 = A_coll.add(th.applyLiquidationFee(B_coll))
    assert.isAtMost(th.getDifference(alice_Coll, A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(D_coll)).div(A_collAfterL1.add(C_coll)))), 1000)
    assert.isAtMost(th.getDifference(carol_Coll, C_coll.add(C_coll.mul(th.applyLiquidationFee(D_coll)).div(A_collAfterL1.add(C_coll)))), 1000)


    const entireSystemColl = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    assert.equal(entireSystemColl, A_coll.add(C_coll).add(th.applyLiquidationFee(B_coll.add(D_coll))))

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: A, B Open. Protocol upgraded. B Liquidated. C, D Open. D Liquidated. Distributes correct rewards", async () => {
    // A, B open trove
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(430, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(230, 16)), extraParams: { from: bob } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // upgrade protocol
    const newContracts = await deploymentHelper.deployLiquityCore();
    newContracts.troveManager = await TroveManagerTester.new()
    newContracts.lusdToken = lusdToken;
    newContracts.treasury = contracts.treasury;
    newContracts.collaterals = contracts.collaterals;
    newContracts.reapervaults = contracts.reapervaults;
    const LQTYContracts = await deploymentHelper.deployLQTYContracts(bountyAddress, lpRewardsAddress, multisig)
    await deploymentHelper.connectLQTYContracts(LQTYContracts)
    await deploymentHelper.connectCoreContracts(newContracts, LQTYContracts)
    await deploymentHelper.connectLQTYContractsToCore(LQTYContracts, newContracts)
    await contracts.governance.execute(
      lusdToken.address,
      0,
      th.getTransactionData(
        'upgradeProtocol(address,address,address)',
        [
          newContracts.troveManager.address,
          newContracts.stabilityPool.address,
          newContracts.borrowerOperations.address
        ]
      ),
      0,
      300_000
    );

    // L1: B liquidated
    const txB = await troveManager.liquidate(bob, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, bob))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // C, D open troves
    const { collateral: C_coll } = await th.openTrove(
      newContracts,
      { collateral: collaterals[0], ICR: toBN(dec(440, 16)), extraParams: { from: carol } }
    )
    const { collateral: D_coll } = await th.openTrove(
      newContracts,
      { collateral: collaterals[0], ICR: toBN(dec(230, 16)), extraParams: { from: dennis } }
    )

    // Price drops to 100 $/E
    await newContracts.priceFeedTestnet.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(newContracts, collaterals[0].address))

    // L2: D Liquidated
    const txD = await newContracts.troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await newContracts.sortedTroves.contains(collaterals[0].address, dennis))
  })

  it("redistribution: A, B, C Open. C Liquidated. D, E, F Open. F Liquidated. Distributes correct rewards", async () => {
    // A, B C open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: bob } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(210, 16)), extraParams: { from: carol } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // L1: C liquidated
    const txC = await troveManager.liquidate(carol, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, carol))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // D, E, F open troves
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: dennis } })
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: erin } })
    const { collateral: F_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(210, 16)), extraParams: { from: freddy } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Confirm not in Recovery Mode
    assert.isFalse(await th.checkRecoveryMode(contracts, collaterals[0].address))

    // L2: F Liquidated
    const txF = await troveManager.liquidate(freddy, collaterals[0].address)
    assert.isTrue(txF.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, freddy))

    // Get entire coll of A, B, D and E
    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()
    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()
    const dennis_Coll = ((await troveManager.Troves(dennis, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(dennis, collaterals[0].address)))
      .toString()
    const erin_Coll = ((await troveManager.Troves(erin, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(erin, collaterals[0].address)))
      .toString()

    /* Expected collateral:
    A and B receives 1/2 ETH * 0.995 from L1.
    total Coll: 3

    A, B, receive (2.4975)/8.995 * 0.995 ETH from L2.
    
    D, E receive 2/8.995 * 0.995 ETH from L2.

    expect A, B coll  = 2 +  0.4975 + 0.2763  =  ETH
    expect D, E coll  = 2 + 0.2212  =  ETH

    Total coll = 8 (non-liquidated) + 2 * 0.995 (liquidated and redistributed)
    */
    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(C_coll)).div(A_coll.add(B_coll)))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(C_coll)).div(A_coll.add(B_coll)))
    const totalBeforeL2 = A_collAfterL1.add(B_collAfterL1).add(D_coll).add(E_coll)
    const expected_A = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(F_coll)).div(totalBeforeL2))
    const expected_B = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(F_coll)).div(totalBeforeL2))
    const expected_D = D_coll.add(D_coll.mul(th.applyLiquidationFee(F_coll)).div(totalBeforeL2))
    const expected_E = E_coll.add(E_coll.mul(th.applyLiquidationFee(F_coll)).div(totalBeforeL2))
    assert.isAtMost(th.getDifference(alice_Coll, expected_A), 1000)
    assert.isAtMost(th.getDifference(bob_Coll, expected_B), 1000)
    assert.isAtMost(th.getDifference(dennis_Coll, expected_D), 1000)
    assert.isAtMost(th.getDifference(erin_Coll, expected_E), 1000)

    const entireSystemColl = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    assert.equal(entireSystemColl, A_coll.add(B_coll).add(D_coll).add(E_coll).add(th.applyLiquidationFee(C_coll.add(F_coll))))

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })
  ////

  it("redistribution: Sequence of alternate opening/liquidation: final surviving trove has ETH from all previously liquidated troves", async () => {
    // A, B  open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: bob } })

    // Price drops to 1 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // L1: A liquidated
    const txA = await troveManager.liquidate(alice, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, alice))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))
    // C, opens trove
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(210, 16)), extraParams: { from: carol } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // L2: B Liquidated
    const txB = await troveManager.liquidate(bob, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, bob))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))
    // D opens trove
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(210, 16)), extraParams: { from: dennis } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // L3: C Liquidated
    const txC = await troveManager.liquidate(carol, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, carol))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))
    // E opens trove
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(210, 16)), extraParams: { from: erin } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // L4: D Liquidated
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txD.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))
    // F opens trove
    const { collateral: F_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(210, 16)), extraParams: { from: freddy } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // L5: E Liquidated
    const txE = await troveManager.liquidate(erin, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, erin))

    // Get entire coll of A, B, D, E and F
    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()
    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()
    const carol_Coll = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()
    const dennis_Coll = ((await troveManager.Troves(dennis, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(dennis, collaterals[0].address)))
      .toString()
    const erin_Coll = ((await troveManager.Troves(erin, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(erin, collaterals[0].address)))
      .toString()

    const freddy_rawColl = (await troveManager.Troves(freddy, collaterals[0].address))[1].toString()
    const freddy_ETHReward = (await troveManager.getPendingCollateralReward(freddy, collaterals[0].address)).toString()

    /* Expected collateral:
     A-E should have been liquidated
     trove F should have acquired all ETH in the system: 1 ETH initial coll, and 0.995^5+0.995^4+0.995^3+0.995^2+0.995 from rewards = 5.925 ETH
    */
    assert.isAtMost(th.getDifference(alice_Coll, '0'), 1000)
    assert.isAtMost(th.getDifference(bob_Coll, '0'), 1000)
    assert.isAtMost(th.getDifference(carol_Coll, '0'), 1000)
    assert.isAtMost(th.getDifference(dennis_Coll, '0'), 1000)
    assert.isAtMost(th.getDifference(erin_Coll, '0'), 1000)

    assert.isAtMost(th.getDifference(freddy_rawColl, F_coll), 1000)
    const gainedETH = th.applyLiquidationFee(
      E_coll.add(th.applyLiquidationFee(
        D_coll.add(th.applyLiquidationFee(
          C_coll.add(th.applyLiquidationFee(
            B_coll.add(th.applyLiquidationFee(A_coll))
          ))
        ))
      ))
    )
    assert.isAtMost(th.getDifference(freddy_ETHReward, gainedETH), 1000)

    const entireSystemColl = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    assert.isAtMost(th.getDifference(entireSystemColl, F_coll.add(gainedETH)), 1000)

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(5)))
  })

  // ---Trove adds collateral --- 

  // Test based on scenario in: https://docs.google.com/spreadsheets/d/1F5p3nZy749K5jwO-bwJeTsRoY7ewMfWIQ3QHtokxqzo/edit?usp=sharing
  it("redistribution: A,B,C,D,E open. Liq(A). B adds coll. Liq(C). B and D have correct coll and debt", async () => {
    // A, B, C, D, E open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: A } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: B } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: C } })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(20000, 16)), extraLUSDAmount: dec(10, 18), extraParams: { from: D } })
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: E } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate A
    // console.log(`ICR A: ${await troveManager.getCurrentICR(A, price)}`)
    const txA = await troveManager.liquidate(A, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, A))

    // Check entireColl for each trove:
    const B_entireColl_1 = (await th.getEntireCollAndDebt(contracts, B, collaterals[0].address)).entireColl
    const C_entireColl_1 = (await th.getEntireCollAndDebt(contracts, C, collaterals[0].address)).entireColl
    const D_entireColl_1 = (await th.getEntireCollAndDebt(contracts, D, collaterals[0].address)).entireColl
    const E_entireColl_1 = (await th.getEntireCollAndDebt(contracts, E, collaterals[0].address)).entireColl

    const totalCollAfterL1 = B_coll.add(C_coll).add(D_coll).add(E_coll)
    const B_collAfterL1 = B_coll.add(th.applyLiquidationFee(A_coll).mul(B_coll).div(totalCollAfterL1))
    const C_collAfterL1 = C_coll.add(th.applyLiquidationFee(A_coll).mul(C_coll).div(totalCollAfterL1))
    const D_collAfterL1 = D_coll.add(th.applyLiquidationFee(A_coll).mul(D_coll).div(totalCollAfterL1))
    const E_collAfterL1 = E_coll.add(th.applyLiquidationFee(A_coll).mul(E_coll).div(totalCollAfterL1))
    assert.isAtMost(getDifference(B_entireColl_1, B_collAfterL1), 1e8)
    assert.isAtMost(getDifference(C_entireColl_1, C_collAfterL1), 1e8)
    assert.isAtMost(getDifference(D_entireColl_1, D_collAfterL1), 1e8)
    assert.isAtMost(getDifference(E_entireColl_1, E_collAfterL1), 1e8)

    // Bob adds 1 ETH to his trove
    const addedColl1 = toBN(dec(1, 'ether'))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], B, addedColl1)
    await borrowerOperations.addColl(collaterals[0].address, addedColl1, B, B, { from: B })

    // Liquidate C
    const txC = await troveManager.liquidate(C, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, C))

    const B_entireColl_2 = (await th.getEntireCollAndDebt(contracts, B, collaterals[0].address)).entireColl
    const D_entireColl_2 = (await th.getEntireCollAndDebt(contracts, D, collaterals[0].address)).entireColl
    const E_entireColl_2 = (await th.getEntireCollAndDebt(contracts, E, collaterals[0].address)).entireColl

    const totalCollAfterL2 = B_collAfterL1.add(addedColl1).add(D_collAfterL1).add(E_collAfterL1)
    const B_collAfterL2 = B_collAfterL1.add(addedColl1).add(th.applyLiquidationFee(C_collAfterL1).mul(B_collAfterL1.add(addedColl1)).div(totalCollAfterL2))
    const D_collAfterL2 = D_collAfterL1.add(th.applyLiquidationFee(C_collAfterL1).mul(D_collAfterL1).div(totalCollAfterL2))
    const E_collAfterL2 = E_collAfterL1.add(th.applyLiquidationFee(C_collAfterL1).mul(E_collAfterL1).div(totalCollAfterL2))
    // console.log(`D_entireColl_2: ${D_entireColl_2}`)
    // console.log(`E_entireColl_2: ${E_entireColl_2}`)
    //assert.isAtMost(getDifference(B_entireColl_2, B_collAfterL2), 1e8)
    assert.isAtMost(getDifference(D_entireColl_2, D_collAfterL2), 1e8)
    assert.isAtMost(getDifference(E_entireColl_2, E_collAfterL2), 1e8)

    // Bob adds 1 ETH to his trove
    const addedColl2 = toBN(dec(1, 'ether'))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], B, addedColl2)
    await borrowerOperations.addColl(collaterals[0].address, addedColl2, B, B, { from: B })

    // Liquidate E
    const txE = await troveManager.liquidate(E, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, E))

    const totalCollAfterL3 = B_collAfterL2.add(addedColl2).add(D_collAfterL2)
    const B_collAfterL3 = B_collAfterL2.add(addedColl2).add(th.applyLiquidationFee(E_collAfterL2).mul(B_collAfterL2.add(addedColl2)).div(totalCollAfterL3))
    const D_collAfterL3 = D_collAfterL2.add(th.applyLiquidationFee(E_collAfterL2).mul(D_collAfterL2).div(totalCollAfterL3))

    const B_entireColl_3 = (await th.getEntireCollAndDebt(contracts, B, collaterals[0].address)).entireColl
    const D_entireColl_3 = (await th.getEntireCollAndDebt(contracts, D, collaterals[0].address)).entireColl

    const diff_entireColl_B = getDifference(B_entireColl_3, B_collAfterL3)
    const diff_entireColl_D = getDifference(D_entireColl_3, D_collAfterL3)

    assert.isAtMost(diff_entireColl_B, 1e8)
    assert.isAtMost(diff_entireColl_D, 1e8)
  })

  // Test based on scenario in: https://docs.google.com/spreadsheets/d/1F5p3nZy749K5jwO-bwJeTsRoY7ewMfWIQ3QHtokxqzo/edit?usp=sharing
  it("redistribution: A,B,C,D open. Liq(A). B adds coll. Liq(C). B and D have correct coll and debt", async () => {
    // A, B, C, D, E open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: A } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: B } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: C } })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(20000, 16)), extraLUSDAmount: dec(10, 18), extraParams: { from: D } })
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100000, 18), extraParams: { from: E } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Check entireColl for each trove:
    const A_entireColl_0 = (await th.getEntireCollAndDebt(contracts, A, collaterals[0].address)).entireColl
    const B_entireColl_0 = (await th.getEntireCollAndDebt(contracts, B, collaterals[0].address)).entireColl
    const C_entireColl_0 = (await th.getEntireCollAndDebt(contracts, C, collaterals[0].address)).entireColl
    const D_entireColl_0 = (await th.getEntireCollAndDebt(contracts, D, collaterals[0].address)).entireColl
    const E_entireColl_0 = (await th.getEntireCollAndDebt(contracts, E, collaterals[0].address)).entireColl

    // entireSystemColl, excluding A 
    const denominatorColl_1 = (await troveManager.getEntireSystemColl(collaterals[0].address)).sub(A_entireColl_0)

    // Liquidate A
    // console.log(`ICR A: ${await troveManager.getCurrentICR(A, price)}`)
    const txA = await troveManager.liquidate(A, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, A))

    const A_collRedistribution = A_entireColl_0.mul(toBN(995)).div(toBN(1000)) // remove the gas comp

    // console.log(`A_collRedistribution: ${A_collRedistribution}`)
    // Check accumulated ETH gain for each trove
    const B_ETHGain_1 = await troveManager.getPendingCollateralReward(B, collaterals[0].address)
    const C_ETHGain_1 = await troveManager.getPendingCollateralReward(C, collaterals[0].address)
    const D_ETHGain_1 = await troveManager.getPendingCollateralReward(D, collaterals[0].address)
    const E_ETHGain_1 = await troveManager.getPendingCollateralReward(E, collaterals[0].address)

    // Check gains are what we'd expect from a distribution proportional to each trove's entire coll
    const B_expectedPendingETH_1 = A_collRedistribution.mul(B_entireColl_0).div(denominatorColl_1)
    const C_expectedPendingETH_1 = A_collRedistribution.mul(C_entireColl_0).div(denominatorColl_1)
    const D_expectedPendingETH_1 = A_collRedistribution.mul(D_entireColl_0).div(denominatorColl_1)
    const E_expectedPendingETH_1 = A_collRedistribution.mul(E_entireColl_0).div(denominatorColl_1)

    assert.isAtMost(getDifference(B_expectedPendingETH_1, B_ETHGain_1), 1e8)
    assert.isAtMost(getDifference(C_expectedPendingETH_1, C_ETHGain_1), 1e8)
    assert.isAtMost(getDifference(D_expectedPendingETH_1, D_ETHGain_1), 1e8)
    assert.isAtMost(getDifference(E_expectedPendingETH_1, E_ETHGain_1), 1e8)

    // // Bob adds 1 ETH to his trove
    await mintCollateralAndApproveBorrowerOps(collaterals[0], B, dec(1, 'ether'))
    await borrowerOperations.addColl(collaterals[0].address, dec(1, 'ether'), B, B, { from: B })

    // Check entireColl for each trove
    const B_entireColl_1 = (await th.getEntireCollAndDebt(contracts, B, collaterals[0].address)).entireColl
    const C_entireColl_1 = (await th.getEntireCollAndDebt(contracts, C, collaterals[0].address)).entireColl
    const D_entireColl_1 = (await th.getEntireCollAndDebt(contracts, D, collaterals[0].address)).entireColl
    const E_entireColl_1 = (await th.getEntireCollAndDebt(contracts, E, collaterals[0].address)).entireColl

    // entireSystemColl, excluding C
    const denominatorColl_2 = (await troveManager.getEntireSystemColl(collaterals[0].address)).sub(C_entireColl_1)

    // Liquidate C
    const txC = await troveManager.liquidate(C, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, C))

    const C_collRedistribution = C_entireColl_1.mul(toBN(995)).div(toBN(1000)) // remove the gas comp
    // console.log(`C_collRedistribution: ${C_collRedistribution}`)

    const B_ETHGain_2 = await troveManager.getPendingCollateralReward(B, collaterals[0].address)
    const D_ETHGain_2 = await troveManager.getPendingCollateralReward(D, collaterals[0].address)
    const E_ETHGain_2 = await troveManager.getPendingCollateralReward(E, collaterals[0].address)

    // Since B topped up, he has no previous pending ETH gain
    const B_expectedPendingETH_2 = C_collRedistribution.mul(B_entireColl_1).div(denominatorColl_2)

    // D & E's accumulated pending ETH gain includes their previous gain
    const D_expectedPendingETH_2 = C_collRedistribution.mul(D_entireColl_1).div(denominatorColl_2)
      .add(D_expectedPendingETH_1)

    const E_expectedPendingETH_2 = C_collRedistribution.mul(E_entireColl_1).div(denominatorColl_2)
      .add(E_expectedPendingETH_1)

    assert.isAtMost(getDifference(B_expectedPendingETH_2, B_ETHGain_2), 1e8)
    assert.isAtMost(getDifference(D_expectedPendingETH_2, D_ETHGain_2), 1e8)
    assert.isAtMost(getDifference(E_expectedPendingETH_2, E_ETHGain_2), 1e8)

    // // Bob adds 1 ETH to his trove
    await mintCollateralAndApproveBorrowerOps(collaterals[0], B, dec(1, 'ether'))
    await borrowerOperations.addColl(collaterals[0].address, dec(1, 'ether'), B, B, { from: B })

    // Check entireColl for each trove
    const B_entireColl_2 = (await th.getEntireCollAndDebt(contracts, B, collaterals[0].address)).entireColl
    const D_entireColl_2 = (await th.getEntireCollAndDebt(contracts, D, collaterals[0].address)).entireColl
    const E_entireColl_2 = (await th.getEntireCollAndDebt(contracts, E, collaterals[0].address)).entireColl

    // entireSystemColl, excluding E
    const denominatorColl_3 = (await troveManager.getEntireSystemColl(collaterals[0].address)).sub(E_entireColl_2)

    // Liquidate E
    const txE = await troveManager.liquidate(E, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, E))

    const E_collRedistribution = E_entireColl_2.mul(toBN(995)).div(toBN(1000)) // remove the gas comp
    // console.log(`E_collRedistribution: ${E_collRedistribution}`)

    const B_ETHGain_3 = await troveManager.getPendingCollateralReward(B, collaterals[0].address)
    const D_ETHGain_3 = await troveManager.getPendingCollateralReward(D, collaterals[0].address)

    // Since B topped up, he has no previous pending ETH gain
    const B_expectedPendingETH_3 = E_collRedistribution.mul(B_entireColl_2).div(denominatorColl_3)

    // D'S accumulated pending ETH gain includes their previous gain
    const D_expectedPendingETH_3 = E_collRedistribution.mul(D_entireColl_2).div(denominatorColl_3)
      .add(D_expectedPendingETH_2)

    assert.isAtMost(getDifference(B_expectedPendingETH_3, B_ETHGain_3), 1e8)
    assert.isAtMost(getDifference(D_expectedPendingETH_3, D_ETHGain_3), 1e8)
  })

  it("redistribution: A,B,C Open. Liq(C). B adds coll. Liq(A). B acquires all coll and debt", async () => {
    // A, B, C open troves
    const { collateral: A_coll, totalDebt: A_totalDebt } = await openTrove({ collateral: collaterals[1], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll, totalDebt: B_totalDebt } = await openTrove({ collateral: collaterals[1], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll, totalDebt: C_totalDebt } = await openTrove({ collateral: collaterals[1], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: carol } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[1].address, dec(100, 18))

    // Liquidate Carol
    const txC = await troveManager.liquidate(carol, collaterals[1].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[1].address, carol))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[1].address, dec(200, 18))

    //Bob adds ETH to his trove
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[1].address)
    const addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[1], bob, addedColl)
    await borrowerOperations.addColl(collaterals[1].address, addedColl, bob, bob, { from: bob })

    // Alice withdraws LUSD
    await borrowerOperations.withdrawLUSD(collaterals[1].address, th._100pct, await getNetBorrowingAmount(A_totalDebt), alice, alice, { from: alice })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[1].address, dec(100, 18))

    // Liquidate Alice
    const txA = await troveManager.liquidate(alice, collaterals[1].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[1].address, alice))

    // Expect Bob now holds all Ether and LUSDDebt in the system: 2 + 0.4975+0.4975*0.995+0.995 Ether and 110*3 LUSD (10 each for gas compensation)
    const bob_Coll = ((await troveManager.Troves(bob, collaterals[1].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[1].address)))
      .toString()

    const bob_LUSDDebt = ((await troveManager.Troves(bob, collaterals[1].address))[0]
      .add(await troveManager.getPendingLUSDDebtReward(bob, collaterals[1].address)))
      .toString()

    const expected_B_coll = B_coll
          .add(addedColl)
          .add(th.applyLiquidationFee(A_coll))
          .add(th.applyLiquidationFee(C_coll).mul(B_coll).div(A_coll.add(B_coll)))
          .add(th.applyLiquidationFee(th.applyLiquidationFee(C_coll).mul(A_coll).div(A_coll.add(B_coll))))
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(bob_LUSDDebt, A_totalDebt.mul(toBN(2)).add(B_totalDebt).add(C_totalDebt)), 1000)
  })

  it("redistribution: A,B,C Open. Liq(C). B tops up coll. D Opens. Liq(D). Distributes correct rewards.", async () => {
    // A, B, C open troves
    const { collateral: A_coll, totalDebt: A_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll, totalDebt: B_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll, totalDebt: C_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: carol } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Carol
    const txC = await troveManager.liquidate(carol, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, carol))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    //Bob adds ETH to his trove
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], bob, addedColl)
    await borrowerOperations.addColl(collaterals[0].address, addedColl, bob, bob, { from: bob })

    // D opens trove
    const { collateral: D_coll, totalDebt: D_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate D
    const txA = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    /* Bob rewards:
     L1: 1/2*0.995 ETH, 55 LUSD
     L2: (2.4975/3.995)*0.995 = 0.622 ETH , 110*(2.4975/3.995)= 68.77 LUSDDebt

    coll: 3.1195 ETH
    debt: 233.77 LUSDDebt

     Alice rewards:
    L1 1/2*0.995 ETH, 55 LUSD
    L2 (1.4975/3.995)*0.995 = 0.3730 ETH, 110*(1.4975/3.995) = 41.23 LUSDDebt

    coll: 1.8705 ETH
    debt: 146.23 LUSDDebt

    totalColl: 4.99 ETH
    totalDebt 380 LUSD (includes 50 each for gas compensation)
    */
    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const bob_LUSDDebt = ((await troveManager.Troves(bob, collaterals[0].address))[0]
      .add(await troveManager.getPendingLUSDDebtReward(bob, collaterals[0].address)))
      .toString()

    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const alice_LUSDDebt = ((await troveManager.Troves(alice, collaterals[0].address))[0]
      .add(await troveManager.getPendingLUSDDebtReward(alice, collaterals[0].address)))
      .toString()

    const totalCollAfterL1 = A_coll.add(B_coll).add(addedColl).add(th.applyLiquidationFee(C_coll))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(C_coll)).div(A_coll.add(B_coll))).add(addedColl)
    const expected_B_coll = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(D_coll)).div(totalCollAfterL1))
    const expected_B_debt = B_totalDebt
          .add(B_coll.mul(C_totalDebt).div(A_coll.add(B_coll)))
          .add(B_collAfterL1.mul(D_totalDebt).div(totalCollAfterL1))
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(bob_LUSDDebt, expected_B_debt), 10**9)

    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(C_coll)).div(A_coll.add(B_coll)))
    const expected_A_coll = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(D_coll)).div(totalCollAfterL1))
    const expected_A_debt = A_totalDebt
          .add(A_coll.mul(C_totalDebt).div(A_coll.add(B_coll)))
          .add(A_collAfterL1.mul(D_totalDebt).div(totalCollAfterL1))
    assert.isAtMost(th.getDifference(alice_Coll, expected_A_coll), 1000)
    assert.isAtMost(th.getDifference(alice_LUSDDebt, expected_A_debt), 10**9)

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: Trove with the majority stake tops up. A,B,C, D open. Liq(D). C tops up. E Enters, Liq(E). Distributes correct rewards", async () => {
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const _998_Ether = toBN(dec(998, collDecimals))
    // A, B, C, D open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], value: _998_Ether, extraLUSDAmount: dec(110, 18), extraParams: { from: carol } })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Dennis
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txD.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // Expected rewards:  alice: 1 ETH, bob: 1 ETH, carol: 998 ETH
    const alice_ETHReward_1 = await troveManager.getPendingCollateralReward(alice, collaterals[0].address)
    const bob_ETHReward_1 = await troveManager.getPendingCollateralReward(bob, collaterals[0].address)
    const carol_ETHReward_1 = await troveManager.getPendingCollateralReward(carol, collaterals[0].address)

    //Expect 1000 + 1000*0.995 ETH in system now
    const entireSystemColl_1 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    assert.equal(entireSystemColl_1, A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)))

    const totalColl = A_coll.add(B_coll).add(C_coll)
    th.assertIsApproximatelyEqual(alice_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(A_coll).div(totalColl))
    th.assertIsApproximatelyEqual(bob_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(B_coll).div(totalColl))
    th.assertIsApproximatelyEqual(carol_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(C_coll).div(totalColl))

    //Carol adds 1 ETH to her trove, brings it to 1992.01 total coll
    const C_addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], carol, dec(1, collDecimals))
    await borrowerOperations.addColl(collaterals[0].address, dec(1, collDecimals), carol, carol, { from: carol })

    //Expect 1996 ETH in system now
    const entireSystemColl_2 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_2, totalColl.add(th.applyLiquidationFee(D_coll)).add(C_addedColl))

    // E opens with another 1996 ETH
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], value: entireSystemColl_2, ICR: toBN(dec(200, 16)), extraParams: { from: erin } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Erin
    const txE = await troveManager.liquidate(erin, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, erin))

    /* Expected ETH rewards: 
     Carol = 1992.01/1996 * 1996*0.995 = 1982.05 ETH
     Alice = 1.995/1996 * 1996*0.995 = 1.985025 ETH
     Bob = 1.995/1996 * 1996*0.995 = 1.985025 ETH

    therefore, expected total collateral:

    Carol = 1991.01 + 1991.01 = 3974.06
    Alice = 1.995 + 1.985025 = 3.980025 ETH
    Bob = 1.995 + 1.985025 = 3.980025 ETH

    total = 3982.02 ETH
    */

    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const carol_Coll = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    const totalCollAfterL1 = A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)).add(C_addedColl)
    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll)))
    const expected_A_coll = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll)))
    const expected_B_coll = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const C_collAfterL1 = C_coll.add(C_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).add(C_addedColl)
    const expected_C_coll = C_collAfterL1.add(C_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))

    assert.isAtMost(th.getDifference(alice_Coll, expected_A_coll), 1000)
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(carol_Coll, expected_C_coll), 1000)

    //Expect 3982.02 ETH in system now
    const entireSystemColl_3 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    th.assertIsApproximatelyEqual(entireSystemColl_3, totalCollAfterL1.add(th.applyLiquidationFee(E_coll)))

    // check LUSD gas compensation
    th.assertIsApproximatelyEqual((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: Trove with the majority stake tops up. A,B,C, D open. Liq(D). A, B, C top up. E Enters, Liq(E). Distributes correct rewards", async () => {
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const _998_Ether = toBN(dec(998, collDecimals))
    // A, B, C open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], value: _998_Ether, extraLUSDAmount: dec(110, 18), extraParams: { from: carol} })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis} })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Dennis
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txD.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // Expected rewards:  alice: 1 ETH, bob: 1 ETH, carol: 998 ETH (*0.995)
    const alice_ETHReward_1 = await troveManager.getPendingCollateralReward(alice, collaterals[0].address)
    const bob_ETHReward_1 = await troveManager.getPendingCollateralReward(bob, collaterals[0].address)
    const carol_ETHReward_1 = await troveManager.getPendingCollateralReward(carol, collaterals[0].address)

    //Expect 1995 ETH in system now
    const entireSystemColl_1 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    assert.equal(entireSystemColl_1, A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)))

    const totalColl = A_coll.add(B_coll).add(C_coll)
    th.assertIsApproximatelyEqual(alice_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(A_coll).div(totalColl))
    th.assertIsApproximatelyEqual(bob_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(B_coll).div(totalColl))
    th.assertIsApproximatelyEqual(carol_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(C_coll).div(totalColl))

    /* Alice, Bob, Carol each adds 1 ETH to their troves, 
    bringing them to 2.995, 2.995, 1992.01 total coll each. */

    const addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], alice, addedColl)
    await borrowerOperations.addColl(collaterals[0].address, addedColl, alice, alice, { from: alice })
    await mintCollateralAndApproveBorrowerOps(collaterals[0], bob, addedColl)
    await borrowerOperations.addColl(collaterals[0].address, addedColl, bob, bob, { from: bob })
    await mintCollateralAndApproveBorrowerOps(collaterals[0], carol, addedColl)
    await borrowerOperations.addColl(collaterals[0].address, addedColl, carol, carol, { from: carol })

    //Expect 1998 ETH in system now
    const entireSystemColl_2 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address)).toString()
    th.assertIsApproximatelyEqual(entireSystemColl_2, totalColl.add(th.applyLiquidationFee(D_coll)).add(addedColl.mul(toBN(3))))

    // E opens with another 1998 ETH
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], value: entireSystemColl_2, ICR: toBN(dec(200, 16)), extraParams: { from: erin} })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Erin
    const txE = await troveManager.liquidate(erin, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, erin))

    /* Expected ETH rewards: 
     Carol = 1992.01/1998 * 1998*0.995 = 1982.04995 ETH
     Alice = 2.995/1998 * 1998*0.995 = 2.980025 ETH
     Bob = 2.995/1998 * 1998*0.995 = 2.980025 ETH

    therefore, expected total collateral:

    Carol = 1992.01 + 1982.04995 = 3974.05995
    Alice = 2.995 + 2.980025 = 5.975025 ETH
    Bob = 2.995 + 2.980025 = 5.975025 ETH

    total = 3986.01 ETH
    */

    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const carol_Coll = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    const totalCollAfterL1 = A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)).add(addedColl.mul(toBN(3)))
    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).add(addedColl)
    const expected_A_coll = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).add(addedColl)
    const expected_B_coll = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const C_collAfterL1 = C_coll.add(C_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).add(addedColl)
    const expected_C_coll = C_collAfterL1.add(C_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))

    assert.isAtMost(th.getDifference(alice_Coll, expected_A_coll), 1000)
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(carol_Coll, expected_C_coll), 1000)

    //Expect 3986.01 ETH in system now
    const entireSystemColl_3 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_3, totalCollAfterL1.add(th.applyLiquidationFee(E_coll)))

    // check LUSD gas compensation
    th.assertIsApproximatelyEqual((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  // --- Trove withdraws collateral ---

  it("redistribution: A,B,C Open. Liq(C). B withdraws coll. Liq(A). B acquires all coll and debt", async () => {
    // A, B, C open troves
    const { collateral: A_coll, totalDebt: A_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll, totalDebt: B_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll, totalDebt: C_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: carol } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Carol
    const txC = await troveManager.liquidate(carol, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, carol))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    //Bob withdraws 0.5 ETH from his trove
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const withdrawnColl = toBN(dec(5, collDecimals.sub(toBN(1))))
    await borrowerOperations.withdrawColl(collaterals[0].address, withdrawnColl, bob, bob, { from: bob })

    // Alice withdraws LUSD
    await borrowerOperations.withdrawLUSD(collaterals[0].address, th._100pct, await getNetBorrowingAmount(A_totalDebt), alice, alice, { from: alice })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Alice
    const txA = await troveManager.liquidate(alice, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, alice))

    // Expect Bob now holds all Ether and LUSDDebt in the system: 2.5 Ether and 300 LUSD
    // 1 + 0.995/2 - 0.5 + 1.4975*0.995
    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const bob_LUSDDebt = ((await troveManager.Troves(bob, collaterals[0].address))[0]
      .add(await troveManager.getPendingLUSDDebtReward(bob, collaterals[0].address)))
      .toString()

    const expected_B_coll = B_coll
          .sub(withdrawnColl)
          .add(th.applyLiquidationFee(A_coll))
          .add(th.applyLiquidationFee(C_coll).mul(B_coll).div(A_coll.add(B_coll)))
          .add(th.applyLiquidationFee(th.applyLiquidationFee(C_coll).mul(A_coll).div(A_coll.add(B_coll))))
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(bob_LUSDDebt, A_totalDebt.mul(toBN(2)).add(B_totalDebt).add(C_totalDebt)), 1000)

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: A,B,C Open. Liq(C). B withdraws coll. D Opens. Liq(D). Distributes correct rewards.", async () => {
    // A, B, C open troves
    const { collateral: A_coll, totalDebt: A_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll, totalDebt: B_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll, totalDebt: C_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: carol } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Carol
    const txC = await troveManager.liquidate(carol, collaterals[0].address)
    assert.isTrue(txC.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, carol))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    //Bob  withdraws 0.5 ETH from his trove
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const withdrawnColl = toBN(dec(5, collDecimals.sub(toBN(1))))
    await borrowerOperations.withdrawColl(collaterals[0].address, withdrawnColl, bob, bob, { from: bob })

    // D opens trove
    const { collateral: D_coll, totalDebt: D_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis } })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate D
    const txA = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    /* Bob rewards:
     L1: 0.4975 ETH, 55 LUSD
     L2: (0.9975/2.495)*0.995 = 0.3978 ETH , 110*(0.9975/2.495)= 43.98 LUSDDebt

    coll: (1 + 0.4975 - 0.5 + 0.3968) = 1.3953 ETH
    debt: (110 + 55 + 43.98 = 208.98 LUSDDebt 

     Alice rewards:
    L1 0.4975, 55 LUSD
    L2 (1.4975/2.495)*0.995 = 0.5972 ETH, 110*(1.4975/2.495) = 66.022 LUSDDebt

    coll: (1 + 0.4975 + 0.5972) = 2.0947 ETH
    debt: (50 + 55 + 66.022) = 171.022 LUSD Debt

    totalColl: 3.49 ETH
    totalDebt 380 LUSD (Includes 50 in each trove for gas compensation)
    */
    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const bob_LUSDDebt = ((await troveManager.Troves(bob, collaterals[0].address))[0]
      .add(await troveManager.getPendingLUSDDebtReward(bob, collaterals[0].address)))
      .toString()

    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const alice_LUSDDebt = ((await troveManager.Troves(alice, collaterals[0].address))[0]
      .add(await troveManager.getPendingLUSDDebtReward(alice, collaterals[0].address)))
      .toString()

    const totalCollAfterL1 = A_coll.add(B_coll).sub(withdrawnColl).add(th.applyLiquidationFee(C_coll))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(C_coll)).div(A_coll.add(B_coll))).sub(withdrawnColl)
    const expected_B_coll = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(D_coll)).div(totalCollAfterL1))
    const expected_B_debt = B_totalDebt
          .add(B_coll.mul(C_totalDebt).div(A_coll.add(B_coll)))
          .add(B_collAfterL1.mul(D_totalDebt).div(totalCollAfterL1))
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(bob_LUSDDebt, expected_B_debt), 10**9)

    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(C_coll)).div(A_coll.add(B_coll)))
    const expected_A_coll = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(D_coll)).div(totalCollAfterL1))
    const expected_A_debt = A_totalDebt
          .add(A_coll.mul(C_totalDebt).div(A_coll.add(B_coll)))
          .add(A_collAfterL1.mul(D_totalDebt).div(totalCollAfterL1))
    assert.isAtMost(th.getDifference(alice_Coll, expected_A_coll), 1000)
    assert.isAtMost(th.getDifference(alice_LUSDDebt, expected_A_debt), 10**9)

    const entireSystemColl = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl, A_coll.add(B_coll).add(th.applyLiquidationFee(C_coll)).sub(withdrawnColl).add(th.applyLiquidationFee(D_coll)))
    const entireSystemDebt = (await activePool.getLUSDDebt(collaterals[0].address)).add(await defaultPool.getLUSDDebt(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemDebt, A_totalDebt.add(B_totalDebt).add(C_totalDebt).add(D_totalDebt))

    // check LUSD gas compensation
    th.assertIsApproximatelyEqual((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: Trove with the majority stake withdraws. A,B,C,D open. Liq(D). C withdraws some coll. E Enters, Liq(E). Distributes correct rewards", async () => {
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const _998_Ether = toBN(dec(998, collDecimals))
    // A, B, C, D open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], value: _998_Ether, extraLUSDAmount: dec(110, 18), extraParams: { from: carol} })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis} })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Dennis
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txD.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // Expected rewards:  alice: 1 ETH, bob: 1 ETH, carol: 998 ETH (*0.995)
    const alice_ETHReward_1 = await troveManager.getPendingCollateralReward(alice, collaterals[0].address)
    const bob_ETHReward_1 = await troveManager.getPendingCollateralReward(bob, collaterals[0].address)
    const carol_ETHReward_1 = await troveManager.getPendingCollateralReward(carol, collaterals[0].address)

    //Expect 1995 ETH in system now
    const entireSystemColl_1 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_1, A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)))

    const totalColl = A_coll.add(B_coll).add(C_coll)
    th.assertIsApproximatelyEqual(alice_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(A_coll).div(totalColl))
    th.assertIsApproximatelyEqual(bob_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(B_coll).div(totalColl))
    th.assertIsApproximatelyEqual(carol_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(C_coll).div(totalColl))

    //Carol wthdraws 1 ETH from her trove, brings it to 1990.01 total coll
    const C_withdrawnColl = toBN(dec(1, collDecimals))
    await borrowerOperations.withdrawColl(collaterals[0].address, C_withdrawnColl, carol, carol, { from: carol })

    //Expect 1994 ETH in system now
    const entireSystemColl_2 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_2, totalColl.add(th.applyLiquidationFee(D_coll)).sub(C_withdrawnColl))

    // E opens with another 1994 ETH
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], value: entireSystemColl_2, ICR: toBN(dec(200, 16)), extraParams: { from: erin} })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Erin
    const txE = await troveManager.liquidate(erin, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, erin))

    /* Expected ETH rewards: 
     Carol = 1990.01/1994 * 1994*0.995 = 1980.05995 ETH
     Alice = 1.995/1994 * 1994*0.995 = 1.985025 ETH
     Bob = 1.995/1994 * 1994*0.995 = 1.985025 ETH

    therefore, expected total collateral:

    Carol = 1990.01 + 1980.05995 = 3970.06995
    Alice = 1.995 + 1.985025 = 3.980025 ETH
    Bob = 1.995 + 1.985025 = 3.980025 ETH

    total = 3978.03 ETH
    */

    const alice_Coll = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const bob_Coll = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const carol_Coll = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    const totalCollAfterL1 = A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)).sub(C_withdrawnColl)
    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll)))
    const expected_A_coll = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll)))
    const expected_B_coll = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const C_collAfterL1 = C_coll.add(C_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).sub(C_withdrawnColl)
    const expected_C_coll = C_collAfterL1.add(C_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))

    assert.isAtMost(th.getDifference(alice_Coll, expected_A_coll), 1000)
    assert.isAtMost(th.getDifference(bob_Coll, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(carol_Coll, expected_C_coll), 1000)

    //Expect 3978.03 ETH in system now
    const entireSystemColl_3 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_3, totalCollAfterL1.add(th.applyLiquidationFee(E_coll)))

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  it("redistribution: Trove with the majority stake withdraws. A,B,C,D open. Liq(D). A, B, C withdraw. E Enters, Liq(E). Distributes correct rewards", async () => {
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const _998_Ether = toBN(dec(998, collDecimals))
    // A, B, C, D open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(400, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: bob } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], value: _998_Ether, extraLUSDAmount: dec(110, 18), extraParams: { from: carol} })
    const { collateral: D_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis} })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Dennis
    const txD = await troveManager.liquidate(dennis, collaterals[0].address)
    assert.isTrue(txD.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, dennis))

    // Price bounces back to 200 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(200, 18))

    // Expected rewards:  alice: 1 ETH, bob: 1 ETH, carol: 998 ETH (*0.995)
    const alice_ETHReward_1 = await troveManager.getPendingCollateralReward(alice, collaterals[0].address)
    const bob_ETHReward_1 = await troveManager.getPendingCollateralReward(bob, collaterals[0].address)
    const carol_ETHReward_1 = await troveManager.getPendingCollateralReward(carol, collaterals[0].address)

    //Expect 1995 ETH in system now
    const entireSystemColl_1 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_1, A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)))

    const totalColl = A_coll.add(B_coll).add(C_coll)
    th.assertIsApproximatelyEqual(alice_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(A_coll).div(totalColl))
    th.assertIsApproximatelyEqual(bob_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(B_coll).div(totalColl))
    th.assertIsApproximatelyEqual(carol_ETHReward_1.toString(), th.applyLiquidationFee(D_coll).mul(C_coll).div(totalColl))

    /* Alice, Bob, Carol each withdraw 0.5 ETH to their troves, 
    bringing them to 1.495, 1.495, 1990.51 total coll each. */
    const withdrawnColl = toBN(dec(5, collDecimals.sub(toBN(1))))
    await borrowerOperations.withdrawColl(collaterals[0].address, withdrawnColl, alice, alice, { from: alice })
    await borrowerOperations.withdrawColl(collaterals[0].address, withdrawnColl, bob, bob, { from: bob })
    await borrowerOperations.withdrawColl(collaterals[0].address, withdrawnColl, carol, carol, { from: carol })

    const alice_Coll_1 = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const bob_Coll_1 = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const carol_Coll_1 = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    const totalColl_1 = A_coll.add(B_coll).add(C_coll)
    assert.isAtMost(th.getDifference(alice_Coll_1, A_coll.add(th.applyLiquidationFee(D_coll).mul(A_coll).div(totalColl_1)).sub(withdrawnColl)), 1000)
    assert.isAtMost(th.getDifference(bob_Coll_1, B_coll.add(th.applyLiquidationFee(D_coll).mul(B_coll).div(totalColl_1)).sub(withdrawnColl)), 1000)
    assert.isAtMost(th.getDifference(carol_Coll_1, C_coll.add(th.applyLiquidationFee(D_coll).mul(C_coll).div(totalColl_1)).sub(withdrawnColl)), 1000)

    //Expect 1993.5 ETH in system now
    const entireSystemColl_2 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_2, totalColl.add(th.applyLiquidationFee(D_coll)).sub(withdrawnColl.mul(toBN(3))))

    // E opens with another 1993.5 ETH
    const { collateral: E_coll } = await openTrove({ collateral: collaterals[0], value: entireSystemColl_2, ICR: toBN(dec(200, 16)), extraParams: { from: erin} })

    // Price drops to 100 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(100, 18))

    // Liquidate Erin
    const txE = await troveManager.liquidate(erin, collaterals[0].address)
    assert.isTrue(txE.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, erin))

    /* Expected ETH rewards: 
     Carol = 1990.51/1993.5 * 1993.5*0.995 = 1980.55745 ETH
     Alice = 1.495/1993.5 * 1993.5*0.995 = 1.487525 ETH
     Bob = 1.495/1993.5 * 1993.5*0.995 = 1.487525 ETH

    therefore, expected total collateral:

    Carol = 1990.51 + 1980.55745 = 3971.06745
    Alice = 1.495 + 1.487525 = 2.982525 ETH
    Bob = 1.495 + 1.487525 = 2.982525 ETH

    total = 3977.0325 ETH
    */

    const alice_Coll_2 = ((await troveManager.Troves(alice, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(alice, collaterals[0].address)))
      .toString()

    const bob_Coll_2 = ((await troveManager.Troves(bob, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(bob, collaterals[0].address)))
      .toString()

    const carol_Coll_2 = ((await troveManager.Troves(carol, collaterals[0].address))[1]
      .add(await troveManager.getPendingCollateralReward(carol, collaterals[0].address)))
      .toString()

    const totalCollAfterL1 = A_coll.add(B_coll).add(C_coll).add(th.applyLiquidationFee(D_coll)).sub(withdrawnColl.mul(toBN(3)))
    const A_collAfterL1 = A_coll.add(A_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).sub(withdrawnColl)
    const expected_A_coll = A_collAfterL1.add(A_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const B_collAfterL1 = B_coll.add(B_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).sub(withdrawnColl)
    const expected_B_coll = B_collAfterL1.add(B_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))
    const C_collAfterL1 = C_coll.add(C_coll.mul(th.applyLiquidationFee(D_coll)).div(A_coll.add(B_coll).add(C_coll))).sub(withdrawnColl)
    const expected_C_coll = C_collAfterL1.add(C_collAfterL1.mul(th.applyLiquidationFee(E_coll)).div(totalCollAfterL1))

    assert.isAtMost(th.getDifference(alice_Coll_2, expected_A_coll), 1000)
    assert.isAtMost(th.getDifference(bob_Coll_2, expected_B_coll), 1000)
    assert.isAtMost(th.getDifference(carol_Coll_2, expected_C_coll), 1000)

    //Expect 3977.0325 ETH in system now
    const entireSystemColl_3 = (await activePool.getCollateral(collaterals[0].address)).add(await defaultPool.getCollateral(collaterals[0].address))
    th.assertIsApproximatelyEqual(entireSystemColl_3, totalCollAfterL1.add(th.applyLiquidationFee(E_coll)))

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(2)))
  })

  // For calculations of correct values used in test, see scenario 1:
  // https://docs.google.com/spreadsheets/d/1F5p3nZy749K5jwO-bwJeTsRoY7ewMfWIQ3QHtokxqzo/edit?usp=sharing
  it("redistribution, all operations: A,B,C open. Liq(A). D opens. B adds, C withdraws. Liq(B). E & F open. D adds. Liq(F). Distributes correct rewards", async () => {
    // A, B, C open troves
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100, 18), extraParams: { from: alice } })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100, 18), extraParams: { from: bob } })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(100, 18), extraParams: { from: carol } })

    // Price drops to 1 $/E
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // Liquidate A
    const txA = await troveManager.liquidate(alice, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, alice))

    // Check rewards for B and C
    const B_pendingRewardsAfterL1 = th.applyLiquidationFee(A_coll).mul(B_coll).div(B_coll.add(C_coll))
    const C_pendingRewardsAfterL1 = th.applyLiquidationFee(A_coll).mul(C_coll).div(B_coll.add(C_coll))
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(bob, collaterals[0].address), B_pendingRewardsAfterL1), 1000000)
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(carol, collaterals[0].address), C_pendingRewardsAfterL1), 1000000)

    const totalStakesSnapshotAfterL1 = B_coll.add(C_coll)
    const totalCollateralSnapshotAfterL1 = totalStakesSnapshotAfterL1.add(th.applyLiquidationFee(A_coll))
    th.assertIsApproximatelyEqual(await troveManager.totalStakesSnapshot(collaterals[0].address), totalStakesSnapshotAfterL1)
    th.assertIsApproximatelyEqual(await troveManager.totalCollateralSnapshot(collaterals[0].address), totalCollateralSnapshotAfterL1)

    // Price rises to 1000
    await priceFeed.setPrice(collaterals[0].address, dec(1000, 18))

    // D opens trove
    const { collateral: D_coll, totalDebt: D_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: dennis } })

    //Bob adds 1 ETH to his trove
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    const B_addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], bob, B_addedColl)
    await borrowerOperations.addColl(collaterals[0].address, B_addedColl, bob, bob, { from: bob })

    //Carol  withdraws 1 ETH from her trove
    const C_withdrawnColl = toBN(dec(1, collDecimals))
    await borrowerOperations.withdrawColl(collaterals[0].address, C_withdrawnColl, carol, carol, { from: carol })

    const B_collAfterL1 = B_coll.add(B_pendingRewardsAfterL1).add(B_addedColl)
    const C_collAfterL1 = C_coll.add(C_pendingRewardsAfterL1).sub(C_withdrawnColl)

    // Price drops
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // Liquidate B
    const txB = await troveManager.liquidate(bob, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, bob))

    // Check rewards for C and D
    const C_pendingRewardsAfterL2 = C_collAfterL1.mul(th.applyLiquidationFee(B_collAfterL1)).div(C_collAfterL1.add(D_coll))
    const D_pendingRewardsAfterL2 = D_coll.mul(th.applyLiquidationFee(B_collAfterL1)).div(C_collAfterL1.add(D_coll))
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(carol, collaterals[0].address), C_pendingRewardsAfterL2), 1000000)
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(dennis, collaterals[0].address), D_pendingRewardsAfterL2), 1000000)

    const totalStakesSnapshotAfterL2 = totalStakesSnapshotAfterL1.add(D_coll.mul(totalStakesSnapshotAfterL1).div(totalCollateralSnapshotAfterL1)).sub(B_coll).sub(C_withdrawnColl.mul(totalStakesSnapshotAfterL1).div(totalCollateralSnapshotAfterL1))
    const defaultedAmountAfterL2 = th.applyLiquidationFee(B_coll.add(B_addedColl).add(B_pendingRewardsAfterL1)).add(C_pendingRewardsAfterL1)
    const totalCollateralSnapshotAfterL2 = C_coll.sub(C_withdrawnColl).add(D_coll).add(defaultedAmountAfterL2)
    th.assertIsApproximatelyEqual(await troveManager.totalStakesSnapshot(collaterals[0].address), totalStakesSnapshotAfterL2)
    th.assertIsApproximatelyEqual(await troveManager.totalCollateralSnapshot(collaterals[0].address), totalCollateralSnapshotAfterL2)

    // Price rises to 1000
    await priceFeed.setPrice(collaterals[0].address, dec(1000, 18))

    // E and F open troves
    const { collateral: E_coll, totalDebt: E_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: erin } })
    const { collateral: F_coll, totalDebt: F_totalDebt } = await openTrove({ collateral: collaterals[0], ICR: toBN(dec(200, 16)), extraLUSDAmount: dec(110, 18), extraParams: { from: freddy } })

    // D tops up
    const D_addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], dennis, D_addedColl)
    await borrowerOperations.addColl(collaterals[0].address, D_addedColl, dennis, dennis, { from: dennis })

    // Price drops to 1
    await priceFeed.setPrice(collaterals[0].address, dec(1, 18))

    // Liquidate F
    const txF = await troveManager.liquidate(freddy, collaterals[0].address)
    assert.isTrue(txF.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, freddy))

    // Grab remaining troves' collateral
    const carol_rawColl = (await troveManager.Troves(carol, collaterals[0].address))[1].toString()
    const carol_pendingETHReward = (await troveManager.getPendingCollateralReward(carol, collaterals[0].address)).toString()

    const dennis_rawColl = (await troveManager.Troves(dennis, collaterals[0].address))[1].toString()
    const dennis_pendingETHReward = (await troveManager.getPendingCollateralReward(dennis, collaterals[0].address)).toString()

    const erin_rawColl = (await troveManager.Troves(erin, collaterals[0].address))[1].toString()
    const erin_pendingETHReward = (await troveManager.getPendingCollateralReward(erin, collaterals[0].address)).toString()

    // Check raw collateral of C, D, E
    const C_collAfterL2 = C_collAfterL1.add(C_pendingRewardsAfterL2)
    const D_collAfterL2 = D_coll.add(D_pendingRewardsAfterL2).add(D_addedColl)
    const totalCollForL3 = C_collAfterL2.add(D_collAfterL2).add(E_coll)
    const C_collAfterL3 = C_collAfterL2.add(C_collAfterL2.mul(th.applyLiquidationFee(F_coll)).div(totalCollForL3))
    const D_collAfterL3 = D_collAfterL2.add(D_collAfterL2.mul(th.applyLiquidationFee(F_coll)).div(totalCollForL3))
    const E_collAfterL3 = E_coll.add(E_coll.mul(th.applyLiquidationFee(F_coll)).div(totalCollForL3))
    assert.isAtMost(th.getDifference(carol_rawColl, C_collAfterL1), 1000)
    assert.isAtMost(th.getDifference(dennis_rawColl, D_collAfterL2), 1000000)
    assert.isAtMost(th.getDifference(erin_rawColl, E_coll), 1000)

    // Check pending ETH rewards of C, D, E
    assert.isAtMost(th.getDifference(carol_pendingETHReward, C_collAfterL3.sub(C_collAfterL1)), 1000000)
    assert.isAtMost(th.getDifference(dennis_pendingETHReward, D_collAfterL3.sub(D_collAfterL2)), 1000000)
    assert.isAtMost(th.getDifference(erin_pendingETHReward, E_collAfterL3.sub(E_coll)), 1000000)

    // Check systemic collateral
    const activeColl = (await activePool.getCollateral(collaterals[0].address)).toString()
    const defaultColl = (await defaultPool.getCollateral(collaterals[0].address)).toString()

    assert.isAtMost(th.getDifference(activeColl, C_collAfterL1.add(D_collAfterL2.add(E_coll))), 1000000)
    assert.isAtMost(th.getDifference(defaultColl, C_collAfterL3.sub(C_collAfterL1).add(D_collAfterL3.sub(D_collAfterL2)).add(E_collAfterL3.sub(E_coll))), 1000000)

    // Check system snapshots
    const totalStakesSnapshotAfterL3 = totalStakesSnapshotAfterL2.add(D_addedColl.add(E_coll).mul(totalStakesSnapshotAfterL2).div(totalCollateralSnapshotAfterL2))
    const totalCollateralSnapshotAfterL3 = C_coll.sub(C_withdrawnColl).add(D_coll).add(D_addedColl).add(E_coll).add(defaultedAmountAfterL2).add(th.applyLiquidationFee(F_coll))
    const totalStakesSnapshot = (await troveManager.totalStakesSnapshot(collaterals[0].address)).toString()
    const totalCollateralSnapshot = (await troveManager.totalCollateralSnapshot(collaterals[0].address)).toString()
    th.assertIsApproximatelyEqual(totalStakesSnapshot, totalStakesSnapshotAfterL3)
    th.assertIsApproximatelyEqual(totalCollateralSnapshot, totalCollateralSnapshotAfterL3)

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(3)))
  })

  // For calculations of correct values used in test, see scenario 2:
  // https://docs.google.com/spreadsheets/d/1F5p3nZy749K5jwO-bwJeTsRoY7ewMfWIQ3QHtokxqzo/edit?usp=sharing
  it("redistribution, all operations: A,B,C open. Liq(A). D opens. B adds, C withdraws. Liq(B). E & F open. D adds. Liq(F). Varying coll. Distributes correct rewards", async () => {
    const collDecimals = await contracts.collateralConfig.getCollateralDecimals(collaterals[0].address)
    /* A, B, C open troves.
    A: 450 ETH
    B: 8901 ETH
    C: 23.902 ETH
    */
    const { collateral: A_coll } = await openTrove({ collateral: collaterals[0], value: toBN(dec(450, collDecimals)), ICR: toBN(dec(90000, 16)), extraParams: { from: alice} })
    const { collateral: B_coll } = await openTrove({ collateral: collaterals[0], value: toBN(dec(8901, collDecimals)), ICR: toBN(dec(1800000, 16)), extraParams: { from: bob} })
    const { collateral: C_coll } = await openTrove({ collateral: collaterals[0], value: toBN(dec(23902, collDecimals.sub(toBN(3)))), ICR: toBN(dec(4600, 16)), extraParams: { from: carol} })

    // Price drops 
    await priceFeed.setPrice(collaterals[0].address, '1')

    // Liquidate A
    const txA = await troveManager.liquidate(alice, collaterals[0].address)
    assert.isTrue(txA.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, alice))

    // Check rewards for B and C
    const B_pendingRewardsAfterL1 = th.applyLiquidationFee(A_coll).mul(B_coll).div(B_coll.add(C_coll))
    const C_pendingRewardsAfterL1 = th.applyLiquidationFee(A_coll).mul(C_coll).div(B_coll.add(C_coll))
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(bob, collaterals[0].address), B_pendingRewardsAfterL1), 1000000)
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(carol, collaterals[0].address), C_pendingRewardsAfterL1), 1000000)

    const totalStakesSnapshotAfterL1 = B_coll.add(C_coll)
    const totalCollateralSnapshotAfterL1 = totalStakesSnapshotAfterL1.add(th.applyLiquidationFee(A_coll))
    th.assertIsApproximatelyEqual(await troveManager.totalStakesSnapshot(collaterals[0].address), totalStakesSnapshotAfterL1)
    th.assertIsApproximatelyEqual(await troveManager.totalCollateralSnapshot(collaterals[0].address), totalCollateralSnapshotAfterL1)

    // Price rises 
    await priceFeed.setPrice(collaterals[0].address, dec(1, 27))

    // D opens trove: 0.035 ETH
    const { collateral: D_coll, totalDebt: D_totalDebt } = await openTrove({ collateral: collaterals[0], value: toBN(dec(35, collDecimals.sub(toBN(3)))), extraLUSDAmount: dec(100, 18), extraParams: { from: dennis} })

    // Bob adds 11.33909 ETH to his trove
    const B_addedColl = toBN(dec(1133909, collDecimals.sub(toBN(5))))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], bob, B_addedColl)
    await borrowerOperations.addColl(collaterals[0].address, B_addedColl, bob, bob, { from: bob })

    // Carol withdraws 15 ETH from her trove
    const C_withdrawnColl = toBN(dec(15, collDecimals))
    await borrowerOperations.withdrawColl(collaterals[0].address, C_withdrawnColl, carol, carol, { from: carol })

    const B_collAfterL1 = B_coll.add(B_pendingRewardsAfterL1).add(B_addedColl)
    const C_collAfterL1 = C_coll.add(C_pendingRewardsAfterL1).sub(C_withdrawnColl)

    // Price drops
    await priceFeed.setPrice(collaterals[0].address, '1')

    // Liquidate B
    const txB = await troveManager.liquidate(bob, collaterals[0].address)
    assert.isTrue(txB.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, bob))

    // Check rewards for C and D
    const C_pendingRewardsAfterL2 = C_collAfterL1.mul(th.applyLiquidationFee(B_collAfterL1)).div(C_collAfterL1.add(D_coll))
    const D_pendingRewardsAfterL2 = D_coll.mul(th.applyLiquidationFee(B_collAfterL1)).div(C_collAfterL1.add(D_coll))
    const C_collAfterL2 = C_collAfterL1.add(C_pendingRewardsAfterL2)
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(carol, collaterals[0].address), C_pendingRewardsAfterL2), 10000000)
    assert.isAtMost(th.getDifference(await troveManager.getPendingCollateralReward(dennis, collaterals[0].address), D_pendingRewardsAfterL2), 10000000)

    const totalStakesSnapshotAfterL2 = totalStakesSnapshotAfterL1.add(D_coll.mul(totalStakesSnapshotAfterL1).div(totalCollateralSnapshotAfterL1)).sub(B_coll).sub(C_withdrawnColl.mul(totalStakesSnapshotAfterL1).div(totalCollateralSnapshotAfterL1))
    const defaultedAmountAfterL2 = th.applyLiquidationFee(B_coll.add(B_addedColl).add(B_pendingRewardsAfterL1)).add(C_pendingRewardsAfterL1)
    const totalCollateralSnapshotAfterL2 = C_coll.sub(C_withdrawnColl).add(D_coll).add(defaultedAmountAfterL2)
    th.assertIsApproximatelyEqual(await troveManager.totalStakesSnapshot(collaterals[0].address), totalStakesSnapshotAfterL2)
    th.assertIsApproximatelyEqual(await troveManager.totalCollateralSnapshot(collaterals[0].address), totalCollateralSnapshotAfterL2)

    // Price rises 
    await priceFeed.setPrice(collaterals[0].address, dec(1, 27))

    /* E and F open troves., collaterals[0].address
    E: 10000 ETH
    F: 0.0007 ETH
    */
    const { collateral: E_coll, totalDebt: E_totalDebt } = await openTrove({ collateral: collaterals[0], value: toBN(dec(10000, collDecimals)), extraLUSDAmount: dec(100, 18), extraParams: { from: erin} })
    const { collateral: F_coll, totalDebt: F_totalDebt } = await openTrove({ collateral: collaterals[0], value: toBN(dec(7, collDecimals.sub(toBN(4)))), extraLUSDAmount: dec(100, 18), extraParams: { from: freddy} })

    // D tops up
    const D_addedColl = toBN(dec(1, collDecimals))
    await mintCollateralAndApproveBorrowerOps(collaterals[0], dennis, D_addedColl)
    await borrowerOperations.addColl(collaterals[0].address, D_addedColl, dennis, dennis, { from: dennis })

    const D_collAfterL2 = D_coll.add(D_pendingRewardsAfterL2).add(D_addedColl)

    // Price drops 
    await priceFeed.setPrice(collaterals[0].address, '1')

    // Liquidate F
    const txF = await troveManager.liquidate(freddy, collaterals[0].address)
    assert.isTrue(txF.receipt.status)
    assert.isFalse(await sortedTroves.contains(collaterals[0].address, freddy))

    // Grab remaining troves' collateral
    const carol_rawColl = (await troveManager.Troves(carol, collaterals[0].address))[1].toString()
    const carol_pendingETHReward = (await troveManager.getPendingCollateralReward(carol, collaterals[0].address)).toString()
    const carol_Stake = (await troveManager.Troves(carol, collaterals[0].address))[2].toString()

    const dennis_rawColl = (await troveManager.Troves(dennis, collaterals[0].address))[1].toString()
    const dennis_pendingETHReward = (await troveManager.getPendingCollateralReward(dennis, collaterals[0].address)).toString()
    const dennis_Stake = (await troveManager.Troves(dennis, collaterals[0].address))[2].toString()

    const erin_rawColl = (await troveManager.Troves(erin, collaterals[0].address))[1].toString()
    const erin_pendingETHReward = (await troveManager.getPendingCollateralReward(erin, collaterals[0].address)).toString()
    const erin_Stake = (await troveManager.Troves(erin, collaterals[0].address))[2].toString()

    // Check raw collateral of C, D, E
    const totalCollForL3 = C_collAfterL2.add(D_collAfterL2).add(E_coll)
    const C_collAfterL3 = C_collAfterL2.add(C_collAfterL2.mul(th.applyLiquidationFee(F_coll)).div(totalCollForL3))
    const D_collAfterL3 = D_collAfterL2.add(D_collAfterL2.mul(th.applyLiquidationFee(F_coll)).div(totalCollForL3))
    const E_collAfterL3 = E_coll.add(E_coll.mul(th.applyLiquidationFee(F_coll)).div(totalCollForL3))
    assert.isAtMost(th.getDifference(carol_rawColl, C_collAfterL1), 1000)
    assert.isAtMost(th.getDifference(dennis_rawColl, D_collAfterL2), 1000000)
    assert.isAtMost(th.getDifference(erin_rawColl, E_coll), 1000)

    // Check pending ETH rewards of C, D, E
    assert.isAtMost(th.getDifference(carol_pendingETHReward, C_collAfterL3.sub(C_collAfterL1)), 1000000)
    assert.isAtMost(th.getDifference(dennis_pendingETHReward, D_collAfterL3.sub(D_collAfterL2)), 1000000)
    assert.isAtMost(th.getDifference(erin_pendingETHReward, E_collAfterL3.sub(E_coll)), 1000000)

    // Check systemic collateral
    const activeColl = (await activePool.getCollateral(collaterals[0].address)).toString()
    const defaultColl = (await defaultPool.getCollateral(collaterals[0].address)).toString()

    assert.isAtMost(th.getDifference(activeColl, C_collAfterL1.add(D_collAfterL2.add(E_coll))), 1000000)
    assert.isAtMost(th.getDifference(defaultColl, C_collAfterL3.sub(C_collAfterL1).add(D_collAfterL3.sub(D_collAfterL2)).add(E_collAfterL3.sub(E_coll))), 1000000)

    // Check system snapshots
    const totalStakesSnapshotAfterL3 = totalStakesSnapshotAfterL2.add(D_addedColl.add(E_coll).mul(totalStakesSnapshotAfterL2).div(totalCollateralSnapshotAfterL2))
    const totalCollateralSnapshotAfterL3 = C_coll.sub(C_withdrawnColl).add(D_coll).add(D_addedColl).add(E_coll).add(defaultedAmountAfterL2).add(th.applyLiquidationFee(F_coll))
    const totalStakesSnapshot = (await troveManager.totalStakesSnapshot(collaterals[0].address)).toString()
    const totalCollateralSnapshot = (await troveManager.totalCollateralSnapshot(collaterals[0].address)).toString()
    th.assertIsApproximatelyEqual(totalStakesSnapshot, totalStakesSnapshotAfterL3)
    th.assertIsApproximatelyEqual(totalCollateralSnapshot, totalCollateralSnapshotAfterL3)

    // check LUSD gas compensation
    assert.equal((await lusdToken.balanceOf(owner)).toString(), liquidationReserve.mul(toBN(3)))
  })
})