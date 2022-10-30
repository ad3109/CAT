const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed addresses correctly depending on network
    let ETH_USD_PriceFeedaddress, BTC_USD_PriceFeedAddress, GLD_USD_PriceFeedAddress, WBTC

    if (developmentChains.includes(network.name)) {
        const BTC_USDAggregator = await deployments.get("MockV3AggregatorBTC")
        BTC_USD_PriceFeedAddress = BTC_USDAggregator.address

        const ETH_USDAggregator = await deployments.get("MockV3AggregatorETH")
        ETH_USD_PriceFeedaddress = ETH_USDAggregator.address

        const GLD_USDAggregator = await deployments.get("MockV3AggregatorGLD")
        GLD_USD_PriceFeedAddress = GLD_USDAggregator.address

        WBTC = (await deployments.get("MockWBTC")).address
    } else {
        BTC_USD_PriceFeedAddress = networkConfig[chainId]["btcUsdPriceFeed"]
        ETH_USD_PriceFeedaddress = networkConfig[chainId]["ethUsdPriceFeed"]
        GLD_USD_PriceFeedAddress = networkConfig[chainId]["goldUsdPriceFeed"]
        WBTC = networkConfig[chainId]["wbtc"]
    }

    //deploy gold vault
    const goldargs = [
        "gold",
        "GLD",
        GLD_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
        [WBTC],
        [BTC_USD_PriceFeedAddress],
        15000000000,
    ]
    const goldVault = await deploy("goldVault", {
        contract: "Vault",
        from: deployer,
        args: goldargs,
        log: true,
    })
    console.log("Deployed goldVault")

    /*if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(goldVault.address, args)
    }*/

    log("-------------------------------")
}

module.exports.tags = ["all", "gold"]
