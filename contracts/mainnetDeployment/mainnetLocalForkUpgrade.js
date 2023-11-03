const { mainnetDeploy } = require('./mainnetDeployment.js')
const configParams = require("./deploymentParams.localForkUpgrade.js")

const ETH_WHALE = "0x4200000000000000000000000000000000000006"
//const TEST_DEPLOYER_PRIVATEKEY = '0xbbfbee4961061d506ffbb11dfea64eba16355cbf1d9c29613126ba7fec0aed5d'

async function upgrade(isTest) {
  configParams.isTest = isTest

  //const deployerWallet = new ethers.Wallet(TEST_DEPLOYER_PRIVATEKEY, ethers.provider)
  const deployerWallet = (await ethers.getSigners())[0]

  // Impersonate the whale (artificially assume control of its pk)
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [ETH_WHALE]
  })
  // console.log(`whale address from import: ${ETH_WHALE}`)

  // Get the ETH whale signer 
  const whale = await ethers.provider.getSigner(ETH_WHALE)
  // console.log(`whale addr : ${await whale.getAddress()}`)
  // console.log(`whale ETH balance: ${ await ethers.provider.getBalance(whale.getAddress())}`)

  // Send ETH to the deployer's address
  await whale.sendTransaction({
    to:  deployerWallet.address,
    value: ethers.utils.parseEther("20.0")
  })
  // Send ETH to the governance address
  await whale.sendTransaction({
    to:  configParams.liquityAddrs.GOVERNANCE,
    value: ethers.utils.parseEther("20.0")
  })

  // Stop impersonating whale
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [ETH_WHALE]
  })

  const { liquityCore, LQTYContracts } = await mainnetDeploy(configParams)

  const ExchangeType = {
    VeloSolid: 0,
    Bal:       1,
    UniV3:     2,
  }
  const weth = configParams.collaterals[1].address
  await liquityCore.leverager.setExchangeSettings([
    configParams.externalAddrs.VELO_ROUTER,
    configParams.externalAddrs.BALANCER_VAULT,
    configParams.externalAddrs.UNI_V3_ROUTER
  ])
  await liquityCore.leverager.setExchange(liquityCore.lusdToken.address, weth, ExchangeType.UniV3)
  await liquityCore.leverager.setExchange(weth, liquityCore.lusdToken.address, ExchangeType.UniV3)

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [configParams.liquityAddrs.GOVERNANCE]
  })
  const governance = await ethers.provider.getSigner(configParams.liquityAddrs.GOVERNANCE)
  await liquityCore.lusdToken.connect(governance).upgradeProtocol(
    liquityCore.troveManager.address,
    liquityCore.stabilityPool.address,
    liquityCore.borrowerOperations.address
  )
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [configParams.liquityAddrs.GOVERNANCE]
  })

  return { liquityCore, LQTYContracts }
}

module.exports = {
  upgrade
}
