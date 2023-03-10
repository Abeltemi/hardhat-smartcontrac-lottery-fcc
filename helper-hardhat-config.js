const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
        interval: "30"
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "588",
        callbackGasLimit: "500000",
        interval: "30",
    },
    31337: {
        name: "localhost",
        subscriptionId: "0",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = {
    developmentChains,
    networkConfig,
    BASE_FEE,
    GAS_PRICE_LINK,
}
