// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CAT.sol";
import "hardhat/console.sol";

error Vault__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();
error Vault__NeedsMoreThanZero();
error Vault__TokenNotAllowed();
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
    mapping(address => mapping(address => uint256)) public s_userToTokenAddressToAmountDeposited;
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
            revert Vault__TokenNotAllowed();
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
        s_userToTokenAddressToAmountDeposited[msg.sender][tokenCollateralAddress] += amountOfCollateral;
        emit CollateralDeposited(msg.sender, amountOfCollateral);
        bool success = IERC20(tokenCollateralAddress).transferFrom(msg.sender, address(this), amountOfCollateral);
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
    function repayCAT(uint256 amountOfCATToBurn) public moreThanZero(amountOfCATToBurn) nonReentrant {
        _repayCAT(amountOfCATToBurn, msg.sender, msg.sender);
        revertIfHealthFactorIsBroken(msg.sender);
    }

    function _repayCAT(
        uint256 amountOfCATToBurn,
        address onBehalfOf,
        address catFrom
    ) private {
        s_userToCATMinted[onBehalfOf] -= amountOfCATToBurn;
        bool success = i_token.transferFrom(catFrom, address(this), amountOfCATToBurn);
        if (!success) {
            revert Vault__TransferFailed();
        }
        i_token.burn(amountOfCATToBurn);
    }

    function mintCAT(uint256 amountOfCATToMint) public moreThanZero(amountOfCATToMint) nonReentrant {
        s_userToCATMinted[msg.sender] += amountOfCATToMint;
        revertIfHealthFactorIsBroken(msg.sender);
        bool minted = i_token.mint(msg.sender, amountOfCATToMint);
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
        (uint256 totalCATValueMintedInUsd, uint256 collateralValueInUsd) = getAccountInformation(user);
        if (totalCATValueMintedInUsd == 0) return 100e18;
        uint256 collateralAdjustedForThreshold = (collateralValueInUsd * i_collateral_weight) / 10000000000;
        return (collateralAdjustedForThreshold * 1e18) / totalCATValueMintedInUsd;
    }

    function getCollateralAmountUsdForUser(address user) public view returns (uint256 totalCollateralValueInUsd) {
        for (uint256 index = 0; index < s_collateralTokens.length; index++) {
            address token = s_collateralTokens[index];
            uint256 amount = s_userToTokenAddressToAmountDeposited[user][token];
            totalCollateralValueInUsd += getUsdValue(token, amount);
        }
        return totalCollateralValueInUsd;
    }

    function getPrice(address tokenAddress) public view returns (int256 price, uint8 decimals) {
        AggregatorV3Interface priceFeed = (tokenAddress == address(i_token))
            ? AggregatorV3Interface(s_catPriceFeedAddress)
            : AggregatorV3Interface(s_tokenAddressToPriceFeed[tokenAddress]);
        (, price, , , ) = priceFeed.latestRoundData();
        decimals = priceFeed.decimals();
    }

    function getUsdValue(address tokenAddress, uint256 amount) public view returns (uint256) {
        (int256 price, uint8 decimals) = getPrice(tokenAddress);
        return ((uint256(price) * 10**(18 - decimals) * amount) / 1e18);
    }

    function getTokenAmountFromUsd(address tokenAddress, uint256 usdAmountInWei) public view returns (uint256) {
        (int256 price, uint8 decimals) = getPrice(tokenAddress);
        return (usdAmountInWei * 1e18) / (uint256(price) * 10**(18 - decimals)); //1 unit = 1e18 wei
    }

    function revertIfHealthFactorIsBroken(address user) internal view {
        uint256 userHealthFactor = calculateHealthFactor(user);
        if (userHealthFactor < MIN_HEALTH_FACTOR) {
            revert Vault__BreaksHealthFactor();
        }
    }

    /*
        3rd party vigilante tracks positions. if health factor < min_health_factor, he/she can initiate liquidation
        liquidator chooses a single collateral type to seize
        //TODO: modify to restrict to partial liquidation, i.e. only liquidate enough to ensure health factor is < min_health_factor (+safety margin)
                current implementation allows for complete liquidation which is a bit excessive
    */
    function liquidate(
        address addressOfCollateralToBeSeized,
        address user,
        uint256 debtToCover
    ) external {
        uint256 startingUserHealthFactor = calculateHealthFactor(user);
        if (startingUserHealthFactor >= MIN_HEALTH_FACTOR) {
            revert Vault__HealthFactorOk();
        }
        uint256 tokenAmountFromDebtCovered = getTokenAmountFromUsd(addressOfCollateralToBeSeized, debtToCover);
        uint256 bonusCollateral = (tokenAmountFromDebtCovered * LIQUIDATION_DISCOUNT) / 100;
        // Burn CAT equal to debtToCover
        // Figure out how much collateral to recover based on how much burnt
        _withdrawCollateral(
            addressOfCollateralToBeSeized,
            tokenAmountFromDebtCovered + bonusCollateral,
            user,
            msg.sender
        );
        _repayCAT(debtToCover, user, msg.sender);

        uint256 endingUserHealthFactor = calculateHealthFactor(user);
        require(startingUserHealthFactor < endingUserHealthFactor);
    }

    function getToken() external view returns (address) {
        return address(i_token);
    }

    function isAllowedCollateral(address tokenAddress) external view returns (bool) {
        return uint160(s_tokenAddressToPriceFeed[tokenAddress]) > 0;
    }

    function getCollateralTokens() external view returns (address[] memory) {
        return s_collateralTokens;
    }

    function getPriceFeedForCollateralToken(address tokenAddress) external view returns (address) {
        return s_tokenAddressToPriceFeed[tokenAddress];
    }

    function updatePriceFeedAddressOfCat(address newAddress) public onlyOwner {
        s_catPriceFeedAddress = newAddress;
    }

    function getCollateralAmountOfTokenOfUser(address user, address tokenAddress) public view returns (uint256) {
        return s_userToTokenAddressToAmountDeposited[user][tokenAddress];
    }
}
