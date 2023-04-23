// eslint-disable-next-line strict
const express = require('express');
let router = express.Router();
let clinicalTrial = require('../controllers/clinicalTrial');
router.post('/createTrial', clinicalTrial.createTrial);
router.get('/getTrial/:trialId', clinicalTrial.getTrial);
router.get('/getTrialSites/:trialId', clinicalTrial.getTrialSites);
router.get('/getTrialsByStatus/:status', clinicalTrial.getTrialsByStatus);
router.post('/updateTrialByStatus', clinicalTrial.updateTrialByStatus);
router.post('/getTrialsByQuery', clinicalTrial.getTrialsByQuery);
router.post('/addTrialSite', clinicalTrial.addTrialSite);
router.get('/getAllTrials/', clinicalTrial.getAllTrials);
router.put('/updateTrial', clinicalTrial.updateTrial);
router.put('/updateTrialSiteStatus', clinicalTrial.updateTrialSiteStatus);
module.exports = router;  