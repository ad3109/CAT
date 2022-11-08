const { networkConfig, developmentChains, commodities } = require("../helper-hardhat-config")
const { network } = require("hardhat")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed addresses correctly depending on network
    let ETH_USD_PriceFeedaddress, BTC_USD_PriceFeedAddress, LINK_USD_PriceFeedAddress
    let contractAddress_BTC, contractAddress_LINK
    let commodityPriceFeedAddresses = new Array(commodities.length)

    if (developmentChains.includes(network.name)) {
        const BTC_USDAggregator = await deployments.get("MockV3AggregatorBTC")
        BTC_USD_PriceFeedAddress = BTC_USDAggregator.address

        const ETH_USDAggregator = await deployments.get("MockV3AggregatorETH")
        ETH_USD_PriceFeedaddress = ETH_USDAggregator.address

        const LINK_USDAggregator = await deployments.get("MockV3AggregatorLINK")
        LINK_USD_PriceFeedAddress = LINK_USDAggregator.address

        for (let i = 0; i < commodities.length; i++) {
            let commodityName = commodities[i]
            const COMMODITY_USD_AGGREGATOR = await deployments.get(
                "MockV3Aggregator_" + commodityName
            )
            commodityPriceFeedAddresses[i] = COMMODITY_USD_AGGREGATOR.address
        }

        contractAddress_BTC = (await deployments.get("MockBTC")).address
        contractAddress_WETH = (await deployments.get("MockWETH")).address
        contractAddress_LINK = (await deployments.get("MockLINK")).address
    } else {
        BTC_USD_PriceFeedAddress = networkConfig[chainId][pricefeeds]["BTC"]
        ETH_USD_PriceFeedaddress = networkConfig[chainId][pricefeeds]["ETH"]
        LINK_USD_PriceFeedAddress = networkConfig[chainId][pricefeeds]["LINK"]
        for (let i = 0; i < commodities.length; i++) {
            let commodityName = commodities[i]
            commodityPriceFeedAddresses[i] = await deployments.get(commodityName + "_priceFeed")
                .address
        }
        contractAddress_BTC = networkConfig[chainId]["BTC"]
        contractAddress_LINK = networkConfig[chainId]["LINK"]
    }

    //deploy vaults
    for (let i = 0; i < commodities.length; i++) {
        let commodityName = commodities[i]
        const args = [
            commodityName,
            commodityName,
            commodityPriceFeedAddresses[i],
            [contractAddress_WETH, contractAddress_BTC, contractAddress_LINK],
            [ETH_USD_PriceFeedaddress, BTC_USD_PriceFeedAddress, LINK_USD_PriceFeedAddress],
            6666666667,
        ]
        const vault = await deploy(commodityName + "_vault", {
            contract: "Vault",
            from: deployer,
            args: args,
            log: true,
        })
        console.log(`Deployed ${commodityName} vault`)
    }

    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     await verify(vault.address, args)
    // }

    log("-------------------------------")
}

module.exports.tags = ["all", "vaults"]
