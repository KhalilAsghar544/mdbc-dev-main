/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

exports.searchSampleTrialSubjects = async (req, res) => {

    /*
    Modes:
    1. s_data : filter with only subject data   
    2. s_data_inc: filter with subject data and inclusive codes 
    3. s_data_inc_exc: filter with subject data, inclusive codes and exclusive codes 
    4. inc_only: filter with only inclusive codes 
    5. inc_exc: filter with inclusive codes and exclusive codes 
    6. s_data_ict_inc: filter with subject data and ICT inclusive codes
    7. s_data_ict_inc_ict_exc: filter with subject data, ICT inclusive codes and ICT exclusive codes
    8. s_data_ict_inc_exc: filter with subject data, ICT inclusive codes and exclusive codes
    9. s_data_inc_ict_exc: filter with subject data, inclusive codes and ICT exclusive codes
    10. s_data_ict_exc : filter with subject data, inclusive codes and ICT exclusive codes
    11. ict_inc: ICT inclusive codes only
    12. ict_inc_ict_exc: ICT inclusive codes and ICT exclusive codes
    13. ict_inc_exc: ICT inclusive codes and exclusive codes
    14. ict_exc: ICT  exclusive codes only
    15. ict_exc_inc: ICT  exclusive codes and inclusive codes
    16. exc_only: exclusive codes only
    */
    let user = 'admin';
    let trialId = req.body.trial_id;
    let errors = new Array();
    let mode = '';
    let limit = req.query.limit;
    let bookmark = req.query.bookmark;
    let queryType = 1;
    if (!limit) {
        limit = 10;
    }
    if (!bookmark) {
        bookmark = "";
    }
    if (req.body.mode) {
        mode = req.body.mode;
    }
    if (!trialId) {
        errors.push('TrialId is required');
    }
    if (errors.length > 0) {
        res.status(422).json({
            'status': false,
            'message': 'Please resolve following errors',
            errors: errors
        });
    }
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
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
        let diagnosis_codes_ex = new Array();
        let regex_array = new Array();
        let regex_array_ex = new Array();
        let inclusive_regex_diagnosis = new Array();
        let inclusive_regex_reference_id = new Array(); '';
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
            inclusive_regex_diagnosis['$regex'] = `^${(element.diagnosis_code).substring(0, 3)}`;
            inclusive_regex_reference_id['$regex'] = `^${(element.reference_id).substring(0, 3)}`;
            regex_array.push({
                diagnosis_code: Object.assign({}, inclusive_regex_diagnosis),
                reference_id: Object.assign({}, inclusive_regex_reference_id),
                reference_type: element.reference_type,
            })
        });
        exclusive_codes.forEach(element => {
            inclusive_regex_diagnosis['$regex'] = `^${(element.diagnosis_code).substring(0, 3)}`;
            inclusive_regex_reference_id['$regex'] = `^${(element.reference_id).substring(0, 3)}`;
            regex_array_ex.push({
                diagnosis_code: Object.assign({}, inclusive_regex_diagnosis),
                reference_id: Object.assign({}, inclusive_regex_reference_id),
                reference_type: element.reference_type,
            })
        });
        diagnosis_codes = JSON.stringify(diagnosis_codes);
        diagnosis_codes_ex = JSON.stringify(diagnosis_codes_ex);
        inclusive_codes = diagnosis_codes;
        exclusive_codes = diagnosis_codes_ex;
        regex_array = JSON.stringify(regex_array);
        regex_array_ex = JSON.stringify(regex_array_ex);
        const subjectNetwork = await gateway.getNetwork('subjects');
        const subjectContract = subjectNetwork.getContract('insurancesubject');
        const mNetwork = await gateway.getNetwork('mappings');
        const mContract = mNetwork.getContract('maptrial');
        let subject_query = `"gender":"${gender}",
        "consent":${consent},"age":{"$gte": "${minAge}", "$lte":"${maxAge}"},"zipCode": { 
            "$in": 
                ${zipCodes}
            }`;
        let querySubjects = `${subject_query}`;
        let medical_codes = '';
        switch (mode) {
            case 's_data':
                querySubjects = `${subject_query}`;
                break;
            case 's_data_inc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${inclusive_codes}
                    }
                    
                }`;
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 's_data_inc_exc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${inclusive_codes}
                    },
                    "$not": {
                        "$elemMatch": {
                            "$or":${exclusive_codes}
                        }
                    }
                    
                }`;
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 'inc_only':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${inclusive_codes}
                    }
                    
                }`;
                querySubjects = `${medical_codes}`;
                break;
            case 'inc_exc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${inclusive_codes}
                    },
                    "$not": {
                        "$elemMatch": {
                            "$or":${exclusive_codes}
                        }
                    
                    }
                    
                }`;
                querySubjects = `${medical_codes}`;
                break;
            case 's_data_ict_inc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${regex_array}   
                    }
                }`;
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 's_data_ict_inc_ict_exc':
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
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 's_data_ict_inc_exc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${regex_array}   
                    },
                    "$not": {
                        "$elemMatch": {
                            "$or":${exclusive_codes}
                        }
                    }
                }`;
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 's_data_inc_ict_exc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${inclusive_codes}   
                    },
                    "$not": {
                        "$elemMatch": {
                            "$or":${regex_array_ex}
                        }
                    
                    }
                }`;
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 's_data_ict_exc':
                medical_codes = `"medical_codes":{
                    "$not": {
                        "$elemMatch": {
                            "$or":${regex_array_ex}
                        }
                    
                    }
                }`;
                querySubjects = `${subject_query},${medical_codes}`;
                break;
            case 'ict_inc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${regex_array}   
                    }
                }`;
                querySubjects = `${medical_codes}`;
                break;
            case 'ict_inc_ict_exc':
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
                querySubjects = `${medical_codes}`;
                break;
            case 'ict_inc_exc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${regex_array}   
                    },
                    "$not": {
                        "$elemMatch": {
                            "$or":${exclusive_codes}
                        }
                    }
                }`;
                querySubjects = `${medical_codes}`;
                break;
            case 'ict_exc':
                medical_codes = `"medical_codes":{
                    "$not": {
                        "$elemMatch": {
                            "$or":${regex_array_ex}
                        }
                    
                    }
                }`;
                querySubjects = `${medical_codes}`;
                break;
            case 'ict_exc_inc':
                medical_codes = `"medical_codes":{
                    "$elemMatch": {
                        "$or":${inclusive_codes}   
                    },
                    "$not": {
                        "$elemMatch": {
                            "$or":${regex_array_ex}
                        }
                    
                    }
                }`;
                querySubjects = `${medical_codes}`;
                break;
            case 'exc_only':
                medical_codes = `"medical_codes":{
                    "$not": {
                        "$elemMatch": {
                            "$or":${exclusive_codes}
                        }
                    }
                }`;
                querySubjects = `${medical_codes}`;
                break;
            default:
                querySubjects = ``;
                break;
        }
        let MappedCodes = await mContract.evaluateTransaction('queryTrialSubjects', `{"selector":{"trial_id":"${trialId}"}}`, "500", "");
        MappedCodes = JSON.parse(MappedCodes);
        let subject_array = new Array();
        (MappedCodes.data).forEach(element => {
            subject_array.push(element.subject_id)
        });
        let subjects = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{${querySubjects},"subject_id":{ 
            "$nin": 
                ${JSON.stringify(subject_array)}
            } }}`, limit, bookmark);
        let RecordsCount = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{${querySubjects},"subject_id":{ 
            "$nin": 
                ${JSON.stringify(subject_array)}
            } }}`, "500", "");
        let result = JSON.parse(subjects);
        RecordsCount = JSON.parse(RecordsCount);
        RecordsCount = RecordsCount.pagination;
        await gateway.disconnect();
        let response = new Object();
        response.status = true;
        response.message = 'Subjects returned Successfully';
        response.data = result.data;
        response.pagination = result.pagination;
        response.pagination.RecordsCount = RecordsCount.fetchedRecordsCount;
        res.status(200).json(response);
        //   res.status(200).json({
        //     status: true,
        //     message: 'Mapped Trials returned Successfully',
        //     data: JSON.parse(subjects.toString())
        // });
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Map Trial Returned with Error: ${error}`
        });
    }
}
exports.searchTrialSubjects = async (req, res) => {

    /*
    Modes:
    1. s_data : filter with only subject data   
    2. s_data_inc: filter with subject data and inclusive codes 
    3. s_data_inc_exc: filter with subject data, inclusive codes and exclusive codes 
    4. inc_only: filter with only inclusive codes 
    5. inc_exc: filter with inclusive codes and exclusive codes 
    6. s_data_ict_inc: filter with subject data and ICT inclusive codes
    7. s_data_ict_inc_ict_exc: filter with subject data, ICT inclusive codes and ICT exclusive codes
    8. s_data_ict_inc_exc: filter with subject data, ICT inclusive codes and exclusive codes
    9. s_data_inc_ict_exc: filter with subject data, inclusive codes and ICT exclusive codes
    10. s_data_ict_exc : filter with subject data, inclusive codes and ICT exclusive codes
    11. ict_inc: ICT inclusive codes only
    12. ict_inc_ict_exc: ICT inclusive codes and ICT exclusive codes
    13. ict_inc_exc: ICT inclusive codes and exclusive codes
    14. ict_exc: ICT  exclusive codes only
    15. ict_exc_inc: ICT  exclusive codes and inclusive codes
    16. exc_only: exclusive codes only
    */
    let user = 'admin';
    let trialId = req.body.trial_id;
    let subject_array = req.body.subject_array;
    let errors = new Array();
    let mode = 's_data';
    let limit = req.query.limit;
    let bookmark = req.query.bookmark;
    let queryType = 1;   // 1: s_data, 2: s_data + something , 3: no s_data
    if (!limit) {
        limit = 10;
    }
    if (!bookmark) {
        bookmark = "";
    }
    if (req.body.mode) {
        mode = req.body.mode;
    }
    if (!trialId) {
        errors.push('TrialId is required');
    }
    if (errors.length > 0) {
        res.status(422).json({
            'status': false,
            'message': 'Please resolve following errors',
            errors: errors
        });
    }
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
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
        let Dexclusive = new Array();
        let Dinclusive = new Array();
        let DinclusiveICD = new Array();
        let DexclusiveICD = new Array();
        let Rexclusive = new Array();
        let Rinclusive = new Array();
        let RinclusiveICD = new Array();
        let RexclusiveICD = new Array();
        let Dinclusive_array = new Array();
        let Dexclusive_array = new Array();
        let inclusive_codes = trial.inclusive_codes;
        let exclusive_codes = trial.exclusive_codes;
        let inclusive_regex_diagnosis = new Array();
        let inclusive_regex_reference_id = new Array();
        inclusive_codes.map(element => {
            Dinclusive.push(element.diagnosis_code);
            Rinclusive.push(
                {
                    reference_id: element.reference_id,
                    reference_type: element.reference_type
                }
            )
            inclusive_regex_diagnosis['$regex'] = `^${(element.diagnosis_code).substring(0, 3)}`;
            inclusive_regex_reference_id['$regex'] = `^${(element.reference_id).substring(0, 3)}`;
            RinclusiveICD.push({
                reference_id: Object.assign({}, inclusive_regex_reference_id),
                reference_type: element.reference_type,
            })
            // DinclusiveICD.push({
            //     diagnosis_code:Object.assign({}, inclusive_regex_diagnosis)
            // });
            Dinclusive_array.push((element.diagnosis_code).substring(0, 3));
        });
        exclusive_codes.map(element => {
            Dexclusive.push(element.diagnosis_code);
            Rexclusive.push(
                {
                    reference_id: element.reference_id,
                    reference_type: element.reference_type
                }
            )
            
            inclusive_regex_reference_id['$regex'] = `^${(element.reference_id).substring(0, 3)}`;
            RexclusiveICD.push({
                reference_id: Object.assign({}, inclusive_regex_reference_id),
                reference_type: element.reference_type,
            })
            
            Dexclusive_array.push((element.diagnosis_code).substring(0, 3));
        });
        Dexclusive_array    =   [... new Set(Dexclusive_array)];
        Dinclusive_array    =   [... new Set(Dinclusive_array)];
        Dexclusive_array.map(element => {
            inclusive_regex_diagnosis['$regex'] = `^${(element).substring(0, 3)}`;
            DexclusiveICD.push({
                diagnosis_code:Object.assign({}, inclusive_regex_diagnosis)
            });
        })
        Dinclusive_array.map(element => {
            inclusive_regex_diagnosis['$regex'] = `^${(element).substring(0, 3)}`;
            DexclusiveICD.push({
                diagnosis_code:Object.assign({}, inclusive_regex_diagnosis)
            });
        })
        
        Dinclusive = JSON.stringify(Dinclusive);
        Rinclusive = JSON.stringify(Rinclusive);
        RinclusiveICD = JSON.stringify(RinclusiveICD);
        DinclusiveICD = JSON.stringify(DinclusiveICD);
        Dexclusive = JSON.stringify(Dexclusive);
        Rexclusive = JSON.stringify(Rexclusive);
        RexclusiveICD = JSON.stringify(RexclusiveICD);
        DexclusiveICD = JSON.stringify(DexclusiveICD);
        const subjectNetwork = await gateway.getNetwork('subjects');
        const subjectContract = subjectNetwork.getContract('insurancesubject');
        const mNetwork = await gateway.getNetwork('mappings');
        const mContract = mNetwork.getContract('maptrial');

        const mdNetwork = await gateway.getNetwork('medicalcodes');
        const mdContract = mdNetwork.getContract('medicalcode');
        let subject_query = `"gender":"${gender}",
        "consent":${consent},"age":{"$gte": "${minAge}", "$lte":"${maxAge}"},"zipCode": { 
            "$in": 
                ${zipCodes}
            }`;
        let medical_codes = '';
        let querySubjects = `${subject_query}`;
        switch (mode) {
            case 's_data':
                querySubjects = `${subject_query}`;
                break;
            case 's_data_inc':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dinclusive}
                }`;
                queryType = 2;
                break;
            case 's_data_inc_exc':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dinclusive}
                },
                "$not":{
                    "diagnosis_code":{
                        "$in": ${Dexclusive}
                    }
                }`;
                queryType =2;
                break;
            case 'inc_only':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dinclusive}
                }`;
                queryType =3;
                break;
            case 'inc_exc':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dinclusive}
                },
                "$not":{
                    "diagnosis_code":{
                        "$in": ${Dexclusive}
                    }
                }`;
                queryType =3;
                break;
            case 's_data_ict_inc':
                medical_codes = `"$or":${DinclusiveICD}`;
                queryType =2;
                break;
            case 's_data_ict_inc_ict_exc':
                medical_codes = `"$or":${DinclusiveICD} ,
                    "$not": {
                        "$or":${DexclusiveICD}
                    }
                }`;
                queryType =2;
                break;
            case 's_data_ict_inc_exc':
                medical_codes = `"$or":${DinclusiveICD},
                    "diagnosis_code":{
                        "$in": ${Dexclusive}
                    }
                }`;
                queryType =2;
                break;
            case 's_data_inc_ict_exc':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dinclusive}
                    },
                    "$not": {
                        "$or":${DexclusiveICD}
                    }
                }`;
                queryType =2;
                break;
            case 's_data_ict_exc':
                medical_codes = `"$not": {
                    "$or":${DexclusiveICD}
                }`;
                queryType =2;
                break;
            case 'ict_inc':
                medical_codes = `"$or":${DinclusiveICD} `;
                queryType =3;
                break;
            case 'ict_inc_ict_exc':
                medical_codes = `"$or":${DinclusiveICD},
                    "$not": {
                        "$or":${DexclusiveICD}
                    }
                }`;
                queryType =3;
                break;
            case 'ict_inc_exc':
                medical_codes = `"$or":${DinclusiveICD} ,
                    "$not": {
                        "diagnosis_code":{
                            "$in": ${Dexclusive}
                        }
                    }
                }`;
                queryType =3;
                break;
            case 'ict_exc':
                medical_codes = `"$not": {
                    "$or":${DexclusiveICD}
                }`;
                queryType =3;
                break;
            case 'ict_exc_inc':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dinclusive}
                    },
                    "$not": {
                        "$or":${DexclusiveICD}
                    }
                }`;
                queryType =3;
                break;
            case 'exc_only':
                medical_codes = `"diagnosis_code":{
                    "$in": ${Dexclusive}
                }`;
                queryType =3;
                break;
            default:
                querySubjects = ``;
                break;
        }
        // let MappedCodes = await mContract.evaluateTransaction('queryTrialSubjects', `{"selector":{"trial_id":"${trialId}"}}`, "500", "");
        // MappedCodes = JSON.parse(MappedCodes);
        // let subject_array = new Array();
        // (MappedCodes.data).forEach(element => {
        //     subject_array.push(element.subject_id)
        // });
        let pagination = '';
        let subjects = '';
        let mResult = '';
        // console.log(medical_codes);
        // console.log(querySubjects);
        // console.log(JSON.stringify(subject_array));
        switch(queryType){
            case 1:
                subjects = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{${querySubjects},"subject_id":{ 
                    "$nin": 
                        ${JSON.stringify(subject_array)}
                    } }}`, limit, bookmark);
                break;
            case 2:
                mResult = await mdContract.evaluateTransaction('queryMedicalCodes',`{"selector":{${medical_codes},"subject_id":{ 
                    "$nin": 
                        ${JSON.stringify(subject_array)}
                    } }}`,'100',bookmark);
                mResult = JSON.parse(mResult);
                
                console.log('Success Here')
                subject_array = [];
                (mResult.data).forEach(element => {
                    subject_array.push(element.subject_id)
                });
                subjects = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{${querySubjects},"subject_id":{ 
                    "$in": 
                        ${JSON.stringify(subject_array)}
                    } }}`, limit, '');
                
                break;
            case 3:
                mResult = await mdContract.evaluateTransaction('queryMedicalCodes',`{"selector":{${medical_codes},"subject_id":{ 
                    "$nin": 
                        ${JSON.stringify(subject_array)}
                    } }}`,'100',bookmark);
                mResult = JSON.parse(mResult);
                subject_array = [];
                (mResult.data).forEach(element => {
                    subject_array.push(element.subject_id)
                });
                console.log('Success Here')
                subjects = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{"subject_id":{ 
                    "$in": 
                        ${JSON.stringify(subject_array)}
                    } }}`, limit, '');
                break
        }
        // let subjects = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{${querySubjects},"subject_id":{ 
        //     "$nin": 
        //         ${JSON.stringify(subject_array)}
        //     } }}`, limit, bookmark);
        let RecordsCount = await subjectContract.evaluateTransaction('QuerySubjects', `{"selector":{${querySubjects},"subject_id":{ 
            "$nin": 
                ${JSON.stringify(subject_array)}
            } }}`, "500", "");
        let result = JSON.parse(subjects);
        if (!pagination) {
            pagination  =   result.pagination;
        }
        RecordsCount = JSON.parse(RecordsCount);
        RecordsCount = RecordsCount.pagination;
        await gateway.disconnect();
        let response = new Object();
        response.status = true;
        response.message = 'Subjects returned Successfully';
        response.data = result.data;
        response.pagination = pagination;
        response.pagination.RecordsCount = RecordsCount.fetchedRecordsCount;
        res.status(200).json(response);
        //   res.status(200).json({
        //     status: true,
        //     message: 'Mapped Trials returned Successfully',
        //     data: JSON.parse(subjects.toString())
        // });
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Map Trial Returned with Error: ${error}`
        });
    }
}
exports.mapTrial = async (req, res) => {
    let user = 'admin';
    let trial_id = req.body.trial_id;
    let errors = new Array();
    let subject_id = req.body.subject_id;
    if (!subject_id) {
        errors.push('SubjectId is required');
    }
    if (!trial_id) {
        errors.push('TrialId is required');
    }
    if (errors.length > 0) {
        res.status(422).json({
            'status': false,
            'message': 'Please resolve following errors',
            errors: errors
        });
    }
    let Id = `${trial_id}_${subject_id}`;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
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
        const network = await gateway.getNetwork('mappings');
        const contract = network.getContract('maptrial');
        
        let postData = {
            map_id: Id,
            tx_id:uuidv4(),
            trial_id,
            subject_id,
            docType: 'mapTrialSubject'
        };
        console.log('Post Data',postData)
        let result = await contract.evaluateTransaction('queryTrialSubjects', `{"selector":{"map_id":"${Id}"}}`, 1, '');
        result = JSON.parse(result);
        if ((result.data).length) {
            res.status(422).json({
                status: false,
                message: 'Subject Already Mapped'
            });
        }else{
            result = await contract.submitTransaction('createTrialsSubject', postData.tx_id, JSON.stringify(postData));
            res.status(200).json({
                status: true,
                message: 'Added Successfully'
            });
        }
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Map Trial Returned with Error: ${error}`
        });
    }
}

