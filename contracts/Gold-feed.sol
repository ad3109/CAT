// SPDX-License-Identifier: MIT
// CAT (Commodity Asset Token) LINK Contract Demo Gold
// GOAL: aggregate the gold price feed over the Goerli Testnet

pragma solidity ^0.8.1;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract GoldPriceFeed {
    AggregatorV3Interface internal priceFeed;

    /**
     * DEMO: Goerli Testnet via LINK Proxy IDs
     * Aggregator1: Gold XAU/USD
     * Address: 0x7b219F57a8e9C7303204Af681e9fA69d17ef626f
     */
    constructor() public {
        priceFeed = AggregatorV3Interface(0x7b219F57a8e9C7303204Af681e9fA69d17ef626f);
    }

    /**
     * Return the latest gold price
     */

    function getLatestPriceGold() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
} //end contract
