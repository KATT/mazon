#!/usr/bin/env bash

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null

watchify --entry masonry.js --outfile browser/dist/masonry.standalone.js --standalone masonry

popd > /dev/null
