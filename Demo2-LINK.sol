// SPDX-License-Identifier: MIT
// CAT (Commodity Asset Token) LINK Contract Demo ver2
// GOAL: to aggregate prices over Goerli Testnet
// LINK proxies for testing using BTC, ETH, & DAI in USD
// Seperate OpenZepplin contract will average these prices via SafeMath


pragma solidity ^0.6.7;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed1;
    AggregatorV3Interface internal priceFeed2;
    AggregatorV3Interface internal priceFeed3;

    int BTC;
    int ETH;
    int DAI;

// DONE Goal 1: output each price separately in one contract

    /**
     * DEMO 1 Network: Goerli Testnet via LINK Proxy IDs
     * Aggregator1: BTC/USD
     * Aggregator2: ETH/USD
     * Aggregator3: DAI/USD
     */
    constructor() public 
    {
        // price feeds
        priceFeed1 = AggregatorV3Interface(0xA39434A63A52E749F02807ae27335515BA4b07F7);
        // price feed 1 BTC - OLD WTI MainNet: 0xf3584F4dd3b467e73C2339EfD008665a70A4185c
        priceFeed2 = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        // price feed 2 ETH  - OLD 2 Gold MainNet: 0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6
        priceFeed3 = AggregatorV3Interface(0x0d79df66BE487753B02D015Fb622DED7f0E9798d);
        // price feed 3 DAI - OLD Silver MainNet: 0x379589227b15F1a12195D3f2d90bBc9F31f95235
    }
  
    /**
     * Contract functions return the latest price
     * Variable warnings in Remix are fields that populate from the feed
     * they bark and this will not complie without them
     */

// DONE Goal 2: Functions to display each in Remix

    function getLatestPrice1() public view returns (int) 
    {
        (
        uint80 roundID, 
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
        ) = priceFeed1.latestRoundData();
        return price;
        price = BTC;
    } // end function 1

    function getLatestPrice2() public view returns (int) {
        (
        uint80 roundID, 
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
        ) = priceFeed2.latestRoundData();
        return price;
        price = ETH;
    } // end function 2

        function getLatestPrice3() public view returns (int) {
        (
        uint80 roundID, 
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
        ) = priceFeed3.latestRoundData();
        return price;
        price = DAI;
    } // end function 3

    /**
     * Return the average of 3 numbers. The result is rounded toward 0
     */
    function average(int BTC, int ETH) public view returns (int) 
    {
        return (BTC & ETH & DAI) + (BTC ^ ETH ^ DAI) / 3;
    }
    // NOTE: (a + b + c) / 3 can overflow. Where's safemath when you need it,...

} // end contract Demo2 LINK
