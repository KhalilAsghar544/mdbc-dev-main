/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Create Subject
exports.createSubject = async (req, res) => {
    let user = 'admin';
    let subjectData = req.body;
    subjectData.docType = 'subject'
    let medical_codes = subjectData.medical_codes;
    delete subjectData.medical_codes;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        //console.log(subjectData);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma'); 
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        //console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            res.status(500).json({
                status: false,
                message: `An identity for the user ${user} does not exist in the wallet`
            });
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
        await gateway.connect(ccp, connectionOptions);
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        const mNetwork = await gateway.getNetwork('medicalcodes');
        const mContract = mNetwork.getContract('medicalcode');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        let subjectId = subjectData.subject_id;
        // Get the contract from the network.
        
        const result = await contract.submitTransaction('createSubject', subjectId, JSON.stringify(subjectData));
        for (let j = 0; j < medical_codes.length; j++) {
            medical_codes[j].subject_id    =  subjectId;
            medical_codes[j].docType    =  "medicalcode";

            mContract.submitTransaction('createMedicalCode', JSON.stringify(medical_codes[j]))
            
        }
        // Disconnect from the gateway.
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: `Successfully created Subject`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Failed to create Subject: ${error}`
        });
    }
}

exports.getSubject = async (req, res) => {
    let user = 'admin';
    let subjectId = req.params.subjectId;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            res.status(500).json({
                status: false,
                message: `An identity for the user ${user} does not exist in the wallet`
            });
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        const result = await contract.evaluateTransaction('querySubject', subjectId);
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Subject returned Successfully',
            data: JSON.parse(result)
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Subject Returned with Error: ${error}`
        });
    }
}
exports.getAllSubjects = async (req, res) => {
    let user = 'admin';
    let limit = req.query.limit;
    let bookmark = req.query.bookmark;
    if(!limit){
        limit = 10;
    }
    if(!bookmark){
        bookmark='';
    }
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            res.status(500).json({
                status: false,
                message: `An identity for the user ${user} does not exist in the wallet`
            });
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        // Get the contract from the network.
         const contract = network.getContract('insurancesubject');
        // const contract = network.getContract('clinicaltrial','InsuranceSubject');
        let result = await contract.evaluateTransaction('queryAllSubjects',limit,bookmark);
        result     = JSON.parse(result);
        await gateway.disconnect();
        let response = new Object();
        response.status=true;
        response.message='Subjects returned Successfully';
        response.data=result.data;
        response.pagination=result.pagination;
        res.status(200).json(response);
        // res.status(200).json({
        //     status: true,
        //     message: 'Subjects returned Successfully',
        //     data: JSON.parse(result)
        // });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Subject Returned with Error: ${error}`
        });
    }
}
exports.updateSubject = async (req, res) => {
    let user = 'admin';
    let body = req.body;
    let subjectId = req.body.subject_id;
    let medical_codes = body.medical_codes;
    delete body.medical_codes;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            res.status(500).json({
                status: false,
                message: `An identity for the user ${user} does not exist in the wallet`
            });
        }
        const connectionOptions = {
            identity: user,
            wallet: wallet,
            eventHandlerOptions: {
              commitTimeout: 1000000,
              strategy:null
              },
              discovery:{ enabled: true, asLocalhost: true }
            };
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectionOptions);
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        const mNetwork = await gateway.getNetwork('medicalcodes');
        const mContract = mNetwork.getContract('medicalcode');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        const result = await contract.submitTransaction('updateSubject',subjectId,JSON.stringify(body));
        for (let j = 0; j < medical_codes.length; j++) {
            medical_codes[j].subject_id    =  subjectId;
            medical_codes[j].docType    =  "medicalcode";

            mContract.submitTransaction('createMedicalCode', JSON.stringify(medical_codes[j]))
            
        }
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Subject updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Subject Returned with Error: ${error}`
        });
    }
}
exports.getSubjectsByQuery = async (req, res) => {
    let user = 'admin';
    // let sort = req.body.sort;
    let lAge = req.body.lAge;
    let gAge = req.body.gAge;
    //let zipCode = req.body.zipCode;
    let zip_codes = req.body.zip_codes;
    let zipCode   = req.body.zipCode;
    if (zipCode) {
        zip_codes = [zipCode];
    }
    let gender = req.body.gender;
    let consent = req.body.consent;
    let diagnosis_code = req.body.diagnosis_code;
    let reference_id = req.body.reference_id;
    let reference_type = req.body.reference_type;
    let state = req.body.state;
    let city = req.body.city;
    let email = req.body.email;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let limit = req.query.limit;
    let bookmark = req.query.bookmark;
    if(!limit){
        limit = 10;
    }
    if(!bookmark){
        bookmark='';
    }
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            res.status(500).json({
                status: false,
                message: `An identity for the user ${user} does not exist in the wallet`
            });
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        const mNetwork = await gateway.getNetwork('medicalcodes');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        const mContract = mNetwork.getContract('medicalcode');
        let query = new Array();
        let final = new Array();
        let AgeFilter = new Array();
        let i_codes = new Array();
        let m_codes = new Object();
        let regex_query = new Array();
        let sort = new Array();
        let index = new Array();
        let zip_query = new Array();
        let zip_object = new Object();
        sort["subject_id"] =  "asc" ;
        index["_design/indexSubjectDoc"] =  "indexSubject" ;
        i_codes =  Object.assign({}, sort) ;
        if (gender) {
            query["gender"] = gender;
        }
        if (zip_codes) {
            zip_codes.map(function(val,index){
                //regex_query['$regex']     =   `^${val}`;
                zip_query.push({
                    "zipCode":{"$regex":`^${val}`}
                })
            });
            //zip_object["$in"] =   zip_query;
            query["$or"] =   zip_query;
            //query["zipCode"] = zipCode;
        }
        if (consent) {
            query["consent"] = consent;
        }
        if (state) {
            query["state"] = state;
        }
        if (city) {
            query["city"] = city;
        }
        if (email) {
            regex_query['$regex']     =   `^${email}`;
            query["email"] = Object.assign({}, regex_query);
        }
        if (firstName) {
            regex_query['$regex']     =   `^${firstName}`;
            query["firstName"] = Object.assign({}, regex_query);
        }
        if (lastName) {
            regex_query['$regex']     =   `^${lastName}`;
            query["lastName"] = Object.assign({}, regex_query);
        }
        if (gAge) {
            AgeFilter['$gte']  =   gAge;
            query["age"]    = Object.assign({}, AgeFilter);
        }
        if(lAge){
            AgeFilter['$lte']  =   lAge;
            query["age"]    = Object.assign({}, AgeFilter);
        }
        // if (diagnosis_code) {
        //     //m_codes.diagnosis_code = diagnosis_code;
        //     diagnosis_code = `diagnosis_code:${diagnosis_code}`
        //     //i_codes["$elemMatch"] = m_codes
        // }
        // if (reference_id) {
        //     //m_codes.reference_id = reference_id;
        //     reference_id = `reference_id:${reference_id}`
        //     //i_codes["$elemMatch"] = m_codes
        // }
        // if (reference_type) {
        //     //.reference_type = reference_type;
        //     //i_codes["$elemMatch"] = m_codes
        // }
        // m_codes = Object.assign({}, i_codes);
        // if(Object.keys(m_codes).length>0){
        //      query["medical_codes"]    =   m_codes;
        // }
        final["selector"] = Object.assign({}, query);
        
        //final["sort"] = [i_codes];
        //final["use_index"] = ["_design/indexSubjectDoc","indexSubject"];
        console.log(JSON.stringify(Object.assign({}, final)));
        let result = await contract.evaluateTransaction('QuerySubjects', JSON.stringify(Object.assign({}, final)),limit,bookmark);
        result     = JSON.parse(result);
        let subject_array = new Array();
        let mQuery = '';
        (result.data).forEach(element => {
            subject_array.push(element.subject_id)
          });
        if(diagnosis_code && reference_id && reference_type){
        mQuery  =   `{"selector":{"diagnosis_code":"${diagnosis_code}","reference_id":"${reference_id}","reference_type":"${reference_type}","subject_id":{ 
            "$in": 
                ${JSON.stringify(subject_array)}
            }}}`
        }else if(diagnosis_code){
        mQuery  =   `{"selector":{"diagnosis_code":"${diagnosis_code}","subject_id":{ 
            "$in": 
                ${JSON.stringify(subject_array)}
            }}}`
        }
        if(mQuery){
            let mResult = await mContract.evaluateTransaction('queryMedicalCodes',mQuery,'10000','');
            subject_array = [];
            mResult =   JSON.parse(mResult.toString());
            (mResult.data).forEach(element => {
            if(!subject_array.includes(element.subject_id)){
                subject_array.push(element.subject_id) 
            }});
            let result2 = await contract.evaluateTransaction('QuerySubjects', `{"selector":{"subject_id":{ 
                "$in": 
                    ${JSON.stringify(subject_array)}
                }}}`, limit, '');
                result2 =   JSON.parse(result2.toString());
                await gateway.disconnect();
                let response = new Object();
                response.status=true;
                response.message='Subjects returned Successfully';
                response.data=result2.data;
                response.pagination=result.pagination;
                res.status(200).json(response);
        }else{
            await gateway.disconnect();
            let response = new Object();
            response.status=true;
            response.message='Subjects returned Successfully';
            response.data=result.data;
            response.pagination=result.pagination;
            res.status(200).json(response);
        }
        
        // res.status(200).json({
        //     status: true,
        //     message: 'Trials returned Successfully',
        //     data: JSON.parse(result)
        // });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Subject Returned with Error: ${error}`
        });
    }
}
exports.getSubjectsByFreeSearch = async (req, res) => {
    let user = 'admin';
    // let sort = req.body.sort;
    let lAge = req.body.lAge;
    let gAge = req.body.gAge;
    let zipCodes = new Array();
    zipCodes = req.body.zipCodes;
    let zip_query = new Array();
    let gender = req.body.gender;
    let consent = true;
    let limit = req.query.limit;
    let bookmark = req.query.bookmark;
    let inclusive_codes = new Array();
    let exclusive_codes = new Array();
    let inclusive_decode = new Array();
    let exclusive_decode = new Array();
    
    inclusive_codes = req.body.inclusive_codes;
    exclusive_codes = req.body.exclusive_codes;
    inclusive_codes.forEach(element => {
        inclusive_decode.push(element.diagnosis_code)
    });
    exclusive_codes.forEach(element => {
        exclusive_decode.push(element.diagnosis_code)
    });
    inclusive_decode = JSON.stringify(inclusive_decode);
    exclusive_decode = JSON.stringify(exclusive_decode);
    if(!limit){
        limit = 10;
    }
    if(!bookmark){
        bookmark='';
    }
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            res.status(500).json({
                status: false,
                message: `An identity for the user ${user} does not exist in the wallet`
            });
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('subjects');
        // Get the contract from the network.
        const contract = network.getContract('insurancesubject');
        const mdNetwork = await gateway.getNetwork('medicalcodes');
        const mdContract = mdNetwork.getContract('medicalcode');
        let ZipCodeQuery = '';
        let medical_codes = '';
        let Data = '';
        let queryFormat = 1;
        let queryType = 's';
        let subject_query = `"gender":"${gender}",
        "consent":${consent},"age":{"$gte": "${gAge}", "$lte":"${lAge}"}`;
        if(zipCodes && zipCodes.length>0){
            ZipCodeQuery = `"zipCode": { 
                "$in": 
                    ${JSON.stringify(zipCodes)}
                }`;
                queryType = queryType.concat('_z');
        }
        if(inclusive_codes.length>0 && exclusive_codes.length>0){
            medical_codes = `"diagnosis_code":{
                "$in": ${inclusive_decode}
            },
            "$not":{
                "diagnosis_code":{
                    "$in": ${exclusive_decode}
                }
            }`;
            queryType = queryType.concat('_m');
        }else if(inclusive_codes.length==0 && exclusive_codes.length>0){
            medical_codes = `"$not":{
                "diagnosis_code":{
                    "$in": ${exclusive_decode}
                }
            }`;
            queryType = queryType.concat('_m');
        }else if (inclusive_codes.length>0 && exclusive_codes.length==0){
            medical_codes = `"diagnosis_code":{
                "$in": ${inclusive_decode}
            }`;
            console.log(medical_codes)
            queryType = queryType.concat('_m');
        }
        console.log(queryType);
        switch(queryType){
            case('s'):
                Data = `${subject_query}`;
                break;
            case('s_z'):
                Data = `${subject_query},${ZipCodeQuery}`;
                break;
            case('s_z_m'):
                Data = `${subject_query},${ZipCodeQuery}`;
                queryFormat = 2;
                break;
            case('s_m'):
                Data = `${subject_query}`;
                queryFormat =2;
                break;
            default:
                Data = `${subject_query}`;
                break;
        }
        console.log(`{"selector":{${Data} }}`);
        let subjects = '';
        let subject_array = new Array();
        switch(queryFormat){
            case 1:
                subjects = await contract.evaluateTransaction('QuerySubjects',`{"selector":{${Data} }}`,limit,bookmark);
                break;
            case 2:
                let mResult = await mdContract.evaluateTransaction('queryMedicalCodes',`{"selector":{${medical_codes} }}`,'10000',bookmark);
                mResult = JSON.parse(mResult);
                //pagination  =   mResult.pagination;
                (mResult.data).forEach(element => {
                    subject_array.push(element.subject_id)
                });
                subjects = await contract.evaluateTransaction('QuerySubjects', `{"selector":{${Data},"subject_id":{ 
                    "$in": 
                        ${JSON.stringify(subject_array)}
                    } }}`, limit, '');
                
                break;
        }
        let result     = JSON.parse(subjects);
        await gateway.disconnect();
        let response = new Object();
        response.status=true;
        response.message='Subjects returned Successfully';
        response.data=result.data;
        response.pagination=result.pagination;
        res.status(200).json(response);
        // res.status(200).json({
        //     status: true,
        //     message: 'Trials returned Successfully',
        //     data: JSON.parse(result)
        // });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Subject Returned with Error: ${error}`
        });
    }
}
