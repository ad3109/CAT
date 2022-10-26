//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*  This is a generic vault where a set of loans are held
    Loans are  */

import "./Loan.sol";

contract Vault {
    address public immutable i_token; //address of commodity token
    mapping(address => Loan) private s_addressesToLoans;

    constructor(address commodityAddress) {
        //TODO: add allowed collateral as input paramater for Vault
        i_token = commodityAddress;
    }

    function borrow(uint256 toBorrowAmount) public {
        //TODO: create a loan if no loan already exists for that address and this token
    }
}
