const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    commodities,
    initial_answer_prices_mocks,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")

        //deploy BTC, ETH, LINK, and XAU price feeds
        await deploy("MockV3AggregatorBTC", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["BTC"]],
        })
        await deploy("MockV3AggregatorETH", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["ETH"]],
        })
        await deploy("MockV3AggregatorLINK", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["LINK"]],
        })
        await deploy("MockV3AggregatorXAU", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["XAU"]],
        })

        //deploy mock BTC and LINK contracts
        await deploy("MockBTC", {
            contract: "MockToken",
            from: deployer,
            log: true,
            args: ["Bitcoin", "BTC"],
        })
        await deploy("MockWETH", {
            contract: "MockToken",
            from: deployer,
            log: true,
            args: ["WETH", "WETH"],
        })
        await deploy("MockLINK", {
            contract: "MockToken",
            from: deployer,
            log: true,
            args: ["Chainlink", "LINK"],
        })

        await deploy("MockOracle", {
            contract: "MockOracle",
            from: deployer,
            log: true,
            args: [],
        })

        log("Mocks deployed!")
        log("-----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
