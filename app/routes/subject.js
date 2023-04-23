// eslint-disable-next-line strict
const express = require('express');
let router = express.Router();
let insuranceSubject = require('../controllers/insuranceSubject');
let subjectMedicalCodes = require('../controllers/subjectMedicalCodes');
router.get('/getSubject/:subjectId', insuranceSubject.getSubject);
router.get('/getAllSubjects', insuranceSubject.getAllSubjects);
router.post('/getMedicalCodes', subjectMedicalCodes.getMedicalCodes);
router.post('/createSubject', insuranceSubject.createSubject);
router.post('/getSubjectsByQuery', insuranceSubject.getSubjectsByQuery);
router.post('/getSubjectsByFreeSearch', insuranceSubject.getSubjectsByFreeSearch);
router.put('/updateSubject', insuranceSubject.updateSubject);
module.exports = router;  