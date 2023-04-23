// eslint-disable-next-line strict
const express = require('express');
let router =   express.Router();
let insuranceUser  =   require('../controllers/insuranceUser.js');
/*User Routes*/
router.post('/createUser',insuranceUser.createUser);
router.get('/verifyUser/:enrollmentId',insuranceUser.verifyUser);

module.exports  =   router;
