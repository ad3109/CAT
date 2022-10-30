// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CAT is ERC20 {
    constructor(
        uint256 initialSupply,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        // CAT1 demo is _mint(msg.sender, 1000);
        // contract address: 0xd3249B4230e3218D9f3509d3ADff089718c5eE50
    }

    function _mintCAT(address receivingAddress, uint256 amount) public {
        _mint(receivingAddress, amount);
    }
}
