const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        //Get the mock contract
        const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock")
        console.log(`vrfcoordinatorv2mock ${vrfCoordinatorV2Mock}`)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        //Locally create subscription ID
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId

        // Now funding the subscription using the mock
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    // variables that will be passed to raffle.sol constructor args
    const entranceFee = networkConfig[chainId]["entranceFee"]
    console.log(`entranceFee: ${entranceFee}`)
    const gasLane = networkConfig[chainId]["gasLane"]
    onsole.log(`gaseLane: ${gasLane}`)
    const callbackGasLimit = networkConfig[chainId]["subscriptionId"]
    const interval = networkConfig[chainId]["interval"]
    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying Contract......")
        await verify(raffle.address, args)
    }
    log("-------------------------------------------")
}

module.exports.tags = ["all", "raffle"]
