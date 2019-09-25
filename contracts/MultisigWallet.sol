pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract MultisigManager {
    function authorizationWalletRequestSubmit() public returns(bool);
}

contract MultisigWallet {

    uint256 balance;
    address _owner;
    uint8 _n;
    uint8 _k;
    uint8 _initialized;

    mapping (address=>uint8) _coowners;
    uint8 _coowners_counter;

    struct TransferRequest{
        address payable recepient;
        uint256 value;
        uint8 signatures_counter;
        uint8 status;
    }

    mapping (uint256=>TransferRequest) _transfers;
    mapping (uint256=>mapping(address=>uint8)) _signatures;

    uint256 _transfers_counter;


    constructor() public{
    }

    function initialize(uint8 k, uint8 n) public returns(bool){
        require(_initialized == 0);
        _owner = msg.sender;
        _coowners[msg.sender] = 2;
        _coowners_counter += 1;
        _k = k;
        _n = n;
        _initialized = 1;
        return true;
    }

    function owner() public view returns(address){
        return _owner;
    }


    function authorized_counter() public view returns(uint8){
        return _coowners_counter;
    }

    function transfers_counter() public view returns(uint256){
        return _transfers_counter;
    }

    function transfers(uint256 transfer_id) public view returns(TransferRequest memory){
        return _transfers[transfer_id];
    }

    function authorize(address coowner) public returns(bool){
        require(_coowners_counter < _n);
        MultisigManager(coowner).authorizationWalletRequestSubmit();
        _coowners[coowner] = 1;
        return true;
    }

    function authorizationConfirm() public returns(bool){
        require(_coowners[msg.sender]==1);
        _coowners[msg.sender] = 2;
        _coowners_counter += 1;
    }

    function transfer(address payable recepient, uint256 value) public returns(bool){
        require(_coowners[msg.sender] == 2);
        _transfers[_transfers_counter] = TransferRequest(recepient, value, 1, 1);
        _signatures[_transfers_counter][msg.sender] = 1;
        _transfers_counter += 1;
        return true;
    }

    function authorize_transfer(uint256 transfer_id) public returns(bool){
        require(_transfers[transfer_id].status == 1);
        require(_transfers[transfer_id].signatures_counter < _k);
        require(_coowners[msg.sender] == 2);
        require(_signatures[transfer_id][msg.sender] == 0);
        _transfers[transfer_id].signatures_counter += 1;
        uint256 transfervalue = _transfers[transfer_id].value;

        if(_transfers[transfer_id].signatures_counter == _k){
            _transfers[transfer_id].status = 2;
            address(_transfers[transfer_id].recepient).transfer(transfervalue);
        }
        return true;
    }


}