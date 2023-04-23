// eslint-disable-next-line strict
const express = require('express');
let router =   express.Router();
let clinicalUser  =   require('../controllers/clinicalUser');
router.post('/createUser',clinicalUser.createUser);
router.get('/verifyUser/:enrollmentId',clinicalUser.verifyUser);
module.exports  =   router;
