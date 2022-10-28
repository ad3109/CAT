// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error CAT__NotOwner();

contract CAT is ERC20 {
    address private immutable i_owner;

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert CAT__NotOwner();
        _;
    }

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        i_owner = msg.sender;
    }

    function _mintCAT(address receivingAddress, uint256 amount) public {
        _mint(receivingAddress, amount);
    }
}
