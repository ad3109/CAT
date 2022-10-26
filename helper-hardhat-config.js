const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        goldUsdPriceFeed: "0x7b219F57a8e9C7303204Af681e9fA69d17ef626f",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        goldUsdPriceFeed: "0x0C466540B2ee1a31b441671eac0ca886e051E410",
        silverUsdPriceFeed: "0x461c7B8D370a240DdB46B402748381C3210136b3",
    },
}

const developmentChains = ["hardhat", "localhost"]
//input for mocks:
const DECIMALS = 8
const INITIAL_ANSWER = 130000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
