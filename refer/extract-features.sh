#!/bin/bash

# this script extracts yang features from all supported srlinux hw variants 
# and aggregates them into a single file that is then processed by the yang browser.
# the script deploys a topology with all supported hw variants and extracts the features first

# the script first creates a json file per each platform with the features extracted from the platform using `info from state system features` command
# then it aggregates all the json files into a single file that is then processed by the yang browser

# note, that some features for platforms prior to 24.3.1 release reported by the platform might not be present in the YANG, which cause the pyang to error.
# to date the following features were identified as invalid for D2L platform, they have to be removed from the JSON file before `generate.sh` script is called
# bgp-app-warm-restart
# cam-cammgr-thread-programming
# cam-multithread-programming
# dynamic-mcid
# future-23-7
# ipv6
# irb-interface,
# l2-mac-learn-mgr-warm-restart
# l2-mac-mgr-warm-restart
# l2-static-mac-mgr-warm-restart
# load-persistent-passwords-at-startup,
# mgmt-server-app-warm-restart,
# qos-high-threshold-system-limit,
# snmp-mib-bgp
# snmp-mib-chassis,
# snmp-mib-interface

# example:
# SRL_VERSION=23.10.4 LIC_PATH=/opt/nokia/srl/23-10.lic bash refer/extract-features.sh
# note, that the script doesn't remove the lab after the features are extracted.
# the script must be executed from the root of this repo.

set -e

# export SRL_VERSION that is used by the containerlab to spin up the needed version of srl container
export SRL_VERSION

RELEASE_DIR=./static/releases/v${SRL_VERSION}
FEATURES_DIR=${RELEASE_DIR}/platform_features

# move the features file to the release folder
echo "making directory ${FEATURES_DIR}"
mkdir -p ${FEATURES_DIR}

containerlab deploy -c -t ./refer/all.clab.yml

# remove all json files that might be there from previous extraction
rm -f ${FEATURES_DIR}/*.json

for node in "7215-IXS-A1" "7220-IXR-D1" "7220-IXR-D2L" "7220-IXR-D3L" "7220-IXR-D4" "7220-IXR-D5" "7220-IXR-H2" "7220-IXR-H3" "7220-IXR-H4" "7220-IXR-H4-32D" "7220-IXR-H5-32D" "7220-IXR-H5-64O" "7220-IXR-H5-64D" "7250-IXR-6e" "7250-IXR-10e" "7250-IXR-18e" "7250-IXR-X1b" "7250-IXR-X3b" "7730-SXR-1d-32d" "7730-SXR-1x-44s"
do
    docker exec clab-all-${node} sr_cli 'info from state system features | as json' | jq .features >> ${FEATURES_DIR}/${node}.json &
done

wait
echo "Features have been extracted to JSON files, proceeding with aggregating them into a single file..."

# change to platform features directory
pushd ${FEATURES_DIR}
# file name to extract features for all platforms
# it resides in the release dir, and not features dir
fn="../features.txt"

# Remove the output file if it already exists
if [ -f $fn ]; then
    rm $fn
fi

for entry in *.json; do
    # Extract the name of the JSON file without the extension, convert it to uppercase, and assign it to a variable
    platform=$(echo ${entry%.*} | tr '[:lower:]' '[:upper:]')

    # extract features from json and space separate them
    features=$(jq -r 'join(" ")' ${entry})

    # Write the name of the file and its fields to the output file
    echo "$platform: $features" >> $fn
done
popd

echo "Features aggregated into a features.txt file!"