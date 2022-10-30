//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*  This is a generic vault where a set of loans are held
    Loans are  */

import "./CAT.sol";

error Vault__NotOwner();
error Vault__CollateralNotAllowed();

/**@title  the main vault contract
 * @author Reginald Dewil
 * @notice users can deposit collateral into the contract and mint a Commodity Asset Token against this collateral. This contract uses chainlink price feeds for determinining both the prices of the CAT and the collateral.
 *         TODO: contract should be improved by using WETH as collateral instead of ETH, when ETH is sent or deposited, should be autoconverted to WETH
 *               => allows for uniform handling of collateral
 */
contract Vault {
    // State variables
    address private immutable i_owner; //multi-sig address and will be changeable in later versions through DAO decisions
    string private s_vaultName;
    CAT private immutable i_token;
    uint256 private s_mimimalCollateralLevel; //percentage rate, 8 decimals

    address private s_catPriceFeedAddress;
    address private s_ethUsdPriceFeed;
    address[] private s_allowedCollateral;
    mapping(address => address) private s_collateralPriceFeedsByAddress;

    address[] private s_borrowers; //list of borrowing addresses
    //mapping(address => address)
    //mapping(address => ) private s_addressesToLoans; //the list of outstanding loans

    // Events

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Vault__NotOwner();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address catPriceFeedAddress,
        address ethUsdPriceFeed,
        address[] memory allowedCollateralAddresses,
        address[] memory priceFeedsCollateral,
        uint256 minimalCollateralLevel
    ) {
        i_owner = msg.sender;
        s_vaultName = name;
        i_token = new CAT(name, symbol); //ERC20
        s_catPriceFeedAddress = catPriceFeedAddress;
        s_ethUsdPriceFeed = ethUsdPriceFeed;
        s_allowedCollateral = allowedCollateralAddresses;
        for (uint256 i = 0; i < allowedCollateralAddresses.length; i++) {
            s_collateralPriceFeedsByAddress[allowedCollateralAddresses[i]] = priceFeedsCollateral[
                i
            ];
        }
        s_mimimalCollateralLevel = minimalCollateralLevel;
    }

    function addCollateral() public {}

    function withdrawCollateral() public {}

    function borrow(uint256 toBorrowAmount) public {
        /**1. check if this user is allowed to borrow: i.e. has remaining free collateral
         * 2. mint the tokens & send to user
         * 3. update user loans
         * 4. add Loan object to s_addressesToLoans
         */

        //TODO: 1. check if user is allowed to borrw

        //2. mint the tokens and send to user
        i_token._mintCAT(msg.sender, toBorrowAmount);

        //3. update Loan object
    }

    //sending eth or other tokens will attempt to use the addCollateral function
    receive() external payable {}

    fallback() external payable {
        addCollateral();
    }

    function getToken() public view returns (CAT) {
        return i_token;
    }

    function getPriceFeed() public view returns (address) {
        return s_catPriceFeedAddress;
    }

    function getEthPriceFeed() public view returns (address) {
        return s_ethUsdPriceFeed;
    }

    function getAllowedCollateral() public view returns (address[] memory) {
        return s_allowedCollateral;
    }

    function isAllowedCollateral(address collateralAddress) public view returns (bool) {
        if (s_allowedCollateral.length == 0) return false;
        return s_collateralPriceFeedsByAddress[collateralAddress] != address(0);
    }

    function getPriceFeedOfCollateral(address collateralAddress) public view returns (address) {
        return s_collateralPriceFeedsByAddress[collateralAddress];
    }
}
