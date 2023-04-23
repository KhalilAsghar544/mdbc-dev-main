# Your Repo Has Been Sucessfully Created
1. Install fabric sdk binaries for node js
2. Clone the repo and copy bin and config folder to the repo. 
3. run ./startFabric.sh
4. To add Insurance organization to the blockchain cd /test-network/addOrg3
5. run ./addOrg3.sh
6. To Interact with blockchain cd app/
7. To register admin run node enrollAdminClinical, enrollAdminInsurance and node enrollAdminPharma
8. To start blockchain api server run: npm run serve

Note: The port is defined in .env file

Routes for APIs:

Clinical:
Create User (Post)
http://localhost:{port}/api/clinical/createUser

Request Header: 
application/json

Request Body (raw): 
{
    "enrollmentId" : "KArshad1"
}

Verify User (Get)
http://localhost:{port}/api/clinical/verifyUser/{enrollmentId}'

Pharma:
Create User (Post)
http://localhost:{port}/api/pharma/createUser


Request Header: 
application/json

Request Body (raw): 
{
    "enrollmentId" : "KArshad1"
}

Verify User (Get)
http://localhost:{port}api/pharma/verifyUser/{enrollmentId}'

Insurance:
Create User (Post)
http://localhost:{port}/api/insurance/createUser


Request Header: 
application/json

Request Body (raw): 
{
    "enrollmentId" : "KArshad1"
}

Verify User (Get)
http://localhost:{port}/api/insurance/verifyUser/{enrollmentId}'

Clinical Trial:

Create Trial (Post)
http://localhost:{port}/api/trial/createTrial

Request Header: 
application/json

Request Body (raw): 
{
    "id":"0011",
    "name":"ABC",
    "description":"ABCDEF",
    "Pharma":"JNJ",
    "Clincial":"Jansen",
    "Insurance":"Allstate",
    "startdate":"2021-30-08 05:51:53",
    "enddate":"2021-02-09 05:50:00",
    "totaltarget":"45",
    "subject_data":{
              "consent": true,        
              "gender": "male",       
              "age": "24",              
              "homeless": false,      
              "zip_codes" : [         
                "3000","4000","5000"
              ] 
            },
    "inclusive_codes":[
            {
                "diagnosis_code": "001",
                "reference_id":"001",                
                "reference_type":"procedure",            
                "reference_date":"2021-23-08 05:51:50"
            },
            {
                "diagnosis_code": "002",
                "reference_id":"001",                
                "reference_type":"procedure",            
                "reference_date":"2021-23-08 05:51:50"
            },
            {
                "diagnosis_code": "003",
                "reference_id":"001",                
                "reference_type":"procedure",            
                "reference_date":"2021-23-08 05:51:50"
            }
    ],
    "exlusive_codes":[
            {
                "diagnosis_code": "001",
                "reference_id":"002",                
                "reference_type":"procedure",            
                "reference_date":"2021-23-08 05:51:50"
            },
            {
                "diagnosis_code": "002",
                "reference_id":"002",                
                "reference_type":"procedure",            
                "reference_date":"2021-23-08 05:51:50"
            },
            {
                "diagnosis_code": "003",
                "reference_id":"002",                
                "reference_type":"procedure",            
                "reference_date":"2021-23-08 05:51:50"
            }
    ]
}

See Trial by id (Get)
http://localhost:{port}/api/trial/getTrial/0001

For more api information check postman collection


See All Trials (Get)
http://localhost:{port}/api/trial/getAllTrials


Search Subject for trial:

    Modes:
    1. s_data : filter with only subject data   
    2. s_data_inc: filter with subject data and inclusive codes 
    3. s_data_inc_exc: filter with subject data, inclusive codes and exclusive codes 
    4. inc_only: filter with only inclusive codes 
    5. inc_exc: filter with inclusive codes and exclusive codes 
    6. s_data_ict_inc: filter with subject data and ICT inclusive codes
    7. s_data_ict_inc_ict_exc: filter with subject data, ICT inclusive codes and ICT exclusive codes
    8. s_data_ict_inc_exc: filter with subject data, ICT inclusive codes and exclusive codes
    9. s_data_inc_ict_exc: filter with subject data, inclusive codes and ICT exclusive codes
    10. s_data_ict_exc : filter with subject data, inclusive codes and ICT exclusive codes
    11. ict_inc: ICT inclusive codes only
    12. ict_inc_ict_exc: ICT inclusive codes and ICT exclusive codes
    13. ict_inc_exc: ICT inclusive codes and exclusive codes
    14. ict_exc: ICT  exclusive codes only
    15. ict_exc_inc: ICT  exclusive codes and inclusive codes
    16. exc_only: exclusive codes only


