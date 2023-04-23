#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    if [ $1 == 1 ]; then
     ORG="pharma"
    fi
    if [ $1 == 2 ]; then
     ORG="clinical"
    fi
    if [ $1 == 3 ]; then
     ORG="insurance"
    fi
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$ORG/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    if [ $1 == 1 ]; then
     ORG="pharma"
    fi
    if [ $1 == 2 ]; then
     ORG="clinical"
    fi
    if [ $1 == 3 ]; then
     ORG="insurance"
    fi
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$ORG/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=1
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/pharma.jnj.com/tlsca/tlsca.pharma.jnj.com-cert.pem
CAPEM=organizations/peerOrganizations/pharma.jnj.com/ca/ca.pharma.jnj.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/pharma.jnj.com/connection-pharma.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/pharma.jnj.com/connection-pharma.yaml

ORG=2
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/clinical.jnj.com/tlsca/tlsca.clinical.jnj.com-cert.pem
CAPEM=organizations/peerOrganizations/clinical.jnj.com/ca/ca.clinical.jnj.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/clinical.jnj.com/connection-clinical.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/clinical.jnj.com/connection-clinical.yaml
