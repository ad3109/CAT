const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed addresses correctly depending on network
    let ETH_USD_PriceFeedaddress,
        BTC_USD_PriceFeedAddress,
        GLD_USD_PriceFeedAddress,
        SLV_USD_PriceFeedAddress,
        WTI_USD_PriceFeedAddress,
        LBS_USD_PriceFeedAddress,
        WHEAT_USD_PriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const BTC_USDAggregator = await deployments.get("MockV3AggregatorBTC")
        BTC_USD_PriceFeedAddress = BTC_USDAggregator.address

        const ETH_USDAggregator = await deployments.get("MockV3AggregatorETH")
        ETH_USD_PriceFeedaddress = ETH_USDAggregator.address

        const GLD_USDAggregator = await deployments.get("MockV3AggregatorGLD")
        GLD_USD_PriceFeedAddress = GLD_USDAggregator.address

        const SLV_USDAggregator = await deployments.get("MockV3AggregatorSLV")
        SLV_USD_PriceFeedAddress = SLV_USDAggregator.address

        const WTI_USDAggregator = await deployments.get("MockV3AggregatorWTI")
        WTI_USD_PriceFeedAddress = WTI_USDAggregator.address

        const LBS_USDAggregator = await deployments.get("MockV3AggregatorLBS")
        LBS_USD_PriceFeedAddress = LBS_USDAggregator.address

        const WHEAT_USDAggregator = await deployments.get("MockV3AggregatorWHEAT")
        WHEAT_USD_PriceFeedAddress = WHEAT_USDAggregator.address
    } else {
        BTC_USD_PriceFeedAddress = networkConfig[chainId]["btcUsdPriceFeed"]
        ETH_USD_PriceFeedaddress = networkConfig[chainId]["ethusdPriceFeed"]
        GLD_USD_PriceFeedAddress = networkConfig[chainId]["goldUsdPriceFeed"]
        SLV_USD_PriceFeedAddress = networkConfig[chainId]["silverUsdPriceFeed"]
        WTI_USD_PriceFeedAddress = networkConfig[chainId]["wtiUsdPriceFeed"]
        LBS_USD_PriceFeedAddress = networkConfig[chainId]["lumberUsdPriceFeed"]
        WHEAT_USD_PriceFeedAddress = networkConfig[chainId]["wheatUsdPriceFeed"]
    }

    //deploy gold vault
    const goldargs = [
        "gold",
        "GLD",
        GLD_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const goldVault = await deploy("Vault", {
        from: deployer,
        args: goldargs,
        log: true,
    })
    console.log("Deployed goldVault")

    //deploy silver vault
    const silverargs = [
        "silver",
        "SLV",
        SLV_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const silverVault = await deploy("Vault", {
        from: deployer,
        args: silverargs,
        log: true,
    })
    console.log("Deployed silverVault")

    const wtiargs = [
        "wti",
        "WTI",
        WTI_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const wtiVault = await deploy("Vault", {
        from: deployer,
        args: wtiargs,
        log: true,
    })
    console.log("Deployed witVault")

    const lumberargs = [
        "lumber",
        "LBS",
        LBS_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const lumberVault = await deploy("Vault", {
        from: deployer,
        args: lumberargs,
        log: true,
    })
    console.log("Deployed lumberVault")

    const wheatargs = [
        "wheat",
        "WHEAT",
        WHEAT_USD_PriceFeedAddress,
        BTC_USD_PriceFeedAddress,
        ETH_USD_PriceFeedaddress,
    ]
    const wheatVault = await deploy("Vault", {
        from: deployer,
        args: wheatargs,
        log: true,
    })
    console.log("Deployed wheatVault")

    /*if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(goldVault.address, args)
        await verify(silverVault.address, args)
        await verify(oilVault.address, args)
        await verify(lumberVault.address, args)
        await verify(wheatVault.address, args)
    }*/

    log("-------------------------------")
}

module.exports.tags = ["all"]
