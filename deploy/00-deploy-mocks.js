const { network } = require("hardhat")
const { networkConfig, developmentChains, DECIMALS, initial_answer_prices_mocks } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        let existingCommodities = networkConfig[chainId]["existingCommodities"]

        log("Local network detected! Deploying mocks...")

        //deploy BTC, ETH, LINK, and XAU price feeds
        await deploy("MockV3AggregatorWBTC", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["WBTC"]],
        })
        await deploy("MockV3AggregatorWETH", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["WETH"]],
        })
        await deploy("MockV3AggregatorLINK", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, initial_answer_prices_mocks["LINK"]],
        })

        for (let i = 0; i < existingCommodities.length; i++) {
            let commodityName = existingCommodities[i]
            await deploy("MockV3Aggregator" + commodityName, {
                contract: "MockV3Aggregator",
                from: deployer,
                log: true,
                args: [DECIMALS, initial_answer_prices_mocks[commodityName]],
            })
        }

        //deploy mock BTC and LINK contracts
        await deploy("MockWBTC", {
            contract: "MockToken",
            from: deployer,
            log: true,
            args: ["WBTC", "WBTC"],
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
            args: ["LINK", "LINK"],
        })

        await deploy("MockOracle", {
            contract: "MockOracle",
            from: deployer,
            log: true,
            args: [],
        })

        await deploy("randomToken", {
            contract: "MockToken",
            from: deployer,
            log: true,
            args: ["RAND", "RAND"],
        })

        log("Mocks deployed!")
        log("-----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
