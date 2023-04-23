/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


exports.getMedicalCodes = async (req, res) => {
  let user = 'admin';
  let subject_id = req.body.subject_id;
  let diagnosis_code = req.body.diagnosis_code;
  let reference_id = req.body.reference_id;
  let reference_type = req.body.reference_type;
  let limit = req.query.limit;
  let bookmark = req.query.bookmark;
  let mQuery = '';
  if (!limit) {
    limit = 10;
  }
  if (!bookmark) {
    if (!bookmark) {
      bookmark = '';
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
        console.log(`An identity for the user ${user} does not exist in the wallet`);
        console.log('Register User before retrying');
        return;
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
      const network = await gateway.getNetwork('medicalcodes');
      const contract = network.getContract('medicalcode');
      if (diagnosis_code && reference_id && reference_type) {
        mQuery = `{"selector":{"subject_id":"${subject_id}","diagnosis_code":"${diagnosis_code}","reference_id":"${reference_id}","reference_type":"${reference_type}"}}`
      } else if (diagnosis_code) {
        mQuery = `{"selector":{"subject_id":"${subject_id}","diagnosis_code":"${diagnosis_code}"}}`
      } else {
        mQuery = `{"selector":{"subject_id":"${subject_id}"}}`
      }
      console.log(mQuery);
      let result = await contract.evaluateTransaction('queryMedicalCodes', mQuery, limit, bookmark);
      result = JSON.parse(result);

      await gateway.disconnect();
      let response = new Object();
      response.status = true;
      response.message = 'Medical Codes returned Successfully';
      response.data = result.data;
      response.pagination = result.pagination;
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: `Medical Codes Returned with Error: ${error}`
      });
    }
  }
}