//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    address private immutable i_owner;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        i_owner = msg.sender;
    }

    function _mintCAT(address receivingAddress, uint256 amount) public {
        _mint(receivingAddress, amount);
    }
}
