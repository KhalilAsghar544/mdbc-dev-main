// eslint-disable-next-line strict
const express = require('express');
let router = express.Router();
let insuranceSubject = require('../controllers/subjectDeviceData');
router.get('/getDeviceData/:subjectId', insuranceSubject.getDeviceData);
router.post('/createDeviceData', insuranceSubject.createDeviceData);
module.exports = router;  