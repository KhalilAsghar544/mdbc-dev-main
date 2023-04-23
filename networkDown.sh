#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -ex

# Bring the test network down
pushd test-network
./network.sh down
#docker container stop $(docker container ls -aq)
#docker container rm $(docker container ls -aq)
popd

# clean out any old identites in the wallets
rm -rf app/wallet*
