/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Create Device Data
exports.createDeviceData = async (req, res) => {
    let user = 'admin';
    let deviceData = req.body;
    deviceData.docType = 'device'
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
        const network = await gateway.getNetwork('iotdevices');
        // Get the contract from the network.
        const contract = network.getContract('iotdevice');
        const result = await contract.submitTransaction('createDevice', deviceData.subject_id, JSON.stringify(deviceData));

        // Disconnect from the gateway.
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: `Successfully created IOT Device Data`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: `Failed to create Subject: ${error}`
        });
    }
}

exports.getDeviceData = async (req, res) => {
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
        const network = await gateway.getNetwork('iotdevices');
        // Get the contract from the network.
        const contract = network.getContract('iotdevice');
        const result = await contract.evaluateTransaction('queryDevice', subjectId);
        await gateway.disconnect();
        res.status(200).json({
            status: true,
            message: 'Subject Device Data returned Successfully',
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