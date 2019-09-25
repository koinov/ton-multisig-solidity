# Solidity Multisig contract for TON

## Problematic

Security is a cornerstone for each blockchain project and each person dealing with digital assets.

Multi Signature scheme adds additional security layer making sure each transfer is confirmed by multiple parties and transaction is not submitted by mistake. 

Main aim of this MultiSig project is to learn more about TON blockchain, how does the interation between smart contracts work, and to implement simple UI providing user-friendly access to TON wallets and managing keys and wallets.


## Assumptions

This code is based on Solidity compiler and Ton-Clinet-Node-JS library by TON Labs and runs with Node SE. 
At the monent there are many points should be considered to achieve maximum compatibility with future improvements. 

First of all, there's no signature checks and there's no way to get msg.sender from external messages, so WalletManager adds this functionality by sending internal messages to MultisigWallet, however WalletManager itself has no way to make sure it is called with correct keys. We hope Node SE will add this functionality soon. 


## Contracts 

This contracts structure is following:
MultisigWallet - manages grams
WalletManager - manages wallets
UserRegistry - manages users

More documentation wil be provided later, it is a good option to check [multisig.js](__tests__/multisig.js) for the flow.

### MultisigWallet
Implementation of Multisig contract.
Contract should be initialized by calling initializeWallet of WalletManager and provoding K an N parameters. 
N parameters is a number of coowners 
K means number of confirmations required to perform transfer.


### WalletManager 
Implementation of Multisig Wallet Manager.  Currenty is done to send msg.sender to Multisig contract, will be merger in MultiSig contract as soon as external messages authorization is implemented.  

### UserRegistry
Users registry that allows to find WalletManager address of coowner by the name. 


## Install 

```
npm install
```


## Build
```
npm run build
```

## Tests

```
npm test
```

You need to have NODE SE running. To change connection parameters please check [init.js](__tests__/init.js) file. 

