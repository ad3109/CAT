//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*  This is a generic vault where a set of loans are held
    Loans are  */

import "./CAT.sol";
import "./Loan.sol";

contract Vault {
    string public s_vaultName;
    CAT private immutable i_token;
    address private immutable i_priceFeedAddress;
    address private immutable i_btcPriceFeedAddress;
    address private immutable i_ethPriceFeedAddress;

    mapping(address => Loan) private s_addressesToLoans; //the list of outstanding loans

    constructor(
        string memory name,
        string memory symbol,
        address priceFeedAddress,
        address btcPriceFeedAddress,
        address ethPriceFeedAddress
    ) {
        s_vaultName = name;
        i_token = new CAT(0, name, symbol);
        i_priceFeedAddress = priceFeedAddress;
        i_btcPriceFeedAddress = btcPriceFeedAddress;
        i_ethPriceFeedAddress = ethPriceFeedAddress;
    }

    function borrow(uint256 toBorrowAmount) public {
        /**1. check if this user is allowed to borrow: i.e. has remaining free collateral
         * 2. mint the tokens & send to user
         * 3. update Loan object
         * 4. add Loan object to s_addressesToLoans
         */

        //TODO: 1. check if user is allowed to borrw

        //2. mint the tokens and send to user
        i_token._mintCAT(msg.sender, toBorrowAmount);

        //3. update Loan object
    }

    function getToken() public view returns (CAT) {
        return i_token;
    }
}
