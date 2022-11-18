const networkConfig = {
    31337: {
        name: "hardhat",
        existingCommodities: ["XAU"],
        newCommodities: ["BRENTOIL", "COAL"],
    },
    5: {
        name: "goerli",
        existingCommodities: ["XAU", "BRENTOIL", "COAL"], //already deployed pricefeeds (chainlink data feeds or aldready deployed by us)
        newCommodities: ["ETHANOL"],
        pricefeeds: {
            XAU: "0x7b219F57a8e9C7303204Af681e9fA69d17ef626f", //only chainlink commodity pricefeed on goerli
            BRENTOIL: "0x4b027213045c5F39E25DF2EA4298D85bBd726A8A",
            COAL: "0x0c408070dd30D43468305d461a5F223DC8D82BfD",

            WETH: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
            WBTC: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
            LINK: "0x48731cF7e84dc94C5f84577882c14Be11a5B7456",
            fWBTC: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
        },
        tokenContracts: {
            WBTC: "0x8dc14D1c5A273c33E22eFE9647Ec242175A2ad4b",
            LINK: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
            WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
            fWBTC: "0x1199485d5A23D925964440B1196A45EFccA646E3", //a fake WBTC controlled by us
        },
        oracleContract: "0xcc79157eb46f5624204f47ab42b3906caa40eab7",
    },
    1: {
        name: "ethereum",
        existingCommodities: ["WTI", "XAG", "XAU"],
        newCommodities: [
            "BRENTOIL",
            "COAL",
            "COCOA",
            "COFFEE",
            "CORN",
            "COTTON",
            "CPO",
            "ETHANOL",
            "LUMBER",
            "NG",
            "RICE",
            "RUBBER",
            "SOYBEAN",
            "SUGAR",
            "WHEAT",
            "WTIOIL",
            "XAG",
            "XPD",
            "XPT",
            "XRH",
        ],
        pricefeeds: {
            WTI: "0xf3584F4dd3b467e73C2339EfD008665a70A4185c",
            XAG: "0x379589227b15F1a12195D3f2d90bBc9F31f95235",
            XAU: "0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6",

            WETH: "0xCc72039A141c6e34a779eF93AEF5eB4C82A893c7",
            WBTC: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
            LINK: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
        },
        tokenContracts: {
            WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        },
        oracleContract: "0xcc79157eb46f5624204f47ab42b3906caa40eab7", //TODO: replace
    },
}

const developmentChains = ["hardhat", "localhost"]

//input for mocks:
const DECIMALS = 8
const initial_answer_prices_mocks = {
    BRENTOIL: 9397003671,
    COAL: 35400000000,
    COCOA: 235200037632,
    COFFEE: 178000001,
    CORN: 689750025,
    COTTON: 75000000,
    CPO: 81486310300,
    ETHANOL: 561800025,
    LUMBER: 46130142358,
    NG: 617800004,
    RICE: 1653000212,
    RUBBER: 148000001,
    SOYBEAN: 1420000105,
    SUGAR: 18340000,
    WHEAT: 35100035100,
    WTIOIL: 8765002397,
    XAG: 1996732946,
    XAU: 165313848341,
    XPD: 184101034648,
    XPT: 94800208560,
    XRH: 1410039481105,

    WETH: 155700000000,
    WBTC: 2150000000000,
    LINK: 750000000,
}

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    initial_answer_prices_mocks,
}
