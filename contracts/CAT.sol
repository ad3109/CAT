// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error CAT__AmountMustBeMoreThanZero();
error CAT__BurnAmountExceedsBalance();
error CAT__NotZeroAddress();

contract CAT is ERC20Burnable, Ownable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) {
            revert CAT__AmountMustBeMoreThanZero();
        }
        if (balance < _amount) {
            revert CAT__BurnAmountExceedsBalance();
        }
        super.burn(_amount);
    }

    function mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert CAT__NotZeroAddress();
        }
        if (_amount <= 0) {
            revert CAT__AmountMustBeMoreThanZero();
        }
        _mint(_to, _amount);
        return true;
    }
}
