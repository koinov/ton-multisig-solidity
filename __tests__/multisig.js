// @flow
import { TONClient } from '../index';

import multisigWalletPackage  from '../contracts/MultisigWalletPackage';
import walletManagerPackage  from '../contracts/WalletManagerPackage';
import userRegistryPackage  from '../contracts/UserRegistryPackage';

//import type { TONContractPackage } from "ton-client-js/src/modules/TONContractsModule";

import init from './init';



beforeAll(init);
afterAll(() => {
    TONClient.shared.close();
    console.log('>>>', 'done');
});

const richAddress = '0000000000000000000000000000000000000000000000000000000000000000';
/*
const walletKeys = {
    public: 'fb98b2541ba805648f25eb469dd4766fcdde03a2cfe6fb41d8c1571c29407ca3',
    secret: '7bfe77bbd3ad57ada9ed323da83504723e3af7cd3ba68b02d3c8335f75e0a24e',
};
*/
const walletAddress = 'adb63a228837e478c7edf5fe3f0b5d12183e1f22246b67712b99ec538d6c5357';


const coowner1Keys ={
    public:'1427fad74b9632791c867317bfc0f8f679d44196fe0bec50c9019ced71c21734',
    secret:'b1be41e686bfb985d0e67247763566ad73bbf2e08d64f1bd8b8be53bd8bcf181' 
}
const coowner2Keys ={ public:'76de11f72e1fbe491bdd6a835501f8387dbedaa949a16a55662143802ca5114e',
   secret:'e5cf27f1f18b01dc9af997ae53911b3d416654011d79f259b84c49996a6e3a95' }

test('keys', async () =>{
    const ton = TONClient.shared;
    const coowner1_keys = await ton.crypto.ed25519Keypair();
    const coowner2_keys = await ton.crypto.ed25519Keypair();
    console.log(coowner1_keys);
    console.log(coowner2_keys);
})

test('send Grams', async () => {
    const ton = TONClient.shared;
    await ton.contracts.sendGrams({
        fromAccount: richAddress,
        toAccount: walletAddress,
        amount: 100,
    });
});


test('load', async () => {
    const rich = await TONClient.shared.contracts.load({
        address: richAddress,
        includeImage: false,
    });
    expect(rich.id).toEqual(richAddress);

    const contract = await TONClient.shared.contracts.load({
        address: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
        includeImage: false,
    });
    expect(contract.id).toBeNull();
    expect(contract.balanceGrams).toBeNull();

    const w = await TONClient.shared.contracts.load({
        address: walletAddress,
        includeImage: false,
    });
    console.log('[Wallet contract] balance', w);
    //console.log('[Wallet keys] balance', w);

    expect(w.id).toEqual(walletAddress);
    expect(Number.parseInt(w.balanceGrams)).toBeGreaterThan(0);
});

let deployedWallet=null;
let deployedWalletCoowner1=null;
let deployedManager=null;
let deployedManagerCoowner1=null;
let deployedManagerCoowner2=null;
let deployedRegistry=null;
const { contracts } = TONClient.shared;
const ton = TONClient.shared;
let walletKeys = null;

