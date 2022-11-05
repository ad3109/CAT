const networkConfig = {
    5: {
        name: "goerli",
        pricefeeds: {
            BRENTOIL: 0.01064169415771,
            COAL: 0.0028248587570621,
            COCOA: 0.00042517006802721,
            COFFEE: 0.56179775280899,
            CORN: 0.14498006524103,
            COTTON: 1.3333333333333,
            CPO: 0.0012272020725389,
            ETHANOL: 0.017799928800285,
            LUMBER: "0x641e9CBBDE86c9E93638E51Cd907B9ac03663dfC", //TODO - currently just a placeholder contract always returning  48990000000
            NG: 0.16186468112658,
            RICE: 0.060496067755596,
            ROBUSTA: 0.0005420054200542,
            RUBBER: 0.67567567567568,
            SOYBEAN: 0.070422535211268,
            SUGAR: 5.4525627044711,
            USD: 1,
            WHEAT: "0x4bD83C005BFCE515c055fA5199Be2A0807efC142", //TODO - currently just a placeholder contract always returning  48990000000
            WTIOIL: "0x7ec01b116569cBeC7f96320c0eCd7C89740FFE56", //currently just a placeholder contract always returning  8700000000
            XAG: "0x56542f96EaC1a6259F817FD1384c714cb49D0484", //currently just a placeholder contract always returning  1900000000
            XAU: "0x7b219F57a8e9C7303204Af681e9fA69d17ef626f",
            XPD: 0.00054318305268876,
            XPT: 0.0010548523206751,
            XRH: 7.0921985815603e-5,

            ETH: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
            BTC: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
            LINK: "0x48731cF7e84dc94C5f84577882c14Be11a5B7456",
        },
        //"unit": "per barrel for Oil, per ounce for Metals. Per 10 metric tons for Crude Palm Oil, Per MMBtu for Natural gas, Per Gallon for Ethanol. Per metric ton, per lb or per bushel for Agriculture"
        tokenContracts: {
            BTC: "0x8dc14D1c5A273c33E22eFE9647Ec242175A2ad4b",
            LINK: "0xE4e0EB46c269B11067031b6F4B7b658E5dAE1B7b",
            WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        },
        oracleContract: "0xcc79157eb46f5624204f47ab42b3906caa40eab7",
        jobId: "ca98366cc7314957b8c012c72f05aeeb",
    },
}

const developmentChains = ["hardhat", "localhost"]
const commodities = [
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
    "XAU",
    "XPD",
    "XPT",
    "XRH",
]
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

    ETH: 155700000000,
    BTC: 2150000000000,
    LINK: 750000000,
}

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    commodities,
    initial_answer_prices_mocks,
}
