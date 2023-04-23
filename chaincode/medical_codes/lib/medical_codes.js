/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { exit } = require('process');

class MedicalCode extends Contract {
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // const codes = [
        //     {
        //         subject_id:'0001',
        //         diagnosis_code: '003',
        //         reference_id: '001',
        //         reference_type: 'procedure',            
        //         reference_date: '2021-23-08 05:51:55'
        //     },
        //     {
        //         subject_id:'0002',
        //         diagnosis_code: '003',
        //         reference_id: '001',
        //         reference_type: 'procedure',           
        //         reference_date: '2021-23-08 05:51:53'
        //     },
        //     {
        //         subject_id:'0003',
        //         diagnosis_code: '003',
        //         reference_id: '001',
        //         reference_type: 'procedure',            
        //         reference_date: '2021-23-08 05:51:53'
        //     },
        //     {
        //         subject_id:'0004',
        //         diagnosis_code: '003',
        //         reference_id: '001',
        //         reference_type: 'procedure',            
        //         reference_date: '2021-23-08 05:51:53'
        //     }
        // ];
        // for (let i = 0; i < codes.length; i++) {
        //     codes[i].docType = 'medicalcode';
        //     await ctx.stub.putState(ctx.stub.getTxID(), Buffer.from(JSON.stringify(codes[i])));
        //     console.info('Added <--> ', codes[i]);
        // }
        console.info('============= END : Initialize Ledger ===========');
    }
    // Get Single Medical Code Against ID
    async queryMedicalCode(ctx, codeId) {
        const codeAsBytes = await ctx.stub.getState(codeId); // get the Medical Code from chaincode state
        if (!codeAsBytes || codeAsBytes.length === 0) {
            throw new Error(`${codeId} does not exist`);
        }
        return codeAsBytes.toString();
    }
    // Get Medical Codes Against Subject Id
    async queryMedicalCodes(ctx, queryString, pageSize, bookmark) {
		return await this.GetQueryResultForQueryString(ctx, queryString, pageSize, bookmark);
	}

    // Create Medical Code
    async createMedicalCode(ctx, medicalData) {
        console.info('============= START : Create Medical Code Object ===========');
        medicalData = JSON.parse(medicalData);
        medicalData.medical_code_id =   ctx.stub.getTxID();
        await ctx.stub.putState(ctx.stub.getTxID(), Buffer.from(JSON.stringify(medicalData)));
    }
    async queryAllMedicalCodes(ctx, pageSize, bookmark) {
        const startKey = '';
        const endKey = '';
        const { iterator, metadata } = await ctx.stub.getStateByRangeWithPagination(startKey, endKey, pageSize, bookmark);
        let results = await this.GetAllResults(iterator);
        let paginatedData = {
            pagination: metadata,
            data: results
        };
        return JSON.stringify(paginatedData);
    }
    // Helper Functions
    async GetQueryResultForQueryString(ctx, queryString, pageSize, bookmark) {

        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, pageSize, bookmark);
        let results = await this.GetAllResults(iterator);
        let paginatedData = {
            pagination: metadata,
            data: results
        };
        return JSON.stringify(paginatedData);
    }
      async GetAllResults(iterator) {
            let allResults = [];
            let res = await iterator.next();
            while (!res.done) {
                if (res.value && res.value.value.toString()) {
                    let jsonRes = '';
                    try {
              jsonRes = JSON.parse(res.value.value.toString('utf8'));
            } catch (err) {
              jsonRes = res.value.value.toString('utf8');
            }
                    allResults.push(jsonRes);
                }
                res = await iterator.next();
            }
            iterator.close();
            return allResults;
        }
}
module.exports = MedicalCode;