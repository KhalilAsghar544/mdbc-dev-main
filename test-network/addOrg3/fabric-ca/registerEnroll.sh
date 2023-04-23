#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function createOrg3 {
	infoln "Enrolling the CA admin"
	mkdir -p ../organizations/peerOrganizations/insurance.jnj.com/

	export FABRIC_CA_CLIENT_HOME=${PWD}/../organizations/peerOrganizations/insurance.jnj.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca-insurance --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-insurance.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-insurance.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-insurance.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-insurance.pem
    OrganizationalUnitIdentifier: orderer' > ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/msp/config.yaml

	infoln "Registering peer0"
  set -x
	fabric-ca-client register --caname ca-insurance --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-insurance --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-insurance --id.name insuranceadmin --id.secret insuranceadminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
	fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-insurance -M ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/msp --csr.hosts peer0.insurance.jnj.com --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/msp/config.yaml ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/msp/config.yaml

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-insurance -M ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls --enrollment.profile tls --csr.hosts peer0.insurance.jnj.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null


  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/tlscacerts/* ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/ca.crt
  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/signcerts/* ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/server.crt
  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/keystore/* ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/server.key

  mkdir ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/msp/tlscacerts
  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/tlscacerts/* ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/tlsca
  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/tls/tlscacerts/* ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/tlsca/tlsca.insurance.jnj.com-cert.pem

  mkdir ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/ca
  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/peers/peer0.insurance.jnj.com/msp/cacerts/* ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/ca/ca.insurance.jnj.com-cert.pem

  infoln "Generating the user msp"
  set -x
	fabric-ca-client enroll -u https://user1:user1pw@localhost:11054 --caname ca-insurance -M ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/users/User1@insurance.jnj.com/msp --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/msp/config.yaml ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/users/User1@insurance.jnj.com/msp/config.yaml

  infoln "Generating the org admin msp"
  set -x
	fabric-ca-client enroll -u https://insuranceadmin:insuranceadminpw@localhost:11054 --caname ca-insurance -M ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/users/Admin@insurance.jnj.com/msp --tls.certfiles ${PWD}/fabric-ca/insurance/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/msp/config.yaml ${PWD}/../organizations/peerOrganizations/insurance.jnj.com/users/Admin@insurance.jnj.com/msp/config.yaml
}
