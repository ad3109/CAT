//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

error PriceFeed_NotWhitelisted();

contract PriceFeed is ChainlinkClient, AggregatorV3Interface {
    using Chainlink for Chainlink.Request;

    uint8 public immutable i_decimals;
    string public s_symbol;
    uint256 public s_price;
    uint256 public s_updatedAt;

    bytes32 private immutable i_anyApi_jobId;
    uint256 private constant FEE = 10**17;

    string s_apiUrl;
    string s_path;

    int256 constant TIMES_AMOUNT = 1e18;

    mapping(address => bool) public s_addressesAllowedToModifyPrice;

    event RequestPrice(bytes32 indexed requestId, uint256 _price);

    modifier onlyWhitelisted() {
        if (!s_addressesAllowedToModifyPrice[msg.sender]) {
            revert PriceFeed_NotWhitelisted();
        }
        _;
    }

    constructor(
        string memory symbol,
        uint8 priceDecimals,
        uint256 price,
        address[] memory whiteListedAddresses,
        address link_tokenAddress,
        address chainlinkOracleAddress,
        string memory apiUrl,
        string memory path
    ) {
        s_addressesAllowedToModifyPrice[msg.sender] = true;
        for (uint256 i = 0; i < whiteListedAddresses.length; i++) {
            s_addressesAllowedToModifyPrice[whiteListedAddresses[i]] = true;
        }
        s_symbol = symbol;
        i_decimals = priceDecimals;
        s_price = price;
        s_updatedAt = block.timestamp;

        setChainlinkToken(link_tokenAddress); //goerli: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
        setChainlinkOracle(chainlinkOracleAddress); //goerli: 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7
        i_anyApi_jobId = "fcf4140d696d44b687012232948bdd5d";
        s_apiUrl = apiUrl;
        s_path = path;
    }

    //create a chainlink request to retrieve API response, find the target data and remove decimals
    function fetchNewPrice() external returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(i_anyApi_jobId, address(this), this.fulfill.selector);
        // Set the URL to perform the GET request on
        req.add("get", s_apiUrl);
        req.add("path", s_path);
        req.addInt("times", TIMES_AMOUNT);
        return sendChainlinkRequest(req, FEE);
    }

    function decimals() external view override returns (uint8) {
        return i_decimals;
    }

    function description() external view override returns (string memory) {
        return s_symbol;
    }

    function version() external view override returns (uint256) {
        return 0;
    }

    function getRoundData(
        uint80 /*_roundId*/
    )
        external
        view
        override
        returns (
            uint80, /*roundId*/
            int256 answer,
            uint256, /*startedAt*/
            uint256 updatedAt,
            uint80 /*answeredInRound*/
        )
    {
        updatedAt = s_updatedAt;
        answer = int256(s_price);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80, /*roundId*/
            int256 answer,
            uint256, /*startedAt*/
            uint256 updatedAt,
            uint80 /*answeredInRound*/
        )
    {
        updatedAt = s_updatedAt;
        answer = int256(s_price);
    }

    function addUserToWhitelist(address user) public onlyWhitelisted {
        s_addressesAllowedToModifyPrice[user] = true;
    }

    function removeUserFromWhitelist(address user) public onlyWhitelisted {
        s_addressesAllowedToModifyPrice[user] = false;
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        emit RequestPrice(_requestId, _price);
        //divide number!: the api unhelpfully returns a "price" equal to 1/price
        //the number has already been multiplied with 1e18
        //therefore to get a number with precision i_decimals, we need to multiply 1 by (1e18*1**i_decimals)
        s_price = (1e18 * 10**i_decimals) / _price;
    }

    //TODO: remove function - for demo only - no one should have the power to replace the price
    function updatePrice(uint256 newPrice) public onlyWhitelisted {
        s_price = newPrice;
        s_updatedAt = block.timestamp;
    }
}
