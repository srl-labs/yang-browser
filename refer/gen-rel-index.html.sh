#!/bin/bash

# this script generates per-release index.hml files from a template index.html.tmpl file

# Keep appending new releases
SRL_VER_LIST=("21.3.1" "21.3.2" "21.6.1" "21.6.2" "21.6.3")

# change into the script directory
cd "$(dirname "$0")"

for SRL_VER in ${SRL_VER_LIST[@]}
do
  cp ./index.html.tmpl ../v${SRL_VER}/index.html
done