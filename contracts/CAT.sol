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
    }

    function _mintCAT(address receivingAddress, uint256 amount) public {
        _mint(receivingAddress, amount);
    }
}
