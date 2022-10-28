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
 */
contract Vault {
    // State variables
    address private immutable i_owner; //multi-sig address and will be changeable in later versions through DAO decisions
    string public s_vaultName;
    CAT private immutable i_token;
    address private immutable i_priceFeedAddress;

    address private immutable i_btcPriceFeedAddress;
    address private immutable i_ethPriceFeedAddress;

    address[] private s_borrowers; //list of borrowing addresses

    //mapping(address => Loan) private s_addressesToLoans; //the list of outstanding loans

    // Events

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Vault__NotOwner();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address priceFeedAddress,
        address btcPriceFeedAddress,
        address ethPriceFeedAddress
    ) {
        i_owner = msg.sender;
        s_vaultName = name;
        i_token = new CAT(name, symbol); //ERC20
        i_priceFeedAddress = priceFeedAddress;
        i_btcPriceFeedAddress = btcPriceFeedAddress;
        i_ethPriceFeedAddress = ethPriceFeedAddress;
    }

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

    function addCollateral() public {}

    //sending eth or other tokens will attempt to use the addCollateral function
    receive() external payable {
        addCollateral();
    }

    fallback() external payable {
        addCollateral();
    }

    function getToken() public view returns (CAT) {
        return i_token;
    }

    function getPriceFeed() public view returns (address) {
        return i_priceFeedAddress;
    }

    function getBTCPriceFeed() public view returns (address) {
        return i_btcPriceFeedAddress;
    }

    function getETHPriceFeed() public view returns (address) {
        return i_ethPriceFeedAddress;
    }
}
