/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');
//const Helpers = require('../utils/helpers');

exports.createTrial = async (req, res) => {
    let user = 'admin';
    let trialData = req.body;
    trialData.docType = 'trial'
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        const result = await contract.submitTransaction('createTrial', trialData.NCTCode, JSON.stringify(trialData));

        // Disconnect from the gateway.
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: `Successfully created Trial`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Failed to create Trial: ${error}`
        });
    }
}
exports.getTrial = async (req, res) => {
    let user = 'admin';
    let trialId = req.params.trialId;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        const result = await contract.evaluateTransaction('queryTrial', trialId);
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Trial returned Successfully',
            data: JSON.parse(result)
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}
exports.getAllTrials = async (req, res) => {
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network. 
        const contract = network.getContract('clinicaltrial');
        let result = await contract.evaluateTransaction('queryAllTrials',limit,bookmark);
        result     = JSON.parse(result);
        await gateway.disconnect();
        let response = new Object();
        response.status=true;
        response.message='Trial returned Successfully';
        response.data=result.data;
        response.pagination=result.pagination;
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}
exports.getTrialsByStatus = async (req, res) => {
    let user = 'admin';
    
    let status = req.params.status;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        let result = await contract.evaluateTransaction('QueryTrialsByStatus', status,limit,bookmark);
        result     = JSON.parse(result);
        await gateway.disconnect();
        let response = new Object();
        response.status=true;
        response.message='Trial returned Successfully';
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
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}
exports.updateTrialByStatus = async (req, res) => {
    let user = 'admin';
    let status = req.body.status;
    let trialId = req.body.trial_id;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        const result = await contract.submitTransaction('updateTrialStatus', trialId, status);
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Trials status updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}
exports.updateTrial = async (req, res) => {
    let user = 'admin';
    let body = req.body;
    let trialId = req.body.trial_id;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        const result = await contract.submitTransaction('updateTrial', trialId, JSON.stringify(body));
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Trial updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}
// Get Trial Site
exports.getTrialSites = async (req, res) => {
    let user = 'admin';
    let trialId = req.params.trialId;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        let result = await contract.evaluateTransaction('queryTrial', trialId);
        result = JSON.parse(result);
        let sites = result.sites;
        if (!sites) {
            sites = new Array();
        }
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Trial Sites returned Successfully',
            data: sites
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}
// Add Trial Site
exports.addTrialSite = async (req, res) => {
    let user = 'admin';
    
    const trialId = req.body.trialId;
    const siteData = req.body.site;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        let result = await contract.evaluateTransaction('queryTrial', trialId);
        result = JSON.parse(result);
        if (result.sites) {
            let siteKey = result.sites.findIndex(o => o.site_id === siteData.site_id);
            //console.log(siteKey);
            if (siteKey>-1) {
                res.status(422).json({
                    status: false,
                    message: `Site ${siteData.site_id} does not exist`
                });
            }
            result.sites.push(siteData);
        }else{
            result.sites = [siteData];
        }
        let codes = result.subject_data.zip_codes;
        if (codes) {
            (siteData.zip_codes).map(element => {
                codes.push(element)
            });
        }else{
            codes = siteData.zip_codes;
        }
        result.subject_data.zip_codes = [... new Set(codes)];
        //console.log(result);
        await contract.submitTransaction('updateTrial', trialId, JSON.stringify(result));
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Site Added Successfully'
        });
    }
    catch (error) {
        // res.status(500).json({
        //     status: false,
        //     message: `Trial Returned with Error: ${error}`
        // });
    }
}

// Update Trial SIte Status
exports.updateTrialSiteStatus = async (req, res) => {
    let user = 'admin';
    
    const trialId = req.body.trialId;
    const siteId = req.body.siteId;
    const status = req.body.status;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        let result = await contract.evaluateTransaction('queryTrial', trialId);
        result = JSON.parse(result);
        if (result.sites) {
            let site = result.sites.find(o => o.site_id === siteId);
            let siteKey = result.sites.findIndex(o => o.site_id === siteId);
            if (site) {
                console.log('Site Found')
                site.status = status;
            result.sites.splice(siteKey, 1, site);
            } else {
                res.status(422).json({
                    status: false,
                    message: `Site ${siteId} does not exist`
                });
            }
        }else{
            res.status(422).json({
                status: false,
                message: `Site ${siteId} does not exist`
            });
        }
        console.log(result);
        await contract.submitTransaction('updateTrial', trialId, JSON.stringify(result));
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Site Added Successfully'
        });
    }
    catch (error) {
        // res.status(500).json({
        //     status: false,
        //     message: `Trial Returned with Error: ${error}`
        // });
    }
}
exports.getTrialsByQuery = async (req, res) => {
    let user = 'admin';
    let status = req.body.status;
    let pharma = req.body.Pharma;
    let clinical = req.body.Clinical;
    let insurance = req.body.Insuranace;
    let age = req.body.age;
    let zip_codes = req.body.zip_codes;
    let gender = req.body.gender;
    let diagnosis_code = req.body.diagnosis_code;
    let reference_id = req.body.reference_id;
    let reference_type = req.body.reference_type;
    let lAge = req.body.lAge;
    let gAge = req.body.gAge;
    //let date = req.body.date;
    let startdate = req.body.startdate;
    let enddate = req.body.enddate;
    let NCTCode = req.body.NCTCode;
    let name = req.body.name;
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
        const network = await gateway.getNetwork('trials');
        // Get the contract from the network.
        const contract = network.getContract('clinicaltrial');
        let query = new Array();
        let final = new Array();
        let maxAge = new Array();
        let minAge = new Array();
        let maxDate = new Array();
        let minDate = new Array();
        let i_codes = new Array();
        let in_codes = new Object();
        let zip_query = new Array();
        let regex_query = new Array();
        if (clinical) {
            regex_query['$regex']     =   `^${clinical}`;
            query["Clinical"] = Object.assign({}, regex_query);
        }
        if (NCTCode) {
            regex_query['$regex']     =   `^${NCTCode}`;
            query["NCTCode"] = Object.assign({}, regex_query);
        }
        if (name) {
            regex_query['$regex']     =   `^${name}`;
            query["name"] = Object.assign({}, regex_query);
        }
        
        if (pharma) {
            regex_query['$regex']     =   `^${pharma}`;
            query["Pharma"] = Object.assign({}, regex_query);
        }
        if (insurance) {
            regex_query['$regex']     =   `^${insurance}`;
            query["Insurance"] = Object.assign({}, regex_query);
        }
        if (status) {
            query["status"] = status;
        }
        if (gender) {
            query["subject_data.gender"] = gender;
        }
        if(zip_codes){
            zip_query["$in"] =   zip_codes;
            query["subject_data.zip_codes"] =   Object.assign({}, zip_query);
        }
        if (enddate) {
            minDate['$lte']    =   enddate;
            query["enddate"] = Object.assign({}, minDate);
        }
        if (startdate) {
            maxDate['$gte']    =   startdate;
            query["startdate"] = Object.assign({}, maxDate);
        }
        // if (age) {
        //     maxAge['$gte']    =   age;
        //     minAge['$lte']    =   age;
        //     query["subject_data.maxAge"] = Object.assign({}, maxAge);
        //     query["subject_data.minAge"] = Object.assign({}, minAge);
        // }
        if (gAge) {
            minAge['$gte']  =   gAge;
            query["subject_data.minAge"]    = Object.assign({}, minAge);
        }
        if(lAge){
            maxAge['$lte']  =   lAge;
            query["subject_data.maxAge"]    = Object.assign({}, maxAge);
        }
        if (diagnosis_code) {
            in_codes.diagnosis_code = diagnosis_code;
            i_codes["$elemMatch"] = in_codes
        }
        if (reference_id) {
            in_codes.reference_id = reference_id;
            i_codes["$elemMatch"] = in_codes
        }
        if (reference_type) {
            in_codes.reference_type = reference_type;
            i_codes["$elemMatch"] = in_codes
        }
        in_codes = Object.assign({}, i_codes);
        if(Object.keys(in_codes).length>0){
             query["inclusive_codes"]    =   in_codes;
        }
        final["selector"] = Object.assign({}, query);
        console.log(JSON.stringify(Object.assign({}, final)));
        let result = await contract.evaluateTransaction('QueryTrials', JSON.stringify(Object.assign({}, final)),limit,bookmark);
        result     = JSON.parse(result);
        await gateway.disconnect();
        let response = new Object();
        response.status=true;
        response.message='Trials returned Successfully';
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
            message: `Query Trial Returned with Error: ${error}`
        });
    }
}

