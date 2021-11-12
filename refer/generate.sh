#!/usr/bin/bash

# VERSION 5
# Script requires docker, gnmic (v0.20.0), jstree-to-bulma.html

# In case of bad interpreter error
# sed -i -e 's/\r$//' get-v5.sh

# PYANG RESPONSE HANDLER
response_handler() {
  if [[ $1 == *"not found"* ]]; then
    MISSING=$(echo $1 | grep -oP '\S+ is not found' | awk -F '"' '{print $2}' | sort | uniq | paste -s -d, -)
    echo "$2: Model [$MISSING] not found."
  else
    echo "$2: OK"
  fi
}

# DOCKER PULL PYANG IMAGE
docker pull ghcr.io/hellt/pyang:2.5.0

# Keep appending new releases
SRL_VER_LIST=("21.3.1" "21.3.2" "21.6.1" "21.6.2" "21.6.3")

for SRL_VER in ${SRL_VER_LIST[@]}
do
  echo
  # Extract end user release cycle
  SRL_VER_CYCLE=$(echo $SRL_VER | cut -d'-' -f1)
  SRL_VER_CYCLE="v$SRL_VER_CYCLE"

  # PULL SRL YANG MODEL
  DIR_NAME="$(pwd)/srl-$SRL_VER-yang-models"

  docker pull ghcr.io/nokia/srlinux:$SRL_VER
  id=$(docker create ghcr.io/nokia/srlinux:$SRL_VER foo)

  mkdir -p $DIR_NAME
  mkdir -p $SRL_VER_CYCLE
  docker cp $id:/opt/srlinux/models/. $DIR_NAME
  docker rm $id

  cd $DIR_NAME
  
  # Add (-i.bkp) to sed commands to backup the orginal file
  # Formatting namespaces
  sed -i 's/prefix srl_nokia-if;/prefix srl_nokia-tools-if;/g' srl_nokia/models/interfaces/srl_nokia-tools-interfaces.yang
  sed -i 's|default "::";|//default "::";|g' srl_nokia/models/system/srl_nokia-gnmi-server.yang
  sed -i 's|default "::";|//default "::";|g' srl_nokia/models/system/srl_nokia-json-rpc.yang
  sed -i 's|default "::";|//default "::";|g' srl_nokia/models/system/srl_nokia-snmp.yang

  sed -i 's|starts-with(../name|starts-with(../srl_nokia-if:name|g' srl_nokia/models/qos/srl_nokia-qos.yang
  sed -i 's|not(../breakout-mode|not(../srl_nokia-if:breakout-mode|g' srl_nokia/models/qos/srl_nokia-qos.yang
  sed -i 's|../../../router-id|../../../srl_nokia-netinst:router-id|g' srl_nokia/models/network-instance/srl_nokia-ospf.yang

  # PATHS AS TEXT + JSON
  gnmic generate path --file srl_nokia/models --dir ietf/ --types > ../$SRL_VER_CYCLE/paths.txt
  gnmic generate path --file srl_nokia/models --dir ietf/ --json > ../$SRL_VER_CYCLE/paths.json

  echo
  # PYANG TREE + JSTREE
  #---------------------
  # Create combined folder with all YANG files
  mkdir -p combined
  find ./srl_nokia -name "*.yang" | xargs -I % cp % combined

  # PYANG TREE
  RESPONSE=$(docker run --rm  -v $(pwd):/yang ghcr.io/hellt/pyang pyang -p ietf:iana:srl_nokia/models -f tree combined/*.yang -o tree.txt 2>&1 >/dev/null)
  response_handler "$RESPONSE" "$SRL_VER-tree"

  # PYANG JSTREE
  RESPONSE=$(docker run --rm  -v $(pwd):/yang ghcr.io/hellt/pyang pyang -p ietf:iana:srl_nokia/models --plugindir /opt/pyang-oc-plugin -f oc-jstree --oc-jstree-strip combined/*.yang -o tree.html 2>&1 >/dev/null)
  response_handler "$RESPONSE" "$SRL_VER-jstree"

  # Delete combined folder
  rm -rf combined
  
  # JSTREE PRETTY
  #-------------------
  # Navigate into release folder
  mv tree.txt tree.html ../$SRL_VER_CYCLE
  cd ../$SRL_VER_CYCLE

  # Add custom Bulma CSS break point (REMOVE)
  sed -i '0,/^<tr id="/s/^<tr id="/REMOVE\n<tr id="/' tree.html

  # Delete all lines from start of the file till the line REMOVE
  sed -i '0,/^REMOVE$/d' tree.html

  # Append Bulma CSS
  cat ../jstree-to-bulma.html tree.html > tmp.html
  mv tmp.html tree.html

  # Clearing unnecessary variables
  sed -i "s| (MODEL)||g" tree.html
  sed -i 's| class="a"||g' tree.html

  # Extend table divider to include last column
  sed -i 's|^\s\{,\}</td></tr>|        </td><td></td></tr>|g' tree.html

  # Add SRL version to page title
  sed -i "s|SRL_VER|$SRL_VER_CYCLE|g" tree.html
  MODULE_HTML="<p class='title is-6'><font color=blue>Nokia SR Linux $SRL_VER_CYCLE YANG Browser</font></p>\n"
  sed -i "s|MODULES|$MODULE_HTML|g" tree.html

  cd ..
  echo
done