test('deploy', async () => {
    //console.log("multisigwalletPackage",multisigwalletPackage);

    walletKeys = await ton.crypto.ed25519Keypair();


    deployedManager = await contracts.deploy({
        package: walletManagerPackage,
        constructorParams: {},
        keyPair: walletKeys,
    });
    console.log('[Wallet deployedManager]', deployedManager);

    deployedWallet = await contracts.deploy({
        package: multisigWalletPackage,
        constructorParams: {},
        keyPair: walletKeys,
    });
    console.log('[Wallet deployedWallet]', deployedWallet);


    deployedManagerCoowner1 = await contracts.deploy({
        package: walletManagerPackage,
        constructorParams: {},
        keyPair: coowner1Keys,
    });
    console.log('[Wallet deployedManagerCoowner1]', deployedManagerCoowner1);
    
    deployedWalletCoowner1 = await contracts.deploy({
        package: multisigWalletPackage,
        constructorParams: {},
        keyPair: coowner1Keys,
    });
    console.log('[Wallet deployedWalletCoowner1]', deployedWalletCoowner1);
    

    deployedManagerCoowner2= await contracts.deploy({
        package: walletManagerPackage,
        constructorParams: {},
        keyPair: coowner2Keys,
    });
    console.log('[Wallet deployedManagerCoowner1]', deployedManagerCoowner2);

    /*
    const deployedWalletCoowner2 = await contracts.deployJs({
        package: multisigWalletPackage,
        constructorParams: {},
        keyPair: coowner2Keys,
    });
    console.log('[Wallet deployedWalletCoowner2]', deployedWalletCoowner2);
    */


    const w = await contracts.load({
        address: deployedWallet.address,
        includeImage: false,
    });
    console.log('[Wallet load Wallet] loaded', w);

});


test('initialize wallet', async () => {
    const result0 = await contracts.run({
        address: deployedManager.address,
        functionName: 'initializeWallet',
        abi: walletManagerPackage.abi,
        input: {wallet : `0x${deployedWallet.address}`, k : 2, n : 3},
        keyPair: walletKeys,
    });
    console.log('[Wallet Manager] initialize', result0);

    const result01 = await contracts.run({
        address: deployedManagerCoowner1.address,
        functionName: 'initializeWallet',
        abi: walletManagerPackage.abi,
        input: {wallet : `0x${deployedWalletCoowner1.address}`, k : 1, n : 1},
        keyPair: walletKeys,
    });
    console.log('[Wallet Manager] initialize', result01);


    const result1 = await contracts.run({
        address: deployedManager.address,
        functionName: 'authorizeCoowner',
        abi: walletManagerPackage.abi,
        input: {
            wallet : `0x${deployedWallet.address}`,
            coowner : `0x${deployedManagerCoowner1.address}`,
        },
        keyPair: walletKeys,
    });
    console.log('[Wallet Manager] authorizeCoowner1', result1);
    
    const result2 = await contracts.run({
        address: deployedManager.address,
        functionName: 'authorizeCoowner',
        abi: walletManagerPackage.abi,
        abi: walletManagerPackage.abi,
        input: {
            wallet : `0x${deployedWallet.address}`,
            coowner : `0x${deployedManagerCoowner2.address}`,
        },
        keyPair: walletKeys,
    });
    console.log('[Wallet Manager] authorizeCoowner2', result2);

    const result3_1 = await contracts.run({
        address: deployedManagerCoowner1.address,
        functionName: 'authorizeWalletRequestConfirm',
        abi: walletManagerPackage.abi,
        input: {request_id : 0},
        keyPair: coowner1Keys,
    });
    console.log('[Wallet ManagerCoowner1] authorizeWalletRequestConfirm', result3_1);
    const result3_2 = await contracts.run({
        address: deployedManagerCoowner2.address,
        functionName: 'authorizeWalletRequestConfirm',
        abi: walletManagerPackage.abi,
        input: {request_id : 0},
        keyPair: coowner2Keys,
    });
    console.log('[Wallet ManagerCoowner2] authorizeWalletRequestConfirm', result3_2);
});

test('transfer', async () => {
    const result4 = await contracts.run({
        address: deployedManager.address,
        functionName: 'transferWallet',
        abi: walletManagerPackage.abi,
        input: {
            wallet : `0x${deployedWallet.address}`,
            recepient : `0x${deployedManagerCoowner1.address}`,
            value : 100
        },
        keyPair: walletKeys,
    });
    console.log('[Wallet contract] transfer', result4);

    const result5 = await contracts.run({
        address: deployedManagerCoowner1.address,
        functionName: 'authorizeTransfer',
        abi: walletManagerPackage.abi,
        input: {
            wallet : `0x${deployedWallet.address}`,
            transfer_id : 0,
        },
        keyPair: walletKeys,
    });

    console.log('[Wallet contract] authorizeTransfer',  result5);


});



