#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e
CC_SRC_PATH1="../chaincode/trials"
CC_SRC_PATH2="../chaincode/subjects"
CC_SRC_PATH3="../chaincode/map_trials"
CC_SRC_PATH4="../chaincode/iot_devices"
CC_SRC_PATH5="../chaincode/medical_codes"
# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)

# clean out any old identites in the wallets
rm -rf app/wallet*

# launch network; create channel and join peer to channel
pushd test-network
./network.sh down
./network.sh up createChannel -ca -c trials -s couchdb
./network.sh up createChannel -ca -c subjects -s couchdb
./network.sh up createChannel -ca -c mappings -s couchdb
./network.sh up createChannel -ca -c iotdevices -s couchdb
./network.sh up createChannel -ca -c medicalcodes -s couchdb
#./network.sh up createChannel subjects -ca -s couchdb

popd
pushd test-network/addOrg3
pwd
./addOrg3.sh up -c trials
./addOrg3.sh join -c subjects
./addOrg3.sh join -c mappings
./addOrg3.sh join -c iotdevices
./addOrg3.sh join -c medicalcodes
#./addOrg3.sh up -c subjects -s couchdb
popd
pushd test-network

./network.sh deployCC -c trials -ccn clinicaltrial -ccv 1 -cci initLedger -ccl javascript -ccp ${CC_SRC_PATH1}
./network.sh deployCC -c subjects -ccn insurancesubject -ccv 1 -cci initSubjects -ccl javascript -ccp ${CC_SRC_PATH2}
./network.sh deployCC -c mappings -ccn maptrial -ccv 1 -cci initLedger -ccl javascript -ccp ${CC_SRC_PATH3}
./network.sh deployCC -c iotdevices -ccn iotdevice -ccv 1 -cci initLedger -ccl javascript -ccp ${CC_SRC_PATH4}
./network.sh deployCC -c medicalcodes -ccn medicalcode -ccv 1 -cci initLedger -ccl javascript -ccp ${CC_SRC_PATH5}

# infoln ${CC_SRC_PATH}
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

Next, use this applications to interact with the deployed contract.

  Start by changing into the "javascript" directory:
    cd app

  Next, install all required packages:
    npm install

  Then run the following applications to enroll the admin user, and register a new user
  called appUser which will be used by the other applications to interact with the deployed:
    node enrollAdmins


EOF
