// eslint-disable-next-line strict
const express = require('express');
let router =   express.Router();
let pharmaUser  =   require('../controllers/pharmaUser');
router.post('/createUser',pharmaUser.createUser);
router.get('/verifyUser/:enrollmentId',pharmaUser.verifyUser);
module.exports  =   router;
