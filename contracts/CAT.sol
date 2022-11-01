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
        // CAT1 demo is _mint(msg.sender, 1000);
        // contract address: 0xd3249B4230e3218D9f3509d3ADff089718c5eE50
    }

    function _mintCAT(address receivingAddress, uint256 amount) public {
        _mint(receivingAddress, amount);
    }
}
