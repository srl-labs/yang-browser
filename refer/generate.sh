#!/usr/bin/bash

# Script requires docker, gnmic (>v0.21.0), jstree-to-bulma.html, index.html.tmpl

# In case of bad interpreter error perform:
# sed -i -e 's/\r$//' generate.sh

# execute from repo root as `bash refer/generate.sh <srl_nokia | openconfig> [<srl_release1> <srl_release2> ...]`
# example: bash refer/generate.sh srl_nokia 22.11.1

# convert features from the D2L json file to pyang format so that we can generate
# tree and jstree output for a featureset of D2L
extract_pyang_features() {
  features_mod="srl_nokia-features"
  # read the 7220-IXR-D2L.json file and extract comma separated features
  # the paths are relative to the ./refer/srl-$SRL_VER-yang-models folder
  # if sr linux release is > 24 than use the simplified feature list
  if [ $(echo $SRL_VER | cut -d'.' -f1) -ge 24 ]; then
    fs=$(cat ../../tmp/7220-IXR-D2L.json | jq -r 'join(",")')
  else
    fs=$(jq --argjson unusedFeatures "$(cat ../unused-features.json)" 'map(select(. as $in | any($unusedFeatures[]; . == $in) | not))' ../../tmp/7220-IXR-D2L.json | jq -r 'join(",")')
  fi

  echo ${features_mod}:${fs}
}

MODEL_TYPE="$1"

# SR Linux release version are passed as a space separated list of release version
SRL_VER_LIST="${@:2}"

GNMIC_CONTAINER=ghcr.io/openconfig/gnmic:0.32.0

PYANG_CONTAINER=ghcr.io/hellt/pyang:2.5.3

# Verify if model type is provided
if [ "$MODEL_TYPE" = "srl_nokia" ]; then
  MODEL_PATH="srl_nokia/models"
  GNMIC_ADDONS="--dir ietf/ --dir openconfig"
elif [ "$MODEL_TYPE" = "openconfig" ]; then
  MODEL_PATH="openconfig"
  GNMIC_ADDONS="--dir ietf/ --dir iana/ --exclude ietf-interfaces"
else
  echo "Error: Model must be specified (srl_nokia | openconfig)."
  exit 1
fi

# change into the script directory
SCRIPT_DIR="$(realpath $(dirname "$0"))"
cd $SCRIPT_DIR

# PYANG RESPONSE HANDLER
response_handler() {
  if [[ $1 == *"not found"* ]]; then
    MISSING=$(echo $1 | grep -oP '\S+ is not found' | awk -F '"' '{print $2}' | sort | uniq | paste -s -d, -)
    echo "$2: Model [$MISSING] not found."
  else
    echo "$2: OK"
  fi
}



