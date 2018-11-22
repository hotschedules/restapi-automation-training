set baseUrl=https://inventory.bodhi-qa.io
set env=qa
set namespace=kmsappstore
set regression=true
node_modules\.bin\mocha suite\regression-Feature.js suite\setup.js --timeout 100000 --reporter mocha-jenkins-reporter --reporter-options junit_report_path=reports\JUnitResult.xml