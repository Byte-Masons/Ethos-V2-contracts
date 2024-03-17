require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("hardhat-gas-reporter");
const accounts = require("./hardhatAccountsList2k.js");
const accountsList = accounts.accountsList

const fs = require('fs')
const alchemyUrl = () => {
    const SECRETS_FILE = "./secrets.js"
    let alchemyAPIKey = ""
    if (fs.existsSync(SECRETS_FILE)) {
        const { secrets } = require(SECRETS_FILE);
        alchemyAPIKey = secrets.alchemyAPIKeyOptimism
    }

    return `https://opt-mainnet.g.alchemy.com/v2/${alchemyAPIKey}`
}

module.exports = {
    paths: {
        // contracts: "./contracts",
        // artifacts: "./artifacts"
    },
    solidity: {
        compilers: [
            {
                version: "0.4.23",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100
                    }
                }
            },
            {
                version: "0.5.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100
                    }
                }
            },
            {
                version: "0.6.11",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
        ]
    },
    networks: {
        hardhat: {
            accounts: accountsList.slice(0, 2),
            forking: {
                url: alchemyUrl(),
                blockNumber: 113763000,
            }
        }
    },
    mocha: { timeout: 12000000 },
    rpc: {
        host: "localhost",
        port: 8545
    },
    gasReporter: {
        enabled: (process.env.REPORT_GAS) ? true : false
    }
};
