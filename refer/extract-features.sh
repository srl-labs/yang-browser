#!/bin/bash

# this script extracts yang features from all supported srlinux hw variants 
# and aggregates them into a single file that is then processed by the yang browser.
# the script deploys a topology with all supported hw variants and extracts the features first
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
mkdir -p ../../release/$SRL_VERSION
mv $fn ../../release/$SRL_VERSION

echo "Features aggregated into a features.txt file!"