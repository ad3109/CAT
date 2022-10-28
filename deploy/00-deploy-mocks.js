const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER_MOCK_BTC_USD,
    INITIAL_ANSWER_MOCK_ETH_USD,
    INITIAL_ANSWER_MOCK_WTI_USD,
    INITIAL_ANSWER_MOCK_GLD_USD,
    INITIAL_ANSWER_MOCK_SLV_USD,
    INITIAL_ANSWER_MOCK_LBS_USD,
    INITIAL_ANSWER_MOCK_WHEAT_USD,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3AggregatorBTC", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_BTC_USD],
        })
        await deploy("MockV3AggregatorETH", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_ETH_USD],
        })
        await deploy("MockV3AggregatorWTI", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_WTI_USD],
        })
        await deploy("MockV3AggregatorGLD", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_GLD_USD],
        })
        await deploy("MockV3AggregatorSLV", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_SLV_USD],
        })
        await deploy("MockV3AggregatorLBS", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_LBS_USD],
        })
        await deploy("MockV3AggregatorWHEAT", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER_MOCK_WHEAT_USD],
        })
        log("Mocks deployed!")
        log("-----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
