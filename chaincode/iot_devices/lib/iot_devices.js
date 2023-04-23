/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { exit } = require('process');

class IOTDevice extends Contract {
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // const devices = [
        //     {
        //         subject_id: '0001',
        //         device_data: {
        //             distance: "0.3",
        //             steps: "340",
        //             burncalories: "45",
        //             heartRate: [
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:01"
        //                 },
        //                 {
        //                     heartRate: "81",
        //                     dateInfo: "2021-09-07 12:11"
        //                 },
        //                 {
        //                     heartRate: "83",
        //                     dateInfo: "2021-09-07 12:21"
        //                 },
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:31"
        //                 },
        //             ],
        //             sleepData: [
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-06 23:15",
        //                     endDate: "2021-06-07 23:15"

        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "180",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-07 23:15",
        //                     endDate: "2021-06-08 23:15"


        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-08 23:15",
        //                     endDate: "2021-06-09 23:15"

        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         subject_id: '0002',
        //         device_data: {
        //             distance: "0.3",
        //             steps: "340",
        //             burncalories: "45",
        //             heartRate: [
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:01"
        //                 },
        //                 {
        //                     heartRate: "81",
        //                     dateInfo: "2021-09-07 12:11"
        //                 },
        //                 {
        //                     heartRate: "83",
        //                     dateInfo: "2021-09-07 12:21"
        //                 },
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:31"
        //                 },
        //             ],
        //             sleepData: [
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-06 23:15",
        //                     endDate: "2021-06-07 23:15"

        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "180",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-07 23:15",
        //                     endDate: "2021-06-08 23:15"


        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-08 23:15",
        //                     endDate: "2021-06-09 23:15"

        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         subject_id: '0003',
        //         device_data: {
        //             distance: "0.3",
        //             steps: "340",
        //             burncalories: "45",
        //             heartRate: [
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:01"
        //                 },
        //                 {
        //                     heartRate: "81",
        //                     dateInfo: "2021-09-07 12:11"
        //                 },
        //                 {
        //                     heartRate: "83",
        //                     dateInfo: "2021-09-07 12:21"
        //                 },
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:31"
        //                 },
        //             ],
        //             sleepData: [
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-06 23:15",
        //                     endDate: "2021-06-07 23:15"

        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "180",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-07 23:15",
        //                     endDate: "2021-06-08 23:15"


        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-08 23:15",
        //                     endDate: "2021-06-09 23:15"

        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         subject_id: '0004',
        //         device_data: {
        //             distance: "0.3",
        //             steps: "340",
        //             burncalories: "45",
        //             heartRate: [
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:01"
        //                 },
        //                 {
        //                     heartRate: "81",
        //                     dateInfo: "2021-09-07 12:11"
        //                 },
        //                 {
        //                     heartRate: "83",
        //                     dateInfo: "2021-09-07 12:21"
        //                 },
        //                 {
        //                     heartRate: "85",
        //                     dateInfo: "2021-09-07 12:31"
        //                 },
        //             ],
        //             sleepData: [
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-06 23:15",
        //                     endDate: "2021-06-07 23:15"

        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "180",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-07 23:15",
        //                     endDate: "2021-06-08 23:15"


        //                 },
        //                 {
        //                     awake: "0",
        //                     deepSleep: "155",
        //                     lightSleep: "360",
        //                     startDate: "2021-06-08 23:15",
        //                     endDate: "2021-06-09 23:15"

        //                 }
        //             ]
        //         }
        //     }
        // ];
        // for (let i = 0; i < devices.length; i++) {
        //     devices[i].docType = 'device';
        //     let device = devices[i];
        //     await ctx.stub.putState(device.subject_id, Buffer.from(JSON.stringify(devices[i])));
        //     console.info('Added <--> ', devices[i]);
        // }
        console.info('============= END : Initialize Ledger ===========');
    }
    async queryDevice(ctx, deviceId) {
        const trialAsBytes = await ctx.stub.getState(deviceId); // get the device from chaincode state
        if (!trialAsBytes || trialAsBytes.length === 0) {
            throw new Error(`${deviceId} does not exist`);
        }
        return trialAsBytes.toString();
    }
    async createDevice(ctx, id, device) {

        console.info('============= START : Create Device Data ===========');
        const deviceAsBytes = await ctx.stub.getState(id); // get the device from chaincode state
        if (!deviceAsBytes || deviceAsBytes.length === 0) {
            await ctx.stub.putState(id, Buffer.from(device));
        }
    }
}
module.exports = IOTDevice;