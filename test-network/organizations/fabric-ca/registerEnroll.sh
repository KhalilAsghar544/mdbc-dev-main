#!/bin/bash

function createPharma() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/pharma.jnj.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/pharma.jnj.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca-pharma --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-pharma.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-pharma.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-pharma.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-pharma.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/peerOrganizations/pharma.jnj.com/msp/config.yaml

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-pharma --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-pharma --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-pharma --id.name pharmaadmin --id.secret pharmaadminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-pharma -M ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/msp --csr.hosts peer0.pharma.jnj.com --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/msp/config.yaml

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-pharma -M ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls --enrollment.profile tls --csr.hosts peer0.pharma.jnj.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/ca.crt
  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/server.crt
  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/server.key

  mkdir -p ${PWD}/organizations/peerOrganizations/pharma.jnj.com/msp/tlscacerts
  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/pharma.jnj.com/msp/tlscacerts/ca.crt

  mkdir -p ${PWD}/organizations/peerOrganizations/pharma.jnj.com/tlsca
  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/pharma.jnj.com/tlsca/tlsca.pharma.jnj.com-cert.pem

  mkdir -p ${PWD}/organizations/peerOrganizations/pharma.jnj.com/ca
  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/peers/peer0.pharma.jnj.com/msp/cacerts/* ${PWD}/organizations/peerOrganizations/pharma.jnj.com/ca/ca.pharma.jnj.com-cert.pem

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca-pharma -M ${PWD}/organizations/peerOrganizations/pharma.jnj.com/users/User1@pharma.jnj.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/pharma.jnj.com/users/User1@pharma.jnj.com/msp/config.yaml

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://pharmaadmin:pharmaadminpw@localhost:7054 --caname ca-pharma -M ${PWD}/organizations/peerOrganizations/pharma.jnj.com/users/Admin@pharma.jnj.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/pharma/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/pharma.jnj.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/pharma.jnj.com/users/Admin@pharma.jnj.com/msp/config.yaml
}

function createClinical() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/clinical.jnj.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/clinical.jnj.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca-clinical --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-clinical.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-clinical.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-clinical.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-clinical.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/peerOrganizations/clinical.jnj.com/msp/config.yaml

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-clinical --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-clinical --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-clinical --id.name clinicaladmin --id.secret clinicaladminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-clinical -M ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/msp --csr.hosts peer0.clinical.jnj.com --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/msp/config.yaml

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-clinical -M ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls --enrollment.profile tls --csr.hosts peer0.clinical.jnj.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/ca.crt
  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/server.crt
  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/server.key

  mkdir -p ${PWD}/organizations/peerOrganizations/clinical.jnj.com/msp/tlscacerts
  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/clinical.jnj.com/msp/tlscacerts/ca.crt

  mkdir -p ${PWD}/organizations/peerOrganizations/clinical.jnj.com/tlsca
  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/clinical.jnj.com/tlsca/tlsca.clinical.jnj.com-cert.pem

  mkdir -p ${PWD}/organizations/peerOrganizations/clinical.jnj.com/ca
  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/peers/peer0.clinical.jnj.com/msp/cacerts/* ${PWD}/organizations/peerOrganizations/clinical.jnj.com/ca/ca.clinical.jnj.com-cert.pem

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca-clinical -M ${PWD}/organizations/peerOrganizations/clinical.jnj.com/users/User1@clinical.jnj.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/clinical.jnj.com/users/User1@clinical.jnj.com/msp/config.yaml

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://clinicaladmin:clinicaladminpw@localhost:8054 --caname ca-clinical -M ${PWD}/organizations/peerOrganizations/clinical.jnj.com/users/Admin@clinical.jnj.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/clinical/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/clinical.jnj.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/clinical.jnj.com/users/Admin@clinical.jnj.com/msp/config.yaml
}

function createOrderer() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/ordererOrganizations/jnj.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/ordererOrganizations/jnj.com

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/ordererOrganizations/jnj.com/msp/config.yaml

  infoln "Registering orderer"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering the orderer admin"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Generating the orderer msp"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/msp --csr.hosts orderer.jnj.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/ordererOrganizations/jnj.com/msp/config.yaml ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/msp/config.yaml

  infoln "Generating the orderer-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls --enrollment.profile tls --csr.hosts orderer.jnj.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/tlscacerts/* ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/ca.crt
  cp ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/signcerts/* ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/server.crt
  cp ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/keystore/* ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/server.key

  mkdir -p ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/msp/tlscacerts
  cp ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/tlscacerts/* ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/msp/tlscacerts/tlsca.jnj.com-cert.pem

  mkdir -p ${PWD}/organizations/ordererOrganizations/jnj.com/msp/tlscacerts
  cp ${PWD}/organizations/ordererOrganizations/jnj.com/orderers/orderer.jnj.com/tls/tlscacerts/* ${PWD}/organizations/ordererOrganizations/jnj.com/msp/tlscacerts/tlsca.jnj.com-cert.pem

  infoln "Generating the admin msp"
  set -x
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/organizations/ordererOrganizations/jnj.com/users/Admin@jnj.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/ordererOrganizations/jnj.com/msp/config.yaml ${PWD}/organizations/ordererOrganizations/jnj.com/users/Admin@jnj.com/msp/config.yaml
}
