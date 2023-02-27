#!/bin/bash

# Define the name of the output file
fn="features.txt"

# Remove the output file if it already exists
if [ -f $fn ]; then
    rm $fn
fi

# Create an empty output file
touch $fn

# Loop over all the JSON files in the current directory
for entry in *.json; do
    # Extract the name of the JSON file without the extension, convert it to uppercase, and assign it to a variable
    n=$(echo ${entry%.*} | tr '[:lower:]' '[:upper:]')

    # Extract the values of all the fields in the JSON file, remove any spaces and quotes, and concatenate them into a single string separated by commas
    f=$(grep -o '[^[:space:]",]*' $entry | tr '\n' ',' | sed 's/,$//')
    # f=$(grep '"' $entry | sed 's/ //g; s/"[,]*//g' | xargs)

    # Write the name of the file and its fields to the output file
    echo "$n: $f" >> $fn
done
