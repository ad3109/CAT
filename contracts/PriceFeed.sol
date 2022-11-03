//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error PriceFeed_NotWhitelisted();

contract PriceFeed is AggregatorV3Interface {
    mapping(address => bool) public s_addressesAllowedToModifyPrice;

    uint8 public immutable i_decimals;
    string public s_symbol;
    int256 public s_price;
    uint256 public s_updatedAt;

    constructor(
        string memory symbol,
        uint8 priceDecimals,
        int256 price,
        address[] memory whiteListedAddresses
    ) {
        s_addressesAllowedToModifyPrice[msg.sender] = true;
        for (uint256 i = 0; i < whiteListedAddresses.length; i++) {
            s_addressesAllowedToModifyPrice[whiteListedAddresses[i]] = true;
        }
        s_symbol = symbol;
        i_decimals = priceDecimals;
        s_price = price;
        s_updatedAt = block.timestamp;
    }

    function updatePrice(int256 newPrice) public onlyWhitelisted {
        s_price = newPrice;
        s_updatedAt = block.timestamp;
    }

    function decimals() external view returns (uint8) {
        return i_decimals;
    }

    function description() external view returns (string memory) {
        return s_symbol;
    }

    function version() external view returns (uint256) {
        return 1;
    }

    function getRoundData(
        uint80 /*_roundId*/
    )
        external
        view
        returns (
            uint80, /*roundId*/
            int256 answer,
            uint256, /*startedAt*/
            uint256 updatedAt,
            uint80 /*answeredInRound*/
        )
    {
        updatedAt = s_updatedAt;
        answer = s_price;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80, /*roundId*/
            int256 answer,
            uint256, /*startedAt*/
            uint256 updatedAt,
            uint80 /*answeredInRound*/
        )
    {
        updatedAt = s_updatedAt;
        answer = s_price;
    }

    modifier onlyWhitelisted() {
        if (!s_addressesAllowedToModifyPrice[msg.sender]) {
            revert PriceFeed_NotWhitelisted();
        }
        _;
    }

    function addUserToWhitelist(address user) public onlyWhitelisted {
        s_addressesAllowedToModifyPrice[user] = true;
    }

    function removeUserFromWhitelist(address user) public onlyWhitelisted {
        s_addressesAllowedToModifyPrice[user] = false;
    }
}
