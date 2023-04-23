/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const MedicalCode = require('./lib/medical_codes');
module.exports.MedicalCode = MedicalCode;
module.exports.contracts = [MedicalCode];