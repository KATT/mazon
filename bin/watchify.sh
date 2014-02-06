#!/usr/bin/env bash

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null

watchify --entry mazon.js --outfile browser/dist/mazon.standalone.js --standalone mazon

popd > /dev/null
