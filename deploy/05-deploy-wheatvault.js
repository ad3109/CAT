const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed addresses correctly depending on network
    let ETH_USD_PriceFeedaddress, BTC_USD_PriceFeedAddress, WHEAT_USD_PriceFeedAddress, WBTC

    if (developmentChains.includes(network.name)) {
        const BTC_USDAggregator = await deployments.get("MockV3AggregatorBTC")
        BTC_USD_PriceFeedAddress = BTC_USDAggregator.address

        const ETH_USDAggregator = await deployments.get("MockV3AggregatorETH")
        ETH_USD_PriceFeedaddress = ETH_USDAggregator.address

        const WHEAT_USDAggregator = await deployments.get("MockV3AggregatorWHEAT")
        WHEAT_USD_PriceFeedAddress = WHEAT_USDAggregator.address
        WBTC = (await deployments.get("MockWBTC")).address
    } else {
        BTC_USD_PriceFeedAddress = networkConfig[chainId]["btcUsdPriceFeed"]
        ETH_USD_PriceFeedaddress = networkConfig[chainId]["ethUsdPriceFeed"]
        WHEAT_USD_PriceFeedAddress = networkConfig[chainId]["wheatUsdPriceFeed"]
        WBTC = networkConfig[chainId]["wbtc"]
    }

    const wheatargs = [
        "wheat",
        "WHEAT",
        WHEAT_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
        [WBTC],
        [BTC_USD_PriceFeedAddress],
        15000000000,
    ]
    const wheatVault = await deploy("wheatVault", {
        contract: "Vault",
        from: deployer,
        args: wheatargs,
        log: true,
    })
    console.log("Deployed wheatVault")

    /*if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(wheatVault.address, args)
    }*/

    log("-------------------------------")
}

module.exports.tags = ["all", "wheat"]
