#!/bin/bash

# this script extracts yang features from all supported srlinux hw variants 
# and aggregates them into a single file that is then processed by the yang browser.
# the script deploys a topology with all supported hw variants and extracts the features first

# the script first creates a json file per each platform with the features extracted from the platform using `info from state system features` command
# then it aggregates all the json files into a single file that is then processed by the yang browser

# note, that some features reported by the platform might not be present in the YANG, which cause the pyang to error.
# to date the following features were identified as invalid for D2L platform, they have to be removed from the JSON file before `generate.sh` script is called
# cam-cammgr-thread-programming
# cam-multithread-programming
# future-23-3
# ipv6
# irb-interface,
# load-persistent-passwords-at-startup,
# mgmt-server-app-warm-restart,
# qos-high-threshold-system-limit,
# snmp-mib-chassis,
# snmp-mib-interface

# example:
# SRL_VERSION=23.3.3 bash refer/extract-features.sh
# note, that the script doesn't remove the lab after the features are extracted.

set -e

# export SRL_VERSION that is used by the containerlab to spin up the needed version of srl container
export SRL_VERSION

# remove all json files that might be there from previous extraction
rm -f 72*.json

sudo -E containerlab deploy -c -t ./refer/all.clab.yml

for node in "7220-IXR-D1" "7220-IXR-D2" "7220-IXR-D2L" "7220-IXR-D3" "7220-IXR-D3L" "7220-IXR-D4" "7220-IXR-D5" "7220-IXR-D5T" "7220-IXR-H2" "7220-IXR-H3" "7220-IXR-H4" "7250-IXR-6" "7250-IXR-6e" "7250-IXR-10" "7250-IXR-10e"
do
    docker exec clab-all-${node} sr_cli 'info from state system features | as json' | jq .system.features >> ${node}.json &
done

wait
echo "Features have been extracted to JSON files, proceeding with aggregating them into a single file..."

# file name to extract features for all platforms
fn="features.txt"

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

# move the features file to the release folder
echo "macking directory $(realpath ./release/v$SRL_VERSION)"
mkdir -p ./release/v$SRL_VERSION
mv $fn ./release/v$SRL_VERSION

echo "Features aggregated into a features.txt file!"