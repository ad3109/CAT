pragma solidity 0.6.6;

contract Permissions {
    
//---------------------[Ownership Functions]-------------------------
    bool initialised;
    address owner = msg.sender;

    event OwnershipTransferred(address indexed from, address indexed to);

    // Used to add ownerOnly functionality
    modifier onlyOwner {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Initialises address of owner/Assigns owner
    function initOwned(address _owner) internal {
        require(!initialised, "Already initialised");
        owner = address(uint160(_owner));
        initialised = true;
    }

    // Owner transfers ownership to new address
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != owner, "Already owner");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

//--------------------------[FreezeFunction]-----------------------------------

    // Determines whether functions with freezeFunction modiferier pause/freeze
    bool isFrozen = false;

    // On - Off feature to free functionality
    modifier freezeFunction {
        require(isFrozen != true, "Function is frozen");
        _;
    }

    // Owner freezes the contract - DISABLING functionality
    function freezeContract() public onlyOwner {
        require(isFrozen != true, "already frozen");
        isFrozen = true;
    }

    // Owner unfreezes the contract - ENABLING functionality
    function unfreezeContract() public onlyOwner {
        require(isFrozen != false, "already unfrozen");
        isFrozen = false;
    }
}
