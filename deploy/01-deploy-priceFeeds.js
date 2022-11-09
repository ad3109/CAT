const { networkConfig, developmentChains, DECIMALS, initial_answer_prices_mocks } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const {} = require("../helper-hardhat-config")

//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let newCommodities = networkConfig[chainId]["newCommodities"]
    let contractAddress_LINK, oracleAddress

    if (developmentChains.includes(network.name)) {
        contractAddress_LINK = (await deployments.get("MockLINK")).address
        oracleAddress = (await deployments.get("MockOracle")).address
    } else {
        contractAddress_LINK = networkConfig[chainId]["LINK"]
        oracleAddress = networkConfig[chainId]["oracleContract"]
    }

    //deploy the price feeds
    const apiURLs = JSON.parse(process.env.COMMODITIES_API_URLS)
    for (let i = 0; i < newCommodities.length; i++) {
        let commodityName = newCommodities[i]
        const args = [
            commodityName + "_priceFeed",
            DECIMALS,
            initial_answer_prices_mocks[commodityName],
            [process.env.ADDRESS2],
            contractAddress_LINK,
            oracleAddress,
            apiURLs[commodityName],
            "data,rates," + commodityName,
        ]
        await deploy(commodityName + "_priceFeed", {
            contract: "PriceFeed",
            from: deployer,
            args: args,
            log: true,
        })
        console.log(`Deployed ${commodityName} priceFeed`)
    }
    log("-------------------------------")
}

module.exports.tags = ["all", "priceFeeds"]
