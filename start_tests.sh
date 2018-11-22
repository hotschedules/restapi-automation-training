#!/usr/bin/env bash

# Finally run protractor and the selected environment
env baseUrl=$1 env=$2 namespace=$3 regression=true ./node_modules/.bin/mocha ./suite/$4 ./suite/setup.js --timeout 100000 --colors --reporter mocha-multi-reporters --reporter-options configFile=report.conf.json
