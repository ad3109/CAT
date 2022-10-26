// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// import "OpenZeppelin/openzeppelin-contracts@4.7.3/contracts/token/ERC20/extensions/ERC20Votes.sol";
// allows us to have a snapshot of how mant tokens different holders hold at any given point in time
// important for prevent flash loan voting
// otherwise exactly same as ERC20
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {

    uint256 public maxSupply = 1000 ether; // 1000 * 10^18

    constructor() ERC20("DAOGovToken", "DGT") ERC20Permit("DAOGovToken") {
        _mint(msg.sender, maxSupply);
    }

    // below function overrides are required by solidity

    // function to keep track of how many tokens do people have
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        //_moveVotingPower(delegates(from), delegates(to), amount);
    }

    // these overrides are required by solidity
    // can override these function to achieve desired functionality
    function _mint(address to, uint256 amount) internal override(ERC20Votes){
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}