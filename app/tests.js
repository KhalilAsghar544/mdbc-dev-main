/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const csv = require('csv-parser')
const fs = require('fs')
var faker = require('faker');
const { time } = require('console');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { exit } = require('process');
const { v4: uuidv4 } = require('uuid');
function test(){
  console.log(uuidv4())
}
async function main() {
  let age = 24;
  let query = new Array();
  let final = new Array();
  let i_codes = new Array();
  let in_codes = new Object();

  let clinical = 'Jansen';
  let gender = 'male';
  let pharma = 'JNJ';
  let insurance = 'Allstate';

  let ssd = `{"selector":{"inclusive_codes": { "$elemMatch": { "diagnosis_code": "004"} } }}`;

  if (clinical) {
    query["Clinical"] = clinical;
  }
  if (pharma) {
    query["Pharma"] = pharma;
  }
  in_codes.diagnosis_code = "004";
  in_codes.reference_id = "001";
  in_codes.reference_type = "procedure";
  i_codes["$elemMatch"] = in_codes
  console.log(i_codes);
  query["inclusive_codes"] = Object.assign({}, i_codes);
  final["selector"] = Object.assign({}, query);
  console.log(JSON.stringify(Object.assign({}, final)));

}
async function CSVToArray(CSV_string, delimiter) {
  delimiter = (delimiter || ","); // user-supplied delimeter or default comma

  var pattern = new RegExp( // regular expression to parse the CSV values.
    ( // Delimiters:
      "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
      // Standard fields.
      "([^\"\\" + delimiter + "\\r\\n]*))"
    ), "gi"
  );

  var rows = [[]];  // array to hold our data. First row is column headers.
  // array to hold our individual pattern matching groups:
  var matches = false; // false if we don't find any matches
  // Loop until we no longer find a regular expression match
  while (matches = pattern.exec(CSV_string)) {
    var matched_delimiter = matches[1]; // Get the matched delimiter
    // Check if the delimiter has a length (and is not the start of string)
    // and if it matches field delimiter. If not, it is a row delimiter.
    if (matched_delimiter.length && matched_delimiter !== delimiter) {
      // Since this is a new row of data, add an empty row to the array.
      rows.push([]);
    }
    var matched_value;
    // Once we have eliminated the delimiter, check to see
    // what kind of value was captured (quoted or unquoted):
    if (matches[2]) { // found quoted value. unescape any double quotes.
      matched_value = matches[2].replace(
        new RegExp("\"\"", "g"), "\""
      );
    } else { // found a non-quoted value
      matched_value = matches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.

    rows[rows.length - 1].push(matched_value);
  }
  return rows; // Return the parsed data Array
}
//main();
//parseCsv();
//sampleCsv();

async function CSVParse() {
  fs.readFile("files/sample_data.csv", async (error, data) => {
    if (error) {
      console.log('\nError while reading text file.\n' + error.message)
      // Seeding Failed
      return process.exit(1)
    }
    else {
      let rows = CSVToArray(data, ',');
      let object_array = new Array();
      let elem = new Object();
      (await rows).shift();
      (await rows).pop()
      console.log('Done');
    }
  });
}
function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err)
    }
    try {
      const object = JSON.parse(fileData)
      return cb && cb(null, object)
    } catch (err) {
      return cb && cb(err)
    }
  })
}
async function readJson() {
  jsonReader('files/subjects.json', (err, subject) => {
    if (err) {
        console.log(err)
        return
    }
    
    subject.forEach((element,i) => {
      element.first_name  = faker.name.firstName();
      element.last_name  = faker.name.lastName();
      element.address  = faker.address.streetAddress();
      element.email = faker.internet.email();
      if(i==1){
        console.log(element);
      }
      
  });
})
}

async function storeJson() {
  const results = [];
  console.log(new Date().toLocaleString());
  let elem = new Object()
  fs.createReadStream('files/subjects_second_dump.csv')
    .pipe(csv())
    .on('data', (element) => {
        let age = 2021 - parseInt(element['year']);
        if(age>100 && age<1){
            age = 1;
        }
      elem = {
        "subject_id": element['patient_id'],
        "firstName": element['first_name'],
        "lastName": element['last_name'],
        "address": element['address'],
        "email": element['email'],
        "age": age.toString(),
        "gender": element['gender'],
        "zipCode": element['zip'],
        "city": element['city'],
        "state": element['state'],
        "consent": true,
        "ssn": element['zip'],
        "phoneNumber1": element['phone'],
        "phoneNumber2": element['phone'],
      };
      let obj = results.find(o => o.subject_id === element['patient_id']);
      let objKey = results.findIndex(o => o.subject_id === element['patient_id']);
      if (obj) {
        
      } else {
        results.push(elem);
      }
    })
    .on('end', () => {
      var json = JSON.stringify(results);
      var fs = require('fs');
      fs.writeFile('files/subjects_second_dump.json', json, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log(new Date().toLocaleString());
          console.log('Successfully wrote file')
        }
      })

    });
};

