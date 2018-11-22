const _ = require('lodash');
const moment = require('moment');
global.argv = require('yargs').argv;

const {insertNewResultColumn, uploadGoogleResult} = require('../generate-result');
const {backEndVersion} = require('../get-build-version');
const {googleReportConfig} = require('../constant/configVars.js');

let isRegressionRunning = false;
let isInsertNewResultColumn = false;
let isDebugGoogleReport = false;

const regression = process.env.regression;
const insertColumn = process.env.isInsertNewResultColumn;
const debugGoogleReport = process.env.debugGoogleReport;

if (typeof regression !== 'undefined' && regression === 'true') {
  isRegressionRunning = true;
}
console.log(`insert column: ${insertColumn}`);
if (typeof insertColumn !== 'undefined' && insertColumn === 'true') {
  console.log(`insert column: ${insertColumn}`);
  isInsertNewResultColumn = true;
}

if (typeof debugGoogleReport !== 'undefined' && debugGoogleReport === 'true') {
  isDebugGoogleReport = true;
}

const env = process.env.env;
argv.params = {};
if (typeof env !== 'undefined' && (env === 'qa' || env === 'stg')) {
  if (isDebugGoogleReport) {
    argv.params._spreadsheetId = googleReportConfig.qa_debug.spreadsheetId;
    argv.params._sheetName = googleReportConfig.qa_debug.sheetName;
    argv.params._range = googleReportConfig.qa_debug.range;
    argv.params._sheetId = googleReportConfig.qa_debug.sheetId;
  } else {
    argv.params._spreadsheetId = googleReportConfig.qa.spreadsheetId;
    argv.params._sheetName = googleReportConfig.qa.sheetName;
    argv.params._range = googleReportConfig.qa.range;
    argv.params._sheetId = googleReportConfig.qa.sheetId;
  }
} else if (typeof env !== 'undefined' && env === 'dev') {
  argv.params._spreadsheetId = googleReportConfig.dev.spreadsheetId;
  argv.params._sheetName = googleReportConfig.dev.sheetName;
  argv.params._range = googleReportConfig.dev.range;
  argv.params._sheetId = googleReportConfig.dev.sheetId;
}

let singleSuiteResult = [];
const failedSuites = [];
let previousDescribeName;
let currentDescribeName;
let currentSpecName;
let currentSpecStatus;
let startNewDescribe = 0;
let currentDescribeResult;

let previousStartTime;
let previousEndTime;
let currentStartTime;
let currentEndTime;

let beVersion = 'undefined';

const htmlReport = require('../generate-html-report');

const title = 'Rest API Automation Report';
const googleUrl = 'https://docs.google.com/spreadsheets/d/1W9R7RSd2ozO3OPrk63D-CgECJV-4LKEszwiW4LLxfAk/edit#gid=1578462828';
const qTestUrl = 'https://hotschedules.qtestnet.com//p/41560/portal/project#tab=testexecution&object=2&id=1817510';
const _htmlReport = new htmlReport(title, googleUrl, qTestUrl);

before(() => {
  return new Promise(async (resolve, reject) => {
    const date = new Date();
    currentStartTime = moment(date).format('YYYYMMMDD-HH:mm:ss');
    previousStartTime = currentStartTime;
    console.info(`Start launching rest api automation at ${currentStartTime}`);

    if (isRegressionRunning) {
      beVersion = await backEndVersion();
    }
    if (isInsertNewResultColumn) {
      await insertNewResultColumn(`Result-${currentStartTime}`);
    }
    resolve('Complete before hook');
  });
});

beforeEach(function () {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`${'beforeEach:' +
                '\n- step: '}${this.test.title
                    }\n- step object: ${this.currentTest
                    }\n- step title: ${this.currentTest.title
                    }\n- state: ${this.currentTest.state
                    }\n- describe name: ${this.currentTest.parent.fullTitle()}`
            );

      currentSpecName = this.currentTest.title;
      currentDescribeName = this.currentTest.parent.fullTitle();
      if (currentDescribeName !== previousDescribeName) {
                // start next describe
        startNewDescribe = 1;
      } else {
        startNewDescribe = 0;
      }

      if (startNewDescribe === 1) {
        const date = new Date();
        currentStartTime = moment(date).format('YYYYMMMDD-HH:mm:ss');
        console.info(`Start current suite: '${this.currentTest.parent.fullTitle()}' at ${currentStartTime}`);

                // user previousDescribeName and result to upload result into Google sheet
        if (previousDescribeName !== 'Config' && typeof previousDescribeName !== 'undefined' && isRegressionRunning) {
          await uploadGoogleResult(global.filename,
                        previousDescribeName,
                        global.feature,
                        global.owner,
                        `BE: ${beVersion}`,
                        previousStartTime,
                        currentDescribeResult
                    ).then(() => {
                      console.info('-----Complete update Google result-----');
                    }).catch((error) => {
                      reject(error);
                    });
          await _htmlReport.addRow(previousDescribeName, currentDescribeResult);
        }
                // re-initialize singleSuiteResult
        singleSuiteResult = [];
        startNewDescribe = 0;
        previousStartTime = currentStartTime;
      }
      previousDescribeName = currentDescribeName;
      resolve('Complete update Google result');
    } catch (error) {
      reject(error);
    }
  });
});

afterEach(function () {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`${'afterEach:' +
                '\n- step: '}${this.test.title
                    }\n- step object: ${this.currentTest
                    }\n- step title: ${this.currentTest.title
                    }\n- state: ${this.currentTest.state
                    }\n- describe name: ${this.currentTest.parent.fullTitle()}`
            );

      currentSpecStatus = this.currentTest.state;
      singleSuiteResult.push({specName: currentSpecName, specStatus: currentSpecStatus});

      const singleSuiteFailCount = singleSuiteResult.filter((result) => {
        return (result.specStatus !== 'passed' || (typeof result.specStatus === 'undefined'));
      }).length;
      console.log(`singleSuiteFailCount: ${singleSuiteFailCount}`);
      if (singleSuiteFailCount > 0) {
        currentDescribeResult = 'Failed';
      } else {
        currentDescribeResult = 'Passed';
      }
      resolve('Complete afterEach');
    } catch (error) {
      reject(error);
    }
  });
});

after(() => {
  return new Promise(async (resolve, reject) => {
    try {
      const date = new Date();
      currentTime = moment(date).format('YYYYMMMDD-HH:mm:ss');
      console.info(`End last suite: at ${currentTime}`);

      console.info('Tear down - upload last describe result into Google sheet');
      if (previousDescribeName != 'Config' && typeof previousDescribeName !== 'undefined' && startNewDescribe === 0 && isRegressionRunning) {
        await uploadGoogleResult(global.filename,
                    previousDescribeName,
                    global.feature,
                    global.owner,
                    `BE: ${beVersion}`,
                    previousStartTime,
                    currentDescribeResult
                ).then(() => {
                  console.info('-----Complete update Google result-----');
                }).catch((error) => {
                  reject(error);
                });
        await _htmlReport.addRow(previousDescribeName, currentDescribeResult);
        await _htmlReport.saveFile();
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
});