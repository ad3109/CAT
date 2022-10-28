const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        btcUsdPriceFeed: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
        goldUsdPriceFeed: "0x7b219F57a8e9C7303204Af681e9fA69d17ef626f",
        //TODO: deploy contracts for silver, wti, lumber, and wheat on goerli
        silverUsdPriceFeed: "0x56542f96EaC1a6259F817FD1384c714cb49D0484", //TODO - currently just a placeholder contract always returning  1900000000
        wtiUsdPriceFeed: "0x7ec01b116569cBeC7f96320c0eCd7C89740FFE56", //TODO - currently just a placeholder contract always returning  8700000000
        lumberUsdPriceFeed: "0x641e9CBBDE86c9E93638E51Cd907B9ac03663dfC", //TODO - currently just a placeholder contract always returning  48990000000
        wheatUsdPriceFeed: "0x4bD83C005BFCE515c055fA5199Be2A0807efC142", //TODO - currently just a placeholder contract always returning  48990000000
    },
}

const developmentChains = ["hardhat", "localhost"]
//input for mocks:
const DECIMALS = 8
const INITIAL_ANSWER_MOCK_BTC_USD = 2150000000000
const INITIAL_ANSWER_MOCK_ETH_USD = 155700000000
const INITIAL_ANSWER_MOCK_WTI_USD = 8700000000
const INITIAL_ANSWER_MOCK_GLD_USD = 166300000000
const INITIAL_ANSWER_MOCK_SLV_USD = 1900000000
const INITIAL_ANSWER_MOCK_LBS_USD = 48990000000 //LUMBER (USD / 1000 board feet)
const INITIAL_ANSWER_MOCK_WHEAT_USD = 85166000000 //WHEAT (USD/100 Bushel)

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER_MOCK_BTC_USD,
    INITIAL_ANSWER_MOCK_ETH_USD,
    INITIAL_ANSWER_MOCK_WTI_USD,
    INITIAL_ANSWER_MOCK_GLD_USD,
    INITIAL_ANSWER_MOCK_SLV_USD,
    INITIAL_ANSWER_MOCK_LBS_USD,
    INITIAL_ANSWER_MOCK_WHEAT_USD,
}
