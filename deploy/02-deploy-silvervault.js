const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed addresses correctly depending on network
    let ETH_USD_PriceFeedaddress, BTC_USD_PriceFeedAddress, SLV_USD_PriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const BTC_USDAggregator = await deployments.get("MockV3AggregatorBTC")
        BTC_USD_PriceFeedAddress = BTC_USDAggregator.address

        const ETH_USDAggregator = await deployments.get("MockV3AggregatorETH")
        ETH_USD_PriceFeedaddress = ETH_USDAggregator.address

        const SLV_USDAggregator = await deployments.get("MockV3AggregatorSLV")
        SLV_USD_PriceFeedAddress = SLV_USDAggregator.address
    } else {
        BTC_USD_PriceFeedAddress = networkConfig[chainId]["btcUsdPriceFeed"]
        ETH_USD_PriceFeedaddress = networkConfig[chainId]["ethUsdPriceFeed"]
        SLV_USD_PriceFeedAddress = networkConfig[chainId]["silverUsdPriceFeed"]
    }

    //deploy silver vault
    const silverargs = [
        "silver",
        "SLV",
        SLV_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const silverVault = await deploy("silverVault", {
        contract: "Vault",
        from: deployer,
        args: silverargs,
        log: true,
    })
    console.log("Deployed silverVault")

    /*if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(silverVault.address, args)
    }*/

    log("-------------------------------")
}

module.exports.tags = ["all", "silver"]
