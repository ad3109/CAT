//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*A loan  */
contract Loan {
    //simply holds the collateral value and the outstanding loan value and the issue date from which the interest needs to be calculated by liquidators and checked by liquidation contract
    uint256 private s_timeStampLastInterestUpdate;
    mapping(address => uint256) collateralAmountByToken;

    address public immutable i_token;

    constructor(address commodityToken) {
        i_token = commodityToken;
        s_timeStampLastInterestUpdate = block.timestamp;
    }

    uint256 private s_amountBorrowedPerToken;

    //mapping(address, uint256) accruedInterestPerToken
}