exports.getTrialSubject = async (req, res) => {
    let user = 'admin';
    let map_id = req.params.map_id;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
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
        const network = await gateway.getNetwork('mappings');
        const contract = network.getContract('maptrial');

        let result = await contract.evaluateTransaction('queryTrialSubject', map_id);
        res.status(200).json({
            status: true,
            message: 'Trial Subject',
            data: JSON.parse(result)
        });
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Map Trial Returned with Error: ${error}`
        });
    }
}

exports.getTrialSubjects = async (req, res) => {
    let user = 'admin';
    let trial_id = req.body.trial_id;
    let errors = new Array();
    let limit = req.query.limit;
    let bookmark = req.query.bookmark;
    let subject_array = req.body.subject_array;
    if (!limit) {
        limit = 10;
    }
    if (!bookmark) {
        bookmark = '';
    }
    if (!trial_id) {
        errors.push('TrialId is required');
    }
    if (errors.length > 0) {
        res.status(422).json({
            'status': false,
            'message': 'Please resolve following errors',
            errors: errors
        });
    }
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
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
        const network = await gateway.getNetwork('mappings');
        const contract = network.getContract('maptrial');

        // let result = await contract.evaluateTransaction('queryTrialSubjects', `{"selector":{"trial_id":"${trial_id}"}}`, limit, bookmark);
        // let RecordsCount = await contract.evaluateTransaction('queryTrialSubjects', `{"selector":{"trial_id":"${trial_id}"}}`, "500", "");
        // result = JSON.parse(result);
        // RecordsCount = JSON.parse(RecordsCount);
        // RecordsCount = RecordsCount.pagination;

        // let ObjectData = new Array();
        // let subject_array = new Array();
        // (result.data).forEach(element => {
        //     subject_array.push(element.subject_id)
        // });
        let subjectData = '';
        if (subject_array.length > 0) {
            const subjectNetwork = await gateway.getNetwork('subjects');
            const subjectContract = subjectNetwork.getContract('insurancesubject');
            subjectData = await subjectContract.evaluateTransaction('GetQueryResultForQueryString', `{"selector":{"subject_id":{ 
                "$in": 
                    ${JSON.stringify(subject_array)}
                }}}`, limit, bookmark);
            subjectData = JSON.parse(subjectData);
            //ObjectData = subjectData.data;
            await gateway.disconnect();
        let response = new Object();
        response.status = true;
        response.message = 'Trial Subjects returned Successfully';
        response.data = subjectData.data;
        response.pagination = subjectData.pagination;
        response.pagination.RecordsCount = 0;
        res.status(200).json(response);
        //   res.status(200).json({
        //     status: true,
        //     message: 'Trial Subject',
        //     data: JSON.parse(result)
        // });
        // Disconnect from the gateway.
        }

        
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Map Trial Returned with Error: ${error}`
        });
    }
}
exports.deleteTrialSubject = async (req, res) => {
    let user = 'admin';
    let map_id = req.params.map_id;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'clinical.jnj.com', 'connection-clinical.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletClinical');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

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
        const network = await gateway.getNetwork('mappings');
        const contract = network.getContract('maptrial');
        const Cnetwork = await gateway.getNetwork('mappings');
        const Ccontract = Cnetwork.getContract('maptrial');
        console.log(map_id);
        let result = await contract.evaluateTransaction('queryTrialSubjects', `{"selector":{"map_id":"${map_id}"}}`, 1, '');
        result = JSON.parse(result);
        if(result.data){
            let trialSubjectArray = result.data;
            let trialSubject = trialSubjectArray[0];
            trialSubject.map_id = '0';
            trialSubject.trial_id = '0';
            trialSubject.subject_id = '0';
            console.log(trialSubject)
            await Ccontract.evaluateTransaction('updateTrialSubject',trialSubject.tx_id,JSON.stringify(trialSubject));
            res.status(200).json({
                status: true,
                message: 'Trial Subject Deleted'
            });
        }else{
            res.status(422).json({
                status: false,
                message: 'Trial Subject Does Not exist'
            });
        }
        
        
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Map Trial Returned with Error: ${error}`
        });
    }
}