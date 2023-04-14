#!/bin/bash

set -e

# remove all json files that might be there from previous extraction
rm -f 72*.json

for node in "clab-all-7220-IXR-D1" "clab-all-7220-IXR-D2" "clab-all-7220-IXR-D2L" "clab-all-7220-IXR-D3" "clab-all-7220-IXR-D3L" "clab-all-7220-IXR-D5" "clab-all-7220-IXR-H2" "clab-all-7220-IXR-H3" "clab-all-7250-IXR-6" "clab-all-7250-IXR-6e" "clab-all-7250-IXR-10" "clab-all-7250-IXR-10e"
do
    platf_name=${node#clab-all-}
    docker exec ${node} sr_cli 'info from state system features | as json' | jq .system.features >> ${platf_name}.json &
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