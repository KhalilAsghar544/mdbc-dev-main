/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { exit } = require('process');

class MapTrial extends Contract {
  async initLedger(ctx) {
    
  }
  async createTrialsSubject(ctx, id, trialSubject) {

    // id trial_id concat subject_id
    console.info('============= START : Create Trial Subject ===========');
    const trialAsBytes = await ctx.stub.getState(id); // get the trial from chaincode state
    if (!trialAsBytes || trialAsBytes.length === 0) {
      await ctx.stub.putState(id, Buffer.from(trialSubject));
    }
  }
  async queryTrialSubject(ctx, mapId) {
    const trialAsBytes = await ctx.stub.getState(mapId); // get the trial from chaincode state
    if (!trialAsBytes || trialAsBytes.length === 0) {
      throw new Error(`${mapId} does not exist`);
    }
    return trialAsBytes.toString();
  }
  async queryTrialSubjects(ctx, queryString, pageSize, bookmark) {
		return await this.GetQueryResultForQueryString(ctx, queryString, pageSize, bookmark);
	}
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
  async updateTrialSubject(ctx, trialId, trial) {

		let assetAsBytes = await ctx.stub.getState(trialId);
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error(`Asset ${trialId} does not exist`);
		}
		let assetToTransfer = {};
		try {
			assetToTransfer = JSON.parse(assetAsBytes.toString()); //unmarshal
		} catch (err) {
			let jsonResp = {};
			jsonResp.error = 'Failed to decode JSON of: ' + trialId;
			throw new Error(jsonResp);
		}
		assetToTransfer = trial; //change the owner

		let assetJSONasBytes = Buffer.from(JSON.stringify(assetToTransfer));
		await ctx.stub.putState(trialId, Buffer.from(trial));
	}
  async deleteTrialSubject(ctx, id) {

    // id trial_id concat subject_id
    console.info('============= START : delete Trial Subject ===========');
    const trialAsBytes = await ctx.stub.getState(id); // get the trial from chaincode state
    if (!trialAsBytes || trialAsBytes.length === 0) {
      throw new Error(`${id} does not exist`);
    }

    const assetString = trialAsBytes.toString();
	  const asset = JSON.parse(assetString);
    const assetBuffer = Buffer.from(JSON.stringify(asset));
    ctx.stub.setEvent('deleteTrialSubject', assetBuffer);
    await ctx.stub.deleteState(id);
  }

}
module.exports = MapTrial;