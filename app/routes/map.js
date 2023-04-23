// eslint-disable-next-line strict
const express = require('express');
let router = express.Router();
let mapTrial = require('../controllers/mapTrial');
router.post('/searchTrialSubjects', mapTrial.searchTrialSubjects);
router.post('/searchSampleTrialSubjects', mapTrial.searchSampleTrialSubjects);
router.post('/mapTrial', mapTrial.mapTrial);
router.post('/getTrialSubjects', mapTrial.getTrialSubjects);
router.get('/getTrialSubject/:map_id', mapTrial.getTrialSubject);
router.delete('/deleteTrialSubject/:map_id', mapTrial.deleteTrialSubject);
module.exports = router;  