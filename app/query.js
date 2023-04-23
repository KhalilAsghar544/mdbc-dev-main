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

async function main() {
    let user = 'admin';
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
            console.log('Register User before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        const mNetwork = await gateway.getNetwork('medicalcodes');
        // Get the contract from the network.
        //   const contract = network.getContract('insurancesubject');
        const contract = network.getContract('insurancesubject');
        const mContract = mNetwork.getContract('medicalcode');

        // Insurance Subject
        // const result = await contract.evaluateTransaction('queryAllSubjects');

        // End Insurance Subject

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllTrials')
        //    const result = await contract.evaluateTransaction('queryAllTrials');
        let result = await contract.evaluateTransaction('QuerySubjects', `{"selector":{"gender":"male"}}`, '5', '');
        result = JSON.parse(result.toString());
        let subject_array = new Array();
        (result.data).forEach(element => {
            subject_array.push(element.subject_id)
          });
         // console.log(subject_array);
          let mResult = await mContract.evaluateTransaction('queryMedicalCodes', `{"selector":{"diagnosis_code":"003","subject_id":{ 
            "$in": 
                ${JSON.stringify(subject_array)}
            }}}`, '10000', '');
            subject_array = [];
            mResult =   JSON.parse(mResult.toString());
            (mResult.data).forEach(element => {
            if(!subject_array.includes(element.subject_id)){
                subject_array.push(element.subject_id)
            }
      });
      result = await contract.evaluateTransaction('QuerySubjects', `{"selector":{"subject_id":{ 
        "$in": 
            ${JSON.stringify(subject_array)}
        }}}`, '30', '');
        //  const result = await contract.evaluateTransaction('GetAssetsByRangeWithPagination','','',2,0);
        //  const result = await contract.evaluateTransaction('QueryTrialsByStatus','in_progress');
        // const result = await contract.evaluateTransaction('queryTrial','0001');
        let age = 25;
        
        
        //  const result = await 
        // //  Tested Clinical, minage, maxage, gender combination
        //  contract.evaluateTransaction('QueryTrials',`{"selector":{"Clinical":"Jansen","subject_data.minAge":{"$lte": "${age}"},
        //  "subject_data.maxAge":{"$gte": "${age}"},"subject_data.zip_codes":{"$in": 
        //  ["6000"]}
        // }}`);
        // Tested With Matching Elements
        //  contract.evaluateTransaction('QueryTrials',`{"selector":{"inclusive_codes": { 
        //   "$elemMatch": 
        //       { 
        //         "diagnosis_code": "004"
        //       } 
        //   } }}`);
        console.log(JSON.parse(result.toString()));
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
async function search() {
    let user = 'admin';
    let trialId = '0008';
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletClinical');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(`An identity for the user ${user} does not exist in the wallet`);
            console.log('Register User before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('trials');
        const contract = network.getContract('clinicaltrial');
        let trial = await contract.evaluateTransaction('queryTrial', trialId);

        trial = JSON.parse(trial.toString());
        let subject_data = trial.subject_data;

        let zipCodes = JSON.stringify(subject_data.zip_codes);
        let gender = subject_data.gender;
        let consent = subject_data.consent;
        let minAge = subject_data.minAge;
        let maxAge = subject_data.maxAge;
        let inclusive_codes = trial.inclusive_codes;
        let exclusive_codes = trial.exclusive_codes;
        let diagnosis_codes = new Array();
        let regex_array = new Array();
        let regex_array_ex = new Array();
        let inclusive_regex_diagnosis = new Array();
        let inclusive_regex_reference_id = new Array(); '';
        let diagnosis_codes_ex = new Array();
        inclusive_codes.forEach(element => {
            diagnosis_codes.push({
                diagnosis_code: element.diagnosis_code,
                reference_id: element.reference_id,
                reference_type: element.reference_type,
            })
        });
        exclusive_codes.forEach(element => {
            diagnosis_codes_ex.push({
                diagnosis_code: element.diagnosis_code,
                reference_id: element.reference_id,
                reference_type: element.reference_type,
            })
        });
        inclusive_codes.forEach(element => {
            inclusive_regex_diagnosis['$regex'] = `^${(element.diagnosis_code).substring(0, 2)}`;
            inclusive_regex_reference_id['$regex'] = `^${(element.reference_id).substring(0, 2)}`;
            regex_array.push({
                diagnosis_code: Object.assign({}, inclusive_regex_diagnosis),
                reference_id: Object.assign({}, inclusive_regex_reference_id),
                reference_type: element.reference_type,
            })
        });
        exclusive_codes.forEach(element => {
            inclusive_regex_diagnosis['$regex'] = `^${(element.diagnosis_code).substring(0, 2)}`;
            inclusive_regex_reference_id['$regex'] = `^${(element.reference_id).substring(0, 2)}`;
            regex_array_ex.push({
                diagnosis_code: Object.assign({}, inclusive_regex_diagnosis),
                reference_id: Object.assign({}, inclusive_regex_reference_id),
                reference_type: element.reference_type,
            })
        });
        diagnosis_codes = JSON.stringify(diagnosis_codes);
        diagnosis_codes_ex = JSON.stringify(diagnosis_codes_ex);
        regex_array = JSON.stringify(regex_array);
        regex_array_ex = JSON.stringify(regex_array_ex);
        inclusive_codes = diagnosis_codes;
        exclusive_codes = diagnosis_codes_ex;

        const subjectNetwork = await gateway.getNetwork('subjects');
        const subjectContract = subjectNetwork.getContract('insurancesubject');
        // Subject Data Query
        // let medical_codes = `"medical_codes":{
        //     "$elemMatch": {
        //         "$or":${diagnosis_codes}
        //     }

        // }`;



        let medical_codes = `"medical_codes":{
            "$elemMatch": {
                "$or":${inclusive_codes}
            },
            "$not": {
                "$elemMatch": {
                    "$or":${exclusive_codes}
                }
            
            }
            
        }`;
        medical_codes = `"medical_codes":{
            "$elemMatch": {
                "$or":${regex_array}   
            },
            "$not": {
                "$elemMatch": {
                    "$or":${regex_array_ex}
                }
            
            }
        }`;
        console.log(regex_array);
        const subjects = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{"gender":"${gender}",
        "consent":${consent},"age":{"$gte": "${minAge}", "$lte":"${maxAge}"},"zipCode": { 
            "$in": 
                ${zipCodes}
            },${medical_codes} }}`, '5', '');

        console.log(JSON.parse(subjects.toString()));
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
async function StoreSubjectsBlockchain() {
    jsonReader('files/medical_codes_4000.json', (err, subject) => {
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
        
        //processSubjects(subject); // Uncomment this for subjects
        
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
async function StoreTrialsBlockchain() {
    jsonReader('files/singleTrial.json', (err, trial) => {
        if (err) {
            console.log(err)
            return
        }
        
        //console.log(trial); // Total Trials
        //processTrials(trial);
        createClinicalTrial(trial);

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
async function processTrials(new_array) { // We need to wrap the loop into an async function for this to work
    let length = (new_array).length;
    let chunk = 50;
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
        if(mStop>49){
            console.log(`Stopping for 10 seconds Reached ${Records} Records`);
            mStop = 0;
            await timer(10000);
        }
        createClinicalTrial(array_data);
        k = k + chunk;
        length = length - chunk;
        console.log(`Remaining ${length} Items`);
        console.log(`Length ${array_size} Found`); 
    }
    console.log('Loop Ended All Trials Completed');
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
async function createSubjectSingle(subject) {
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
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        subject.first_name = faker.name.firstName();
        subject.last_name = faker.name.lastName();
        subject.address = faker.address.streetAddress();
        subject.email = faker.internet.email();
        subject.docType = 'subject';
        delete subject.medical_codes;
        await contract.submitTransaction('createSubject', subject.subject_id, JSON.stringify(subject))

        // Disconnect from the gateway.
        await gateway.disconnect();

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
//Append Medical Codes
async function TestCasesMedicalCodes() {
    let user = 'admin';
    let subject_id = '0004';
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
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        jsonReader('files/subjects.json', (err, subject) => {
            if (err) {
                console.log(err)
                return
            }
            let new_array = new Array();
            for (let i = 0; i < subject.length; i++) {
                if ((subject[i].medical_codes).length > 10000) {
                    new_array.push(subject[i]);
                }
            }
            let length = (new_array[0].medical_codes).length;
            let chunk = 5000;

            let j = 0, k = 0;;
            let array_size = 0;
            let array_data = new Array();
            for (i = 0; i < length; i++) {
                j++;
                if (length < chunk) {
                    chunk = length;
                }
                array_size = ((new_array[0].medical_codes).slice(k, chunk + k)).length;
                array_data = ((new_array[0].medical_codes).slice(k, chunk + k));
                k = k + chunk;
                length = length - chunk;
                //let result = await Promise.resolve(contract.submitTransaction('updateSubjectMedicalCodes', subject_id, JSON.stringify(array_data)));
                console.log(`Remaining ${length} Items`);
                console.log(`Length ${array_size} Found`);
            }
            console.log(`Loop Ran: ${j} times`)
        },
            //await contract.submitTransaction('updateSubjectMedicalCodes', subject_id, JSON.stringify(sample))

            // Disconnect from the gateway.
            await gateway.disconnect()
        );

        //  console.log(`Successfully created Subjects`);
    }
    catch (error) {
        console.log(`Failed to create Subject: ${error}`);
        return false;
    }
}
//  main();
async function getMedicalCodes() {
    let user = 'admin';
    let subject_id = '798775082';
    let errors = new Array();
    let limit = 75000;
    let bookmark = '';
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletClinical');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(`An identity for the user ${user} does not exist in the wallet`);
            console.log('Register User before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('medicalcodes');
        const contract = network.getContract('medicalcode');

        let result = await contract.evaluateTransaction('queryMedicalCodes', `{"selector":{"subject_id":"${subject_id}"}}`, limit, bookmark);
        result = JSON.parse(result);

        await gateway.disconnect();
        console.log((result.data).length);
    } catch (error) {
        console.log(`Medical Code Returned with Error: ${error}`);
    }
}
//StoreSubjectsBlockchain();
StoreTrialsBlockchain();
//main();
//getMedicalCodes();
