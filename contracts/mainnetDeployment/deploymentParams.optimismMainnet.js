const externalAddrs  = {
  TELLOR_MASTER:"0xD9157453E2668B2fc45b7A803D3FEF3642430cC0",
  OATH: "0x39FdE572a18448F8139b7788099F0a0740f51205",
  STAKING_TOKEN: "0xd20f6F1D8a675cDCa155Cb07b5dC9042c467153f"
}

const collaterals = [
  {
    address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", // WBTC
    MCR: "1.2", // 1.2 ether = 120%
    CCR: "1.5", // 1.5 ether = 150%
    limit: "115792089237316195423570985008687907853269984665640564039457584007913129639935", // uint256 max
    timeout: 14400, // 4 hours
    chainlinkAggregatorAddress: "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593",
    tellorQueryID: "0xa6f013ee236804827b77696d350e9f0ac3e879328f2a3021d473a0b778ad78ac",
    reaperVaultAddress: "0xef82200DC96a14af76f5fB7f27DbaDB5228f6A0C"
  },
  {
    address: "0x4200000000000000000000000000000000000006", // WETH
    MCR: "1.08", // 1.08 ether = 108%
    CCR: "1.2", // 1.2 ether = 120%
    limit: "115792089237316195423570985008687907853269984665640564039457584007913129639935", // uint256 max
    timeout: 14400, // 4 hours
    chainlinkAggregatorAddress: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
    tellorQueryID: "0x83a7f3d48786ac2667503a61e8c415438ed2922eb86a2906e4ee66d9a2ce4992",
    reaperVaultAddress: "0x1225c53F510877074d0D1Bace26C4f0581c24cF7"
  },
  {
    address: "0x4200000000000000000000000000000000000042", // OP
    MCR: "1.3", // 1.3 ether = 130%
    CCR: "1.75", // 1.75 ether = 175%
    limit: "115792089237316195423570985008687907853269984665640564039457584007913129639935", // uint256 max
    timeout: 14400, // 4 hours
    chainlinkAggregatorAddress: "0x0D276FC14719f9292D5C1eA2198673d1f4269246",
    tellorQueryID: "0xafc6a3f6c18df31f1078cf038745b48e55623330715d90efe3dc7935efd44938",
    reaperVaultAddress: "0x6938b5b43b281bF24202437b86bbd2866a79cF6C"
  }
];

const liquityAddrs = {
  DEPLOYER: "0xe00691e65Cd4400c84a174a4C56f20bA43dffD89", // Mainnet REAL deployment address
  GOVERNANCE: "0xf1a717766c1b2Ed3f63b602E6482dD699ce1C79C", // to be passed to LUSDToken as governance address
  GUARDIAN: "0xb0C9D5851deF8A2Aac4A23031CA2610f8C3483F9", // to be passed to LUSDToken as guardian address
  TREASURY: "0xf1a717766c1b2Ed3f63b602E6482dD699ce1C79C", // to be passed to ActivePool as treasury address
}

const OUTPUT_FILE = './mainnetDeployment/optimismMainnetDeploymentOutput.json'

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000) // wait 90s
}

const GAS_PRICE = 1000000
const TX_CONFIRMATIONS = 3 // for mainnet

const ETHERSCAN_BASE_URL = 'https://optimistic.etherscan.io/address'

module.exports = {
  externalAddrs,
  collaterals,
  liquityAddrs,
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
  ETHERSCAN_BASE_URL,
};
