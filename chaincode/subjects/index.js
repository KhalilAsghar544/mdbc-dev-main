/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const FabCar = require('./lib/fabcar');

// module.exports.FabCar = FabCar;
// module.exports.contracts = [ FabCar ];
const InsuranceSubject = require('./lib/insurancesubject');
module.exports.InsuranceSubject = InsuranceSubject;
module.exports.contracts = [InsuranceSubject];