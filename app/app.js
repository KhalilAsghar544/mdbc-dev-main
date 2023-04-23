// eslint-disable-next-line strict
const express = require('express');

let app = express();
app.use(express.json());
let pharma = require('./routes/pharma');
let clinical = require('./routes/clinical');
let insurance = require('./routes/insurance');
let trial = require('./routes/trial');
let subject = require('./routes/subject');
let map = require('./routes/map');
let iotdevice = require('./routes/iotdevice');
require('dotenv').config();

app.use('/api/pharma/', pharma);
app.use('/api/clinical/', clinical);
app.use('/api/insurance/', insurance);
app.use('/api/trial/', trial);
app.use('/api/subject/', subject);
app.use('/api/map/', map);
app.use('/api/iotdevice/', iotdevice);
const PORT = process.env.PORT || 3000;
module.exports = app;
app.listen(PORT, () => {
    console.log(`Listening on Port: ${PORT}`);
});
