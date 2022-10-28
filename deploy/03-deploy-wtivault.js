const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed addresses correctly depending on network
    let ETH_USD_PriceFeedaddress, BTC_USD_PriceFeedAddress, WTI_USD_PriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const BTC_USDAggregator = await deployments.get("MockV3AggregatorBTC")
        BTC_USD_PriceFeedAddress = BTC_USDAggregator.address

        const ETH_USDAggregator = await deployments.get("MockV3AggregatorETH")
        ETH_USD_PriceFeedaddress = ETH_USDAggregator.address

        const WTI_USDAggregator = await deployments.get("MockV3AggregatorWTI")
        WTI_USD_PriceFeedAddress = WTI_USDAggregator.address
    } else {
        BTC_USD_PriceFeedAddress = networkConfig[chainId]["btcUsdPriceFeed"]
        ETH_USD_PriceFeedaddress = networkConfig[chainId]["ethUsdPriceFeed"]
        WTI_USD_PriceFeedAddress = networkConfig[chainId]["wtiUsdPriceFeed"]
    }

    const wtiargs = [
        "wti",
        "WTI",
        WTI_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const wtiVault = await deploy("wtiVault", {
        contract: "Vault",
        from: deployer,
        args: wtiargs,
        log: true,
    })
    console.log("Deployed wtiVault")

    /*if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(oilVault.address, args)
    }*/

    log("-------------------------------")
}

module.exports.tags = ["all", "oil"]
