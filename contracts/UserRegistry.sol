pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract UserRegistry {
    mapping (uint256=>address) _users;
    function add_user(uint256 name_hash) external returns(bool){
        require(_users[name_hash] == address(0));
        _users[name_hash] = msg.sender;
        return true;
    }
    
    function get_user(uint256 name_hash) public view returns(address){
        return _users[name_hash];
    }

    function delete_user(uint256 name_hash) public returns(bool){
        require( _users[name_hash] == msg.sender);
        _users[name_hash] = address(0);
        return true;
    }

}