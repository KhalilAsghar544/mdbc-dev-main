/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { exit } = require('process');

class ClinicalTrial extends Contract {
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    // const trials = [
    //   {
    //     trial_id: '0001',
    //     NCTCode: '0001',
    //     protocol_id: '0001',
    //     name: 'XYZ',
    //     description: 'XYZ',
    //     Pharma: 'JNJ',
    //     Clinical: 'Jansen',
    //     Insurance: 'Allstate',
    //     startdate: '2021-23-08 05:51:53',
    //     enddate: '2021-28-08 05:51:53',
    //     totaltarget: '50',
    //     status: 'planning',
    //     subject_data: {
    //       consent: true,
    //       gender: 'male',
    //       minAge: '25',
    //       maxAge: '44',
    //       homeless: false,
    //       zip_codes: [
    //         '3000', '4000', '5000'
    //       ]
    //     },
    //     sites:[
    //       {
    //         site_id:'001',
    //         zip_codes: [         //  array
    //           '4000', '5000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       },
    //       {
    //         site_id:'002',
    //         zip_codes: [         //  array
    //           '3000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       }
    //     ],
    //     inclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_id: '001',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',
    //       },
    //       {
    //         diagnosis_code: '002',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_id: '001',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',

    //       },
    //       {
    //         diagnosis_code: '004',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_id: '001',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ],
    //     exclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_id: '001',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '002',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_id: '001',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '003',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_id: '001',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ]
    //   },
    //   {
    //     trial_id: '0008',
    //     NCTCode: '0008',
    //     protocol_id: '0008',
    //     name: 'XYZ',
    //     description: 'XYZ',
    //     Pharma: 'JNJ',
    //     Clinical: 'Jansen',
    //     Insurance: 'Allstate',
    //     startdate: '2021-23-08 05:51:53',
    //     enddate: '2021-25-08 05:51:53',
    //     totaltarget: '50',
    //     status: 'completed',
    //     subject_data: {
    //       consent: true,        // boolean
    //       gender: 'male',       // male,female , other
    //       minAge: '28',
    //       maxAge: '44',
    //       homeless: false,      //  boolean
    //       zip_codes: [         //  array
    //         '3000', '4000', '5000'
    //       ],
    //     },
    //     sites:[
    //       {
    //         site_id:'001',
    //         zip_codes: [         //  array
    //           '4000', '5000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       },
    //       {
    //         site_id:'002',
    //         zip_codes: [         //  array
    //           '3000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       }
    //     ],
    //     inclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',
    //       },
    //       {
    //         diagnosis_code: '002',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',

    //       },
    //       {
    //         diagnosis_code: '003',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ],
    //     exclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '004',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '005',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '006',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ]
    //   },
    //   {
    //     trial_id: '0003',
    //     NCTCode: '0003',
    //     protocol_id: '0003',
    //     name: 'XYZ',
    //     description: 'XYZ',
    //     Pharma: 'JNJ',
    //     Clinical: 'Jansen',
    //     Insurance: 'Allstate',
    //     startdate: '2021-20-07 05:51:53',
    //     enddate: '2021-23-08 05:51:53',
    //     totaltarget: '50',
    //     status: 'onhold',
    //     subject_data: {
    //       consent: true,        // boolean
    //       gender: 'male',       // male,female , other
    //       minAge: '24',
    //       maxAge: '44',
    //       homeless: false,      //  boolean
    //       zip_codes: [         //  array
    //         '3000', '4000', '5000'
    //       ],
    //     },
    //     sites:[
    //       {
    //         site_id:'001',
    //         zip_codes: [         //  array
    //           '4000', '5000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       },
    //       {
    //         site_id:'002',
    //         zip_codes: [         //  array
    //           '3000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       }
    //     ],
    //     inclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',
    //       },
    //       {
    //         diagnosis_code: '002',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',

