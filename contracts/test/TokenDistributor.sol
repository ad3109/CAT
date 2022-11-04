pragma solidity 0.6.6;

import "./XYZToken.sol";
import "./SafeMath.sol";

contract tokenDistributor is xyzToken {
    using SafeMath for uint;

    address[] addresses;
    uint public totalAddresses;
    mapping(address => bool) public addressIsAdded;

    event DispursedTokens(uint indexed totalTokensDistributed, uint256 indexed tokensPerAddress, uint indexed totalParticipationAddresses, address[] addresses);
    
    function addMyAddress() public freezeFunction {
        require(addressIsAdded[msg.sender] != true, "address already added");
        addressIsAdded[msg.sender] = true;
        addresses.push(msg.sender);
        totalAddresses++;
    }
    
    function removeMyAddress() public freezeFunction {
        require(addressIsAdded[msg.sender] == true, "address already not added (or removed)");
        addressIsAdded[msg.sender] = false;
        addresses.pop();
        totalAddresses--;
    }

    function addAddress(address _address) public onlyOwner freezeFunction {
        require(addressIsAdded[_address] != true, "address already added");
        addressIsAdded[_address] = true;
        addresses.push(_address);
        totalAddresses++;
    }
    
    function removeAddress(address _address) public onlyOwner freezeFunction {
        require(addressIsAdded[_address] == true, "address already not added (or removed)");
        addressIsAdded[_address] = false;
        addresses.pop();
        totalAddresses--;
    }

    function distributeTokens(uint amount) public onlyOwner freezeFunction returns(bool success) {
        require(totalAddresses != 0, "there are no addresses added to be distributed to");
        require(amount != 0, "unable to distribute 0 tokens");
        require(amount.div(totalAddresses) != 0, "addresses exceed input amount (minimum one per address)");
        totalSupply = totalSupply.add(amount);
        totalSupplyHeld = totalSupplyHeld.add(amount);
        for (uint i = 0; i < addresses.length; i++) {
            address a = addresses[i];
            balanceOf[a] = balanceOf[a].add(amount.div(addresses.length));
        }
        emit DispursedTokens(amount, amount.div(totalAddresses), totalAddresses, addresses);
        return true;
    }
}