for SRL_VER in ${SRL_VER_LIST[@]}; do
  echo
  # Extract end user release cycle
  SRL_VER_CYCLE=v$(echo $SRL_VER | cut -d'-' -f1)

  # PULL SRL YANG MODEL
  YANG_DIR_NAME="$(pwd)/srl-$SRL_VER-yang-models"

  docker pull ghcr.io/nokia/srlinux:$SRL_VER || echo "using local image"
  id=$(docker create ghcr.io/nokia/srlinux:$SRL_VER foo)

  mkdir -p $YANG_DIR_NAME
  docker cp $id:/opt/srlinux/models/. $YANG_DIR_NAME
  docker rm $id

  cd $YANG_DIR_NAME
  PROCEED=0
  if [ "$MODEL_TYPE" = "srl_nokia" ]; then
    mkdir -p ../../static/releases/$SRL_VER_CYCLE
    OUT_DIR=$(realpath ../../static/releases/$SRL_VER_CYCLE)
    PROCEED=1
  elif [ "$MODEL_TYPE" = "openconfig" ]; then
    if [ -d "./openconfig" ]; then
      mkdir -p ../../static/releases/$SRL_VER_CYCLE/openconfig
      OUT_DIR=$(realpath ../../static/releases/$SRL_VER_CYCLE/openconfig)
      PROCEED=1
    else
      echo
      echo "Warning: $SRL_VER does not have any openconfig yang model."
    fi
  fi

  if [ $PROCEED -eq 1 ]; then
    # if [ "$1" = "srl_nokia" ]; then
      # placeholder for models massaging if needed for a particual model/release
      # sed -i 's/modifier "invert-match";//g' srl_nokia/models/common/srl_nokia-common.yang # remove modifiers that are not supported by goyang
      # echo ""
    # fi

    echo
    # PYANG TREE + JSTREE
    #---------------------
    # Create combined folder with all YANG files
    mkdir -p combined
    find ./$MODEL_PATH -name "*.yang" | xargs -I % cp % combined

    # extract pyang features
    features=$(extract_pyang_features)
    # echo "Features: $features"
    
    # PYANG TREE
    # this is just for testing of features that are missing in yang
    # comment out when done
    # docker run --rm -v $(pwd):/yang $PYANG_CONTAINER pyang -p ietf:iana:$MODEL_PATH -f tree -F ${features} combined/*.yang -o tree.txt
    # exit 1
    # end of testing

    RESPONSE=$(docker run --rm -v $(pwd):/yang $PYANG_CONTAINER pyang -p ietf:iana:$MODEL_PATH -f tree -F ${features} combined/*.yang -o tree.txt 2>&1 >/dev/null)
    response_handler "$RESPONSE" "$SRL_VER-tree"

    # PYANG JSTREE
    RESPONSE=$(docker run --rm -v $(pwd):/yang $PYANG_CONTAINER pyang -p ietf:iana:$MODEL_PATH --plugindir /opt/pyang-oc-plugin -f oc-jstree -F ${features} --oc-jstree-strip combined/*.yang -o tree.html 2>&1 >/dev/null)
    response_handler "$RESPONSE" "$SRL_VER-jstree"

    # Delete combined folder
    rm -rf combined

    # JSTREE PRETTY
    #-------------------
    # Navigate into release folder
    mv tree.txt tree.html $OUT_DIR
    cd $OUT_DIR

    # Add custom Bulma CSS break point (REMOVE)
    sed -i '0,/^<tr id="/s/^<tr id="/REMOVE\n<tr id="/' tree.html

    # Delete all lines from start of the file till the line REMOVE
    sed -i '0,/^REMOVE$/d' tree.html

    # Append Bulma CSS
    if [ "$MODEL_TYPE" = "srl_nokia" ]; then
      cat $SCRIPT_DIR/jstree-to-bulma.html tree.html >tmp.html
    elif [ "$MODEL_TYPE" = "openconfig" ]; then
      cat $SCRIPT_DIR/oc-jstree-to-bulma.html tree.html >tmp.html
    fi

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

    # PATH SEARCH TOOL
    #-------------------
    # remove tools modules as they clash with regular leaves and are not relevant for the path search
    cd $YANG_DIR_NAME
    find ./ -name "*tools*.yang" -exec rm -f {} \;

    # GENERATE PATHS. TEXT + JSON
    docker run --rm -v $(pwd):/yang -w /yang $GNMIC_CONTAINER generate path --file $MODEL_PATH $GNMIC_ADDONS --types >$OUT_DIR/paths.txt
    docker run --rm -v $(pwd):/yang -w /yang $GNMIC_CONTAINER generate path --file $MODEL_PATH $GNMIC_ADDONS --with-prefix --json >$OUT_DIR/paths.json

    cd $SCRIPT_DIR
    # copy per-release index page to output dir
    if [ "$MODEL_TYPE" = "srl_nokia" ]; then
      cp index.html.tmpl $OUT_DIR/index.html
    elif [ "$MODEL_TYPE" = "openconfig" ]; then
      cp oc-index.html.tmpl $OUT_DIR/index.html
    fi
    echo
  fi
done