    //       },
    //       {
    //         diagnosis_code: '003',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ],
    //     exclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '002',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '003',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ]
    //   },
    //   {
    //     trial_id: '0004',
    //     NCTCode: '0004',
    //     protocol_id: '0004',
    //     name: 'XYZ',
    //     description: 'XYZ',
    //     Pharma: 'JNJ',
    //     Clinical: 'Jansen',
    //     Insurance: 'Allstate',
    //     startdate: '2021-23-09 05:51:53',
    //     enddate: '2021-23-07 05:51:53',
    //     totaltarget: '50',
    //     status: 'in_progress',
    //     subject_data: {
    //       consent: true,        // boolean
    //       gender: 'male',       // male,female , other
    //       minAge: '24',
    //       maxAge: '44',
    //       homeless: false,      //  boolean
    //       zip_codes: [         //  array
    //         '3000', '4000', '5000'
    //       ],
    //     },
    //     sites:[
    //       {
    //         site_id:'001',
    //         zip_codes: [         //  array
    //           '4000', '5000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       },
    //       {
    //         site_id:'002',
    //         zip_codes: [         //  array
    //           '3000'
    //         ],
    //         status:'in_progress',
    //         location:'Lahore'
    //       }
    //     ],
    //     inclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',
    //       },
    //       {
    //         diagnosis_code: '002',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53',

    //       },
    //       {
    //         diagnosis_code: '003',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ],
    //     exclusive_codes: [   //  array of objects
    //       {
    //         diagnosis_code: '001',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '002',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       },
    //       {
    //         diagnosis_code: '003',
    //         reference_id: '001',
    //         diagnosis_name: 'POC Sample',
    //         reference_name: 'POC Sample',
    //         reference_type: 'procedure',            // will include procedure, medicine and more in future
    //         reference_date: '2021-23-08 05:51:53'
    //       }
    //     ]
    //   },

    // ];
    // for (let i = 0; i < trials.length; i++) {
    //   trials[i].docType = 'trial';
    //   // trials[i].txId = await ctx.stub.getTxID();
    //   let trial = trials[i];
    //   await ctx.stub.putState(trial.trial_id, Buffer.from(JSON.stringify(trials[i])));
    //   console.info('Added <--> ', trials[i]);
    // }
    console.info('============= END : Initialize Ledger ===========');
  }

  async queryTrial(ctx, trialId) {
    const trialAsBytes = await ctx.stub.getState(trialId); // get the trial from chaincode state
    if (!trialAsBytes || trialAsBytes.length === 0) {
      throw new Error(`${trialId} does not exist`);
    }
    return trialAsBytes.toString();
  }
  // Get All Trials
  async queryAllTrials(ctx,pageSize,bookmark) {
    const startKey = '';
    const endKey = '';
    const { iterator, metadata } = await ctx.stub.getStateByRangeWithPagination(startKey, endKey, pageSize, bookmark);
    let results = await this.GetAllResults(iterator);
    let paginatedData = {
      pagination:metadata,
      data:results
    };
    return JSON.stringify(paginatedData);
  }

  async createTrial(ctx, id, trial) {

    console.info('============= START : Create Trial ===========');
    const trialAsBytes = await ctx.stub.getState(id); // get the trial from chaincode state
    if (!trialAsBytes || trialAsBytes.length === 0) {
      await ctx.stub.putState(id, Buffer.from(trial));
    }



  }
  // Get results by different filters
  async QueryTrials(ctx, queryString,pageSize,bookmark) {
		return await this.GetQueryResultForQueryString(ctx, queryString,pageSize,bookmark);
	}
  
  // Get Status
  async QueryTrialsByStatus(ctx, status,pageSize,bookmark) {
		let queryString = {};
		queryString.selector = {};
		queryString.selector.docType = 'trial';
		queryString.selector.status = status;
		return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString,pageSize,bookmark)); //shim.success(queryResults);
	}

  // Update Trial
  async updateTrial(ctx, trialId, trial) {

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
  // Update Status
  async updateTrialStatus(ctx, trialId, status) {

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
		assetToTransfer.status = status; //change the owner

		let assetJSONasBytes = Buffer.from(JSON.stringify(assetToTransfer));
		await ctx.stub.putState(trialId, assetJSONasBytes); //rewrite the asset
	}
  // Helper functions
  async GetQueryResultForQueryString(ctx, queryString,pageSize,bookmark) {

		const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, pageSize, bookmark);
		let results = await this.GetAllResults(iterator);
    let paginatedData = {
      pagination:metadata,
      data:results
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
module.exports = ClinicalTrial;