async function storeTrialSingle(){
  const elem = {
    "trial_id": "NCT03678467",
    "NCTCode": "NCT03678467",
    "protocol_id": "EB-CMF-02",
    "name": "Evaluation of EpiBone-CMF for Mandibular Ramus Reconstruction",
    "description": "inadequate treatment plan [Persons encountering health services in other specified circumstances]",
    "Pharma": "Janseen",
    "Clinical": "JNJ",
    "Insurance": "All State",
    "startdate": "2021-03-31",
    "enddate": "2023-06-30",
    "totaltarget": "6",
    "status": "Recruiting",
    "subject_data": {
        "consent": true,
        "gender": "All",
        "minAge": "18",
        "maxAge": "65",
        "homeless": false,
        "zip_codes": [
            "44195",
            "78229"
        ]
    },
    "inclusive_codes": [
        {
            "diagnosis_code": "A833",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "St Louis encephalitis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "A833",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "St Louis encephalitis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "A833",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "St Louis encephalitis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "A833",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "St Louis encephalitis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "A833",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "St Louis encephalitis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "A833",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "St Louis encephalitis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B24",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B24",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B24",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B24",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B24",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B24",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B58",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B58",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B58",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B58",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B58",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B58",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B181",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Chronic viral hepatitis B without delta-agent",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B181",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Chronic viral hepatitis B without delta-agent",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B181",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Chronic viral hepatitis B without delta-agent",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B181",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Chronic viral hepatitis B without delta-agent",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B181",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Chronic viral hepatitis B without delta-agent",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B181",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Chronic viral hepatitis B without delta-agent",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B1920",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified viral hepatitis C without hepatic coma",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B1920",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified viral hepatitis C without hepatic coma",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B1920",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified viral hepatitis C without hepatic coma",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B1920",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified viral hepatitis C without hepatic coma",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B1920",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified viral hepatitis C without hepatic coma",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B1920",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified viral hepatitis C without hepatic coma",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M859",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorder of bone density and structure, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M859",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorder of bone density and structure, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M859",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorder of bone density and structure, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M859",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorder of bone density and structure, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M859",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorder of bone density and structure, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M859",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorder of bone density and structure, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M9969",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osseous and subluxation stenosis of intervertebral foramina of abdomen and other regions",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M9969",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osseous and subluxation stenosis of intervertebral foramina of abdomen and other regions",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M9969",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osseous and subluxation stenosis of intervertebral foramina of abdomen and other regions",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M9969",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osseous and subluxation stenosis of intervertebral foramina of abdomen and other regions",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M9969",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osseous and subluxation stenosis of intervertebral foramina of abdomen and other regions",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M9969",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osseous and subluxation stenosis of intervertebral foramina of abdomen and other regions",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R298",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R298",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R298",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R298",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R298",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R298",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R0989",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the circulatory and respiratory systems",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R0989",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the circulatory and respiratory systems",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R0989",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the circulatory and respiratory systems",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R0989",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the circulatory and respiratory systems",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R0989",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the circulatory and respiratory systems",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R0989",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the circulatory and respiratory systems",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4789",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other speech disturbances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4789",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other speech disturbances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4789",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other speech disturbances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4789",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other speech disturbances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4789",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other speech disturbances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4789",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other speech disturbances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T7840XA",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Allergy, unspecified, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T7840XA",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Allergy, unspecified, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T7840XA",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Allergy, unspecified, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T7840XA",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Allergy, unspecified, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T7840XA",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Allergy, unspecified, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T7840XA",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Allergy, unspecified, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z717",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Human immunodeficiency virus [HIV] counseling",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z717",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Human immunodeficiency virus [HIV] counseling",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z717",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Human immunodeficiency virus [HIV] counseling",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z717",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Human immunodeficiency virus [HIV] counseling",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z717",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Human immunodeficiency virus [HIV] counseling",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z717",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Human immunodeficiency virus [HIV] counseling",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z8611",
            "reference_id": "3992",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Personal history of tuberculosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z8611",
            "reference_id": "4776",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Personal history of tuberculosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z8611",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Personal history of tuberculosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z8611",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Personal history of tuberculosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z8611",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Personal history of tuberculosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z8611",
            "reference_id": "1596450",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Personal history of tuberculosis",
            "reference_name": ""
        }
    ],
    "exclusive_codes": [
        {
            "diagnosis_code": "B999",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B999",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified infectious disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B0802",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Orf virus disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B0802",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Orf virus disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "B0802",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Orf virus disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "C801",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Malignant (primary) neoplasm, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D57",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D473",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Essential (hemorrhagic) thrombocythemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D680",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Von Willebrand's disease",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "D681",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hereditary factor XI deficiency",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E55",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E108",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Type 1 diabetes mellitus with unspecified complications",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E213",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hyperparathyroidism, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E7629",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other mucopolysaccharidoses",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "E8352",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Hypercalcemia",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5315",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Visual distortions of shape and size",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "H5355",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Tritanomaly",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "K8689",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified diseases of pancreas",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M359",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Systemic involvement of connective tissue, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M810",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Age-related osteoporosis without current pathological fracture",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M889",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteitis deformans of unspecified bone",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M898X",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M2689",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other dentofacial anomalies",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8409",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8488",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other disorders of continuity of bone, other site",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8488",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other disorders of continuity of bone, other site",
            "reference_name": ""
        },
        {
            "diagnosis_code": "M8488",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other disorders of continuity of bone, other site",
            "reference_name": ""
        },
        {
            "diagnosis_code": "P00",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "P00",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "P00",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q782",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Osteopetrosis",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q799",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Congenital malformation of musculoskeletal system, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q799",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Congenital malformation of musculoskeletal system, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q799",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Congenital malformation of musculoskeletal system, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q899",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Congenital malformation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q899",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Congenital malformation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Q899",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Congenital malformation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R198",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the digestive system and abdomen",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R198",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the digestive system and abdomen",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R198",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified symptoms and signs involving the digestive system and abdomen",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R410",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Disorientation, unspecified",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "R4189",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other symptoms and signs involving cognitive functions and awareness",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S015",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S0263",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S0263",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "S0263",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T111",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T794",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T794",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T794",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "T819XXA",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Unspecified complication of procedure, initial encounter",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z789",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Other specified health status",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "8638",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "29844",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        },
        {
            "diagnosis_code": "Z7689",
            "reference_id": "226155",
            "reference_type": "medicine",
            "reference_date": "",
            "diagnosis_name": "Persons encountering health services in other specified circumstances",
            "reference_name": ""
        }
    ]
};
      var json = JSON.stringify(elem);
      var fs = require('fs');
      fs.writeFile('files/singleTrial.json', json, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log(new Date().toLocaleString());
          console.log('Successfully wrote file')
        }
      })

}
// Script for 4000 subjects
async function storeSubjectJson() {
  const results = [];
  console.log(new Date().toLocaleString());
  let elem = new Object();
  let medical_codes = new Array();
  const array = ["1000467511","1000499498","1001591450","1001711344","1002184755","1002745348"];
  fs.createReadStream('files/ten_thousand_sample.csv')
    .pipe(csv())
    .on('data', (element) => {
      elem = {
        "subject_id": element['patient_id'],
            "diagnosis_code": element['diagnosis_code'],
            "reference_id": element['mx_claim_id'],
            "reference_type": 'medicine',
            "service_from_date": element['service_from_date'],
            "fill_date": element['fill_date'],
            "m_doctor_id": element['rendering_provider_id'],
            "r_doctor_id": element['referring_provider_id'],
            "billing_provider_id": element['billing_provider_id'],
            "claim_id": element['claim_id'],
            "claim_status": element['claim_status']
      };
    //   let obj = results.find(o => o.subject_id === element['patient_id']);
    //   let objKey = results.findIndex(o => o.subject_id === element['patient_id']);
    //   if (obj) {
    //     (obj.medical_codes).push(elem.medical_codes[0]);
    //     results.splice(objKey, 1, obj);
    //   } else {
    //     results.push(elem);
    //   }
    if (array.includes(element['patient_id'])) {
        results.push(elem);
    }
      
    })
    .on('end', () => {
      var json = JSON.stringify(results);
      var fs = require('fs');
      fs.writeFile('files/medical_codes_limited.json', json, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log(new Date().toLocaleString());
          console.log('Successfully wrote file')
        }
      })

    });
};

// Script for Clinical Trials
async function storeTrialsJson() {
  const results = [];
  console.log(new Date().toLocaleString());
  let elem = new Object()
  let array = new Object();
  let exclusive_codes = new Array();
  let inclusive_codes = new Array();
  fs.createReadStream('files/clinical_trials_sample.csv')
    .pipe(csv())
    .on('data', (element) => {
      //console.log(element);
      //array = [];
      if (element['icd10_code']=='*') {
        element['icd10_code'] = '';
      }
      if (element['drug_code']=='*') {
        element['drug_code'] = '';
      }
      if (element['procedure_code']=='*') {
        element['procedure_code'] = '';
      }
      if (element['c_type']=='exclusion') {
        exclusive_codes =[   //  array of objects
          {
            diagnosis_code: element['icd10_code'],
            reference_id: element['drug_code'],
            reference_type: element['procedure_code'],            // will include procedure, medicine and more in future
            reference_date: '',
          }
        ]
      }else{
        inclusive_codes =[   //  array of objects
          {
            diagnosis_code: element['icd10_code'],
            reference_id: element['drug_code'],
            reference_type: element['procedure_code'],            // will include procedure, medicine and more in future
            reference_date: '',
          }
        ]
      }
      elem = {
      trial_id: element['nct_id'],
      NCTCode: element['nct_id'],
      protocol_id: element['protocol_id'],
      name: 'XYZ',
      description: element['desc'],
      Pharma: 'JNJ',
      Clinical: 'Jansen',
      Insurance: 'Allstate',
      startdate: '2021-23-12 05:51:53',
      enddate: '2021-23-07 05:51:53',
      totaltarget: '50',
      status: 'in_progress',
      subject_data: {
        consent: true,        // boolean
        gender: element['gender'].toLowerCase(),       // male,female , other
        minAge: element['min_age'],
        maxAge: element['max_age']??'100',
        homeless: false,      //  boolean
        zip_codes: [         //  array
          '3000', '4000', '5000'
        ],
      }
      
        
      };
      let obj = results.find(o => o.trial_id === element['nct_id']);
      let objKey = results.findIndex(o => o.trial_id === element['nct_id']);
      if (obj) {
        if(obj.inclusive_codes && (inclusive_codes).length>0){
          (obj.inclusive_codes).push(inclusive_codes[0]);
        }else{
          obj.inclusive_codes = inclusive_codes;
        }
        if(obj.exclusive_codes && (exclusive_codes).length>0){
          (obj.exclusive_codes).push(exclusive_codes[0]);
        }else{
          obj.exclusive_codes = exclusive_codes;
        }
        //console.log(obj);
        results.splice(objKey, 1, obj);
      } else {
        results.push(elem);
      }
    })
    .on('end', () => {
      var json = JSON.stringify(results);
      var fs = require('fs');
      fs.writeFile('files/TrialsJson.json', json, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log(new Date().toLocaleString());
          console.log('Successfully wrote file')
        }
      })

    });
};

function AppendMedicalCodes() {
  jsonReader('files/subjects.json', (err, subject) => {
      if (err) {
          console.log(err)
          return
      }
      let new_array = new Array();
      for(let i =0;i<subject.length;i++){
          if((subject[i].medical_codes).length>10000){
              new_array.push(subject[i]);
          }
      }
      let length = (new_array[0].medical_codes).length;
      let chunk=5000;
      
      let j =0,k=0;;
      let array_size=0;
      
      while(length>0){
        j++;
        if(length<chunk){
          chunk = length;
        }
        array_size =((new_array[0].medical_codes).slice(k,chunk+k)).length;
        k = k +chunk;
        length = length-chunk;
        console.log(`Remaining ${length} Items`);
        console.log(`Length ${array_size} Found`);
      }
      console.log(`Loop Ran: ${j} times`)
  })
}
//AppendMedicalCodes();
const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 3; i++) {
    console.log(i);
    await timer(3000); // then the created Promise can be awaited
  }
}
async function getMedicalCodes() {
  let user = 'admin';
  let subject_id = '798775082';
  let errors = new Array();
  let limit = 50000;
  let bookmark = '';
  try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'walletPharma');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const identity = await wallet.get(user);
      if (!identity) {
          console.log(`An identity for the user ${user} does not exist in the wallet`);
          console.log('Register User before retrying');
          return;
      }
      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork('medicalcodes');
      const contract = network.getContract('medicalcode');

      let result = await contract.evaluateTransaction('queryMedicalCodes',`{"selector":{}}`, limit, bookmark);
      result = JSON.parse(result);
      console.log(((result.data).length),result.pagination);
      await gateway.disconnect();
      
  } catch (error) {
      console.log(`Medical Code Returned with Error: ${error}`);
  }
}
//storeSubjectJson();
storeJson();
//getMedicalCodes();
//storeTrialsJson();
//test();
//storeTrialSingle();
