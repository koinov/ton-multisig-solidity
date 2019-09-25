pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

interface MultisigWallet {
    function transfer(address payable recepient, uint256 value) external returns(bool);
    function authorize_transfer(uint256 transfer_id) external returns(bool);
    function authorizationConfirm() external returns(bool);
    function authorize(address coowner) external returns(bool);
    function initialize(uint8 k, uint8 n) external returns(bool);
}

contract UserRegistry {
    function add_user(uint256 name_hash) external returns(bool);
    function delete_user(uint256 name_hash) public returns(bool);
}

contract MultisigManager {
    mapping(uint32=>address) _wallets;
    uint32 _wallets_counter;
    mapping(uint32=>address) _authorization_requests;
    uint32 _authorization_requests_counter;
    mapping(address=>uint8) _wallet_status;
    address _user_registry;
    uint256 _name_hash;

    function transferWallet(address wallet, address payable recepient, uint256 value) public returns(bool){
        require(_wallet_status[wallet]==2);
        MultisigWallet(wallet).transfer(recepient, value);
        return true;
    }
    function authorizeTransfer(address wallet, uint256 transfer_id) public returns(bool){
        require(_wallet_status[wallet]==2);
        MultisigWallet(wallet).authorize_transfer(transfer_id);
        return true;
    }

    function authorizeCoowner(address wallet, address coowner) public returns(bool){
        MultisigWallet(wallet).authorize(coowner);
        return true;
    }

    function initializeWallet(address wallet, uint8 k, uint8 n) public returns(bool){
        MultisigWallet(wallet).initialize(k, n);
        _wallets[_wallets_counter] = wallet;
        _wallet_status[wallet] = 2;
        _wallets_counter += 1;
        return true;
    }


    function authorizationWalletRequestSubmit() public returns(bool){
        require(_wallet_status[msg.sender]==0);
        _authorization_requests[_authorization_requests_counter] = msg.sender;
        _authorization_requests_counter++;
        _wallet_status[msg.sender] = 1;
        return true;
    }

    function authorizationWalletRequestCounter() public view returns(uint32){
        return _authorization_requests_counter;
    }

    function authorizationWalletRequest(uint32 request_id) public view returns(address){
        return _authorization_requests[request_id];
    }

    function walletsCounter() public view returns (uint32){
        return _wallets_counter;
    }

    function wallet(uint32 wallet_id) public view returns (address){
        return _wallets[wallet_id];
    }


    function authorizeWalletRequestConfirm(uint32 request_id) public returns(bool){
        //require(_wallet_status[msg.sender]==1);
        MultisigWallet(_authorization_requests[request_id]).authorizationConfirm();
        _wallet_status[_authorization_requests[request_id]] = 2;
        _wallets[_wallets_counter] = _authorization_requests[request_id];
        _wallets_counter += 1;
        _authorization_requests_counter -= 1;
        if( _authorization_requests_counter > 0 && request_id < _authorization_requests_counter){
           _authorization_requests[request_id] = _authorization_requests[_authorization_requests_counter];
        }
        return true;
    }

    function setRegistry(address registry) public returns(bool){
        _user_registry = registry;
        return true;
    }

    function addUser(uint256 name_hash) public returns(bool){
        require(_name_hash == 0);
        UserRegistry(_user_registry).add_user(name_hash);
        _name_hash = name_hash;
        return true;
    }

    function rename_user(uint256 name_hash) public returns(bool){
        require(_name_hash != 0);
        UserRegistry(_user_registry).delete_user(_name_hash);
        UserRegistry(_user_registry).add_user(name_hash);
        _name_hash = name_hash;
        return true;
    }

    function delete_user(uint256 name_hash) public returns(bool){
        require(_name_hash != 0);
        UserRegistry(_user_registry).delete_user(_name_hash);
        UserRegistry(_user_registry).add_user(name_hash);
        _name_hash = name_hash;
        return true;
    }


}