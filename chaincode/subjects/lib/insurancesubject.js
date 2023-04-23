/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { exit } = require('process');

class InsuranceSubject extends Contract {
    async initSubjects(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // const subjects = [
        //     {
        //         subject_id: '0001',
        //         firstName: 'Khizer',
        //         lastName: 'Arshad',
        //         address: 'New York',
        //         age: '28',
        //         gender: 'male',
        //         zipCode: '3000',
        //         consent: true,
        //         email:'khizer@jnj.com',
        //         ssn: '3321321321',
        //         phoneNumber1: '321321321321',
        //         phoneNumber2: '321321321321',
        //         state:'California',
        //         city:'Florida'
        //     },
        //     {
        //         subject_id: '0002',
        //         firstName: 'Martin',
        //         lastName: 'Luther',
        //         address: 'New York',
        //         age: '25',
        //         gender: 'male',
        //         zipCode: '4000',
        //         consent: true,
        //         email:'Martin@jnj.com',
        //         idCardNo: '3321321321',
        //         phoneNumber1: '321321321321',
        //         phoneNumber2: '321321321321',
        //         state:'Alaska',
        //         city:'Florida'
        //     },
        //     {
        //         subject_id: '0003',
        //         firstName: 'John',
        //         lastName: 'Doe',
        //         address: 'New York',
        //         age: '29',
        //         gender: 'male',
        //         zipCode: '5000',
        //         email:'John@jnj.com',
        //         consent: true,
        //         idCardNo: '3321321321',
        //         phoneNumber1: '321321321321',
        //         phoneNumber2: '321321321321',
        //         state:'New Jersey',
        //         city:'New York'
        //     },
        //     {
        //         subject_id: '0004',
        //         firstName: 'John2',
        //         lastName: 'Doe2',
        //         address: 'New York',
        //         age: '29',
        //         gender: 'male',
        //         zipCode: '3000',
        //         email:'John2@jnj.com',
        //         consent: true,
        //         idCardNo: '3321321321',
        //         phoneNumber1: '321321321321',
        //         phoneNumber2: '321321321321',
        //         state:'Washinton',
        //         city:'New York'
        //     }
        // ];
        // for (let i = 0; i < subjects.length; i++) {
        //     subjects[i].docType = 'subject';
        //     let subject = subjects[i];
        //     await ctx.stub.putState(subject.subject_id, Buffer.from(JSON.stringify(subjects[i])));
        //     console.info('Added <--> ', subjects[i]);
        // }
        console.info('============= END : Initialize Ledger ===========');
    }


    async createSubject(ctx, id, subject) {

        console.info('============= START : Create Subject ===========');
        const subjectAsBytes = await ctx.stub.getState(id); // get the subject from chaincode state
        if (!subjectAsBytes || subjectAsBytes.length === 0) {
            await ctx.stub.putState(id, Buffer.from(subject));
        }
    }
    // Update Trial
    async updateSubject(ctx, subjectId, subject) {

        let assetAsBytes = await ctx.stub.getState(subjectId);
        if (!assetAsBytes || !assetAsBytes.toString()) {
            throw new Error(`Asset ${subjectId} does not exist`);
        }
        await ctx.stub.putState(subjectId, Buffer.from(subject));
    }
    
    async querySubject(ctx, subjectId) {
        const trialAsBytes = await ctx.stub.getState(subjectId); // get the subject from chaincode state
        if (!trialAsBytes || trialAsBytes.length === 0) {
            throw new Error(`${subjectId} does not exist`);
        }
        return trialAsBytes.toString();
    }
    async queryAllSubjects(ctx, pageSize, bookmark) {
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
    // Get results by different filters
    async QuerySubjects(ctx, queryString, pageSize, bookmark) {
        return await this.GetQueryResultForQueryString(ctx, queryString, pageSize, bookmark);
    }
    // Helper functions
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
module.exports = InsuranceSubject;