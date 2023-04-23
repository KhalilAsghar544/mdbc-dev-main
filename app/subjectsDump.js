/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets,DefaultEventHandlerStrategies,EventStrategies } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');
var faker = require('faker');
const timer = ms => new Promise(res => setTimeout(res, ms))
var bunyan = require('bunyan');
const { v4: uuidv4 } = require('uuid');

async function StoreSubjectsBlockchain() {
    jsonReader('files/maxSubjects_4000.json', (err, subject) => {
        if (err) {
            console.log(err)
            return
        }
        let mData;
        let new_array = new Array();
        let test_array = new Array();
        
        // for (let i = 0; i < subject.length; i++) {
        //     let codes = subject[i].medical_codes;
        //     for (let j = 0; j < codes.length; j++) {
        //         mData = codes[j];
        //         mData.docType = 'medicalcode';
        //         mData.subject_id = subject[i].subject_id;
        //         new_array.push(mData);
        //     }
        // } 

        // for (let i = 0; i < test_array.length; i++) {
        //     let codes = test_array[i].medical_codes;
        //     for (let j = 0; j < codes.length; j++) {
        //         mData = codes[j];
        //         mData.docType = 'medicalcode';
        //         mData.subject_id = test_array[i].subject_id;
        //         new_array.push(mData);
        //     }
        // }
        // for(let i = 0; i < subject.length; i++){
        //     delete subject[i].medical_codes;
        //     new_array.push(subject[i]);
        // }
        //console.log('Array Length', new_array.length);
        console.log(subject.length); // Total Subjects
        //console.log(new_array.length); // Test Subjects
         
        processSubjects(subject); // Uncomment this for subjects
        
        //processCodes(subject)  // Uncomment this for medical codes


        // createMedicalCodes(new_array).then((res)=>{
        //     console.log(`Completed ${res}`);
        // }).catch((err)=>{
        //     console.log(`Error Found : ${err}`)
        // })
        // const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // for (let i = 0, p = Promise.resolve(); i < subject.length; i++) {
        //     subject[i].first_name  = faker.name.firstName();
        //     subject[i].last_name  = faker.name.lastName();
        //     subject[i].address  = faker.address.streetAddress();
        //     subject[i].email = faker.internet.email();

        //     p = p.then(() => delay(createSubject(subject[i])))
        //         .then(() => console.log(new Date().toLocaleString()));
        // }
    })
}
async function StoreMedicalCodesBlockchain() {
    jsonReader('files/medical_codes_4000.json', (err, subject) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(subject); // Total Subjects
        
        //processCodes(subject)  // Uncomment this for medical codes
    })
}
async function processCodes(new_array) { // We need to wrap the loop into an async function for this to work
    
    let length = (new_array).length;
    let chunk = 250;
    let startTime = new Date().toLocaleString();
    let loopLength = Math.ceil(((new_array).length)/chunk);
    let k = 0,stopSize=0,mStop=0,Records=0;
    let array_size = 0, array_data;
    for (let j = 0; j < loopLength; j++) {
        // await timer(3000);
        if (length < chunk) {
            chunk = length;
        }
        stopSize = stopSize+chunk;
        mStop = mStop+chunk;
        Records = Records+chunk;
        // if(stopSize>3000){
        //     console.log(`Stopping for 10 seconds Reached ${Records} Records`);
        //     stopSize = 0;
        //     await timer(10000);
        // }
        if(mStop>450){
            console.log(`Stopping for 10 seconds Reached ${Records} Records`);
            mStop = 0;
            await timer(10000);
        }
        array_size = ((new_array).slice(k, chunk + k)).length;
        array_data = ((new_array).slice(k, chunk + k));
        //createMedicalCodes(array_data);
        createMedicalCodes(array_data)
        
        k = k + chunk;
        length = length - chunk;
        console.log(`Remaining ${length} Items`);
        console.log(` ${array_size} Items Processed`);
        
        if(array_size<1){
            console.log('Records Processed SuccessFully');
            return process.exit(0);
        }
    }
    console.log('Loop Ended All Medical Codes Completed');
    console.log(startTime);
    console.log(new Date().toLocaleString());
    return process.exit(0);
}
async function processSubjects(new_array) { // We need to wrap the loop into an async function for this to work
    let length = (new_array).length;
    let chunk = 100;
    let loopLength = Math.ceil(((new_array).length)/chunk);
    

    let k = 0,stopSize=0,mStop=0,Records=0;
    let array_size = 0, array_data;
    for (let j = 0; j < loopLength; j++) {
        //await timer(10000);
        if (length < chunk) {
            chunk = length;
        }
        array_size = ((new_array).slice(k, chunk + k)).length;
        array_data = ((new_array).slice(k, chunk + k));
        stopSize = stopSize+chunk;
        mStop = mStop+chunk;
        Records = Records+chunk;
        // if(stopSize>3000){
        //     console.log(`Stopping for 10 seconds Reached ${Records} Records`);
        //     stopSize = 0;
        //     await timer(10000);
        // }
        if(mStop>100){
            console.log(`Stopping for 10 seconds Reached ${Records} Records`);
            mStop = 0;
            await timer(10000);
        }
        createSubject(array_data);
        k = k + chunk;
        length = length - chunk;
        console.log(`Remaining ${length} Items`);
        console.log(`Length ${array_size} Found`); 
    }
    console.log('Loop Ended All Subjects Completed');
    return process.exit(0);
}
async function createSubject(subject) {
    let user = 'admin';
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        // console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(`An identity for the user ${user} does not exist in the wallet`);
        }


        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        //await gateway.connect(ccp, connectionOptions);
        const connectionOptions = {
            identity: user,
            wallet: wallet,
            eventHandlerOptions: {
              commitTimeout: 1000000,
              strategy:null
              },
              discovery:{ enabled: true, asLocalhost: true }
            };
        await gateway.connect(ccp, connectionOptions);
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        const mNetwork = await gateway.getNetwork('medicalcodes');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        const mContract = mNetwork.getContract('medicalcode');
        
        let medical_codes;
        let j = 0;
        for (let i = 0; i < subject.length; i++) {
            // subject[i].firstName = faker.name.firstName();
            // subject[i].lastName = faker.name.lastName();
            // subject[i].address = faker.address.streetAddress();
            // subject[i].email = faker.internet.email();
            subject[i].docType = 'subject'
            //medical_codes = subject[i].medical_codes;
            delete subject[i].medical_codes;
            let result = await Promise.resolve(contract.submitTransaction('createSubject', subject[i].subject_id, JSON.stringify(subject[i])));
            
            // for (j = 0; j < 500; j++) {
            //     medical_codes[j].subject_id = subject[i].subject_id;
            //     mContract.submitTransaction('createMedicalCode', JSON.stringify(medical_codes[j]))
            //     console.log(`Entries: ${j}`)
            // }
            console.log(new Date().toLocaleString(), subject[i].subject_id);
        }


        // Disconnect from the gateway.
        await gateway.disconnect();

        //  console.log(`Successfully created Subjects`);
    }
    catch (error) {
        console.log(`Failed to create Subject: ${error}`);
        return false;
    }
}
async function createMedicalCodes(subject) {
    let user = 'admin';
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        // console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(`An identity for the user ${user} does not exist in the wallet`);
        }


        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        const connectionOptions = {
            identity: user,
            wallet: wallet,
            eventHandlerOptions: {
              commitTimeout: 1000000,
              strategy:null
              },
              discovery:{ enabled: true, asLocalhost: true }
            };
        //await gateway.connect(ccp, connectionOptions);
        await gateway.connect(ccp, connectionOptions);
        // Get the network (channel) our contract is deployed to.
        const mNetwork = await gateway.getNetwork('medicalcodes');
        // Get the contract from the network.
        const mContract = mNetwork.getContract('medicalcode');
        // const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        // for (let i = 0, p = Promise.resolve(); i < subject.length; i++) {
        //     subject[i].first_name  = faker.name.firstName();
        //     subject[i].last_name  = faker.name.lastName();
        //     subject[i].address  = faker.address.streetAddress();
        //     subject[i].email = faker.internet.email();
        //     subject[i].docType = 'subject'

        //     p = p.then(() => delay(contract.submitTransaction('createSubject', subject[i].subject_id, JSON.stringify(subject[i]))))
        //         .then(() => console.log(`Successfully created Subject`));
        // }
        let medical_codes;
        for (let j = 0; j < subject.length; j++) {
            subject[j].medical_code_id = uuidv4();
            mContract.submitTransaction('createMedicalCode', JSON.stringify(subject[j]))
            
        }
        console.log(new Date().toLocaleString());
        //console.log(new Date().toLocaleString(), subject[j].subject_id);

        return true;
        // Disconnect from the gateway.
        //await gateway.disconnect();

        //  console.log(`Successfully created Subjects`);
    }
    catch (error) {
        console.log(`Failed to create Subject: ${error}`);
        return false;
    }
}
// Create Trials
async function createClinicalTrial(trialData){
    {
        let user = 'admin';
        //let trialData = req.body;
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'walletPharma');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get(user);
            if (!identity) {
                console.log(`An identity for the user ${user} does not exist in the wallet`);
            }
    
            // Create a new gateway for connecting to our peer node.
            const connectionOptions = {
                identity: user,
                wallet: wallet,
                eventHandlerOptions: {
                  commitTimeout: 1000000,
                  strategy:null
                  },
                  discovery:{ enabled: true, asLocalhost: true }
                };
            const gateway = new Gateway();
            await gateway.connect(ccp, connectionOptions);
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('trials');
            // Get the contract from the network.
            const contract = network.getContract('clinicaltrial');
            // for (let j = 0; j < trialData.length; j++) {
            //     contract.submitTransaction('createTrial', trialData[j].trial_id, JSON.stringify(trialData[j]));
                
            // }
            contract.submitTransaction('createTrial', trialData.trial_id, JSON.stringify(trialData));
            //const result = await contract.submitTransaction('createTrial', trialData.trial_id, JSON.stringify(trialData));
    
            // Disconnect from the gateway.
            console.log(new Date().toLocaleString());
            await gateway.disconnect();
            
        }
        catch (error) {
            console.log(`Failed to create Subject: ${error}`);
            return false;
        }
    }
}
function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch (err) {
            return cb && cb(err)
        }
    })
}
//StoreSubjectsBlockchain();
StoreMedicalCodesBlockchain();
