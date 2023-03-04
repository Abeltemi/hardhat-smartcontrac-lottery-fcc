require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("dotenv").config()
require("hardhat-contract-sizer")

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli.g.alchemy.com"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKET_API = process.env.COINMARKET_API

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.8.4" }],
    },
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
        
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            /** seperate different player who are interracting with the contract */
            default: 1,
        },
    },
    mocha: {
        timeout:300000
    }
}

// First Dependencies used
/* 
yarn add --dev 
  @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers 
  @nomiclabs/hardhat-etherscan 
  @nomiclabs/hardhat-waffle 
  chai 
  ethereum-waffle 
  hardhat 
  hardhat-contract-sizer 
  hardhat-deploy 
  hardhat-gas-reporter 
  prettier 
  prettier-plugin-solidity 
  solhint 
  solidity-coverage 
  dotenv
*/
