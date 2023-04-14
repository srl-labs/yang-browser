#!/bin/bash

set -e

# remove all json files that might be there from previous extraction
rm -f 72*.json

for node in "7220-IXR-D1" "7220-IXR-D2" "7220-IXR-D2L" "7220-IXR-D3" "7220-IXR-D3L" "7220-IXR-D5" "7220-IXR-H2" "7220-IXR-H3" "7250-IXR-6" "7250-IXR-6e" "7250-IXR-10" "7250-IXR-10e"
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