// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CAT.sol";
import "hardhat/console.sol";

error Vault__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();
error Vault__NeedsMoreThanZero();
error Vault__TokenNotAllowed(address token);
error Vault__TransferFailed();
error Vault__BreaksHealthFactor();
error Vault__MintFailed();
error Vault__MustBreaksHealthFactor();
error Vault__HealthFactorOk();

contract Vault is ReentrancyGuard, Ownable {
    string public s_vaultName;
    CAT public immutable i_token;

    uint256 public immutable i_collateral_weight; //8 decimals depending on historic asset volatility, more or less collateral is required to secure a position. 67% weight implies together with minimum health-level that 150% collateral is required for a given mint position
    uint256 public constant MIN_HEALTH_FACTOR = 1e18; //
    uint256 public constant LIQUIDATION_DISCOUNT = 10; //10% discount when liquidating

    address public s_catPriceFeedAddress;
    mapping(address => address) public s_tokenAddressToPriceFeed;
    // user -> token -> amount
    mapping(address => mapping(address => uint256)) public s_userToTokenAddressToAmountDeposited;
    // user -> amount
    mapping(address => uint256) public s_userToCATMinted;

    address[] public s_collateralTokens;

    event CollateralDeposited(address indexed user, uint256 indexed amount);

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert Vault__NeedsMoreThanZero();
        }
        _;
    }

    modifier isAllowedToken(address token) {
        if (s_tokenAddressToPriceFeed[token] == address(0)) {
            revert Vault__TokenNotAllowed(token);
        }
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address catPriceFeedAddress,
        address[] memory allowedCollateralAddresses,
        address[] memory priceFeedsCollateral,
        uint256 collateral_weight
    ) {
        if (allowedCollateralAddresses.length != priceFeedsCollateral.length) {
            revert Vault__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();
        }
        for (uint256 i = 0; i < allowedCollateralAddresses.length; i++) {
            s_tokenAddressToPriceFeed[allowedCollateralAddresses[i]] = priceFeedsCollateral[i];
            s_collateralTokens.push(allowedCollateralAddresses[i]);
        }
        s_catPriceFeedAddress = catPriceFeedAddress;
        i_collateral_weight = collateral_weight;
        i_token = new CAT(name, symbol);
    }

    function addCollateralAndMintCAT(
        address collateralAddress,
        uint256 amountOfCollateral,
        uint256 amountToMint
    ) external {
        addCollateral(collateralAddress, amountOfCollateral);
        mintCAT(amountToMint);
    }

    function addCollateral(address tokenCollateralAddress, uint256 amountOfCollateral)
        public
        moreThanZero(amountOfCollateral)
        nonReentrant
        isAllowedToken(tokenCollateralAddress)
    {
        s_userToTokenAddressToAmountDeposited[msg.sender][
            tokenCollateralAddress
        ] += amountOfCollateral;
        emit CollateralDeposited(msg.sender, amountOfCollateral);
        bool success = IERC20(tokenCollateralAddress).transferFrom(
            msg.sender,
            address(this),
            amountOfCollateral
        );
        if (!success) {
            revert Vault__TransferFailed();
        }
    }

    function withdrawCollateral(address tokenCollateralAddress, uint256 amountOfCollateral)
        public
        moreThanZero(amountOfCollateral)
        nonReentrant
    {
        _withdrawCollateral(tokenCollateralAddress, amountOfCollateral, msg.sender, msg.sender);
        revertIfHealthFactorIsBroken(msg.sender);
    }

    function repayCATAndWithdrawCollateral(
        address tokenCollateralAddress,
        uint256 amountOfCollateral,
        uint256 amountOfCATToBurn
    ) external {
        repayCAT(amountOfCATToBurn);
        withdrawCollateral(tokenCollateralAddress, amountOfCollateral);
    }

    function _withdrawCollateral(
        address tokenCollateralAddress,
        uint256 amountCollateral,
        address from,
        address to
    ) private {
        s_userToTokenAddressToAmountDeposited[from][tokenCollateralAddress] -= amountCollateral;
        bool success = IERC20(tokenCollateralAddress).transfer(to, amountCollateral);
        if (!success) {
            revert Vault__TransferFailed();
        }
    }

    // Don't call this function directly, you will just lose money!
    function repayCAT(uint256 amountDscToBurn) public moreThanZero(amountDscToBurn) nonReentrant {
        _repayCAT(amountDscToBurn, msg.sender, msg.sender);
        revertIfHealthFactorIsBroken(msg.sender);
    }

    function _repayCAT(
        uint256 amountDscToBurn,
        address onBehalfOf,
        address dscFrom
    ) private {
        s_userToCATMinted[onBehalfOf] -= amountDscToBurn;
        bool success = i_token.transferFrom(dscFrom, address(this), amountDscToBurn);
        if (!success) {
            revert Vault__TransferFailed();
        }
        i_token.burn(amountDscToBurn);
    }

    function mintCAT(uint256 amountDscToMint) public moreThanZero(amountDscToMint) nonReentrant {
        s_userToCATMinted[msg.sender] += amountDscToMint;
        revertIfHealthFactorIsBroken(msg.sender);
        bool minted = i_token.mint(msg.sender, amountDscToMint);
        if (minted != true) {
            revert Vault__MintFailed();
        }
    }

    function getAccountInformation(address user)
        public
        view
        returns (uint256 totalCATValueMintedInUsd, uint256 collateralValueInUsd)
    {
        totalCATValueMintedInUsd = getUsdValue(address(i_token), s_userToCATMinted[user]);
        collateralValueInUsd = getCollateralAmountUsdForUser(user);
    }

    function calculateHealthFactor(address user) public view returns (uint256) {
        (uint256 totalCATValueMintedInUsd, uint256 collateralValueInUsd) = getAccountInformation(
            user
        );
        if (totalCATValueMintedInUsd == 0) return 100e18;
        uint256 collateralAdjustedForThreshold = (collateralValueInUsd * i_collateral_weight) /
            10000000000;
        return (collateralAdjustedForThreshold * 1e18) / totalCATValueMintedInUsd;
    }

    function getCollateralAmountUsdForUser(address user)
        public
        view
        returns (uint256 totalCollateralValueInUsd)
    {
        for (uint256 index = 0; index < s_collateralTokens.length; index++) {
            address token = s_collateralTokens[index];
            uint256 amount = s_userToTokenAddressToAmountDeposited[user][token];
            totalCollateralValueInUsd += getUsdValue(token, amount);
        }
        return totalCollateralValueInUsd;
    }

    function getUsdValue(address tokenAddress, uint256 amount) public view returns (uint256) {
        address priceFeedAddress;

        if (tokenAddress == address(i_token)) priceFeedAddress = s_catPriceFeedAddress;
        else priceFeedAddress = s_tokenAddressToPriceFeed[tokenAddress];

        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // 1 ETH = 1000 USD
        // The returned value from Chainlink will be 1000 * 1e8
        // We want to have everything in terms of WEI, so we add 10 zeros at the end
        return ((uint256(price) * 1e10) * amount) / 1e18;
    }

    function getTokenAmountFromUsd(address token, uint256 usdAmountInWei)
        public
        view
        returns (uint256)
    {
        address priceFeedAddress;
        if (token == address(i_token)) priceFeedAddress = s_catPriceFeedAddress;
        else priceFeedAddress = s_tokenAddressToPriceFeed[token];

        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // 1 ETH = 1000 USD
        // The returned value from Chainlink will be 1000 * 1e8
        // Most USD pairs have 8 decimals, so we will just pretend they all do
        return (uint256(price) * 1e10 * 1e18) / usdAmountInWei;
    }

    function revertIfHealthFactorIsBroken(address user) internal view {
        uint256 userHealthFactor = calculateHealthFactor(user);
        if (userHealthFactor < MIN_HEALTH_FACTOR) {
            revert Vault__BreaksHealthFactor();
        }
    }

    function liquidate(
        address collateral,
        address user,
        uint256 debtToCover
    ) external {
        uint256 startingUserHealthFactor = calculateHealthFactor(user);
        if (startingUserHealthFactor >= MIN_HEALTH_FACTOR) {
            revert Vault__HealthFactorOk();
        }
        uint256 tokenAmountFromDebtCovered = getTokenAmountFromUsd(collateral, debtToCover);
        uint256 bonusCollateral = (tokenAmountFromDebtCovered * LIQUIDATION_DISCOUNT) / 100;
        // Burn DSC equal to debtToCover
        // Figure out how much collateral to recover based on how much burnt
        _withdrawCollateral(
            collateral,
            tokenAmountFromDebtCovered + bonusCollateral,
            user,
            msg.sender
        );
        _repayCAT(debtToCover, user, msg.sender);

        uint256 endingUserHealthFactor = calculateHealthFactor(user);
        require(startingUserHealthFactor < endingUserHealthFactor);
    }

    function getToken() public view returns (address) {
        return address(i_token);
    }

    function isAllowedCollateral(address tokenAddress) public view returns (bool) {
        return uint160(s_tokenAddressToPriceFeed[tokenAddress]) > 0;
    }
}
