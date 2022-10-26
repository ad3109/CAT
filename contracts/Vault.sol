//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*  This is a generic vault where a set of loans are held
    Loans are  */

import {Loan} from "./Loan.sol";

contract Vault {
    address public immutable i_token; //address of commodity token
    mapping<address, Loan> private immutable s_addressesToLoans; 

}
