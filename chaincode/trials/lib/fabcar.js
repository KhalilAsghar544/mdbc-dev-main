'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
    async Init(stub) {
      let ret = stub.getFunctionAndParameters();
      console.info(ret);
      console.info('=========== Instantiated Marbles Chaincode ===========');
      return shim.success();
    }
  };
  
  shim.start(new Chaincode());