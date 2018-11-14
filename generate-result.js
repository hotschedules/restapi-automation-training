const request = require('request');
const fs = require('fs');

const _ = require('lodash');
const readline = require('readline');

const google = require('googleapis');
const googleAuth = require('google-auth-library');

const root_folder = process.cwd();

const _sheetVersion = 'v4';
const _auth = 'oauth2';
const client_id = '896411797155-10ialhfgupk3u8foho02b533gucjhh2c.apps.googleusercontent.com';
const client_secret = 'xnbuifA8M8AyTZRIMt--G3HK';
const refresh_token = '1/7iL7ApBJeANB1OKLZRS-iXd2aq2toqT0ckg5qPWM-yT7-YdLJwLCFcTKp0bVeRfY';
const api_key = 'AIzaSyBPQ7OUwlHNrVVoPNwGAcH031sBV949PGg';
const access_token = 'undefined';

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets'
];
const TOKEN_DIR = `${process.env.USERPROFILE || process.env.HOME ||
    process.env.HOMEPATH}/.credentials/`;

const TOKEN_PATH = `${TOKEN_DIR}sheets.googleapis.com-nodejs-quickstart.json`;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const requestData = `client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`;
    request(
      {
        url: `https://www.googleapis.com/${_auth}/${_sheetVersion}/token`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: false,
        body: requestData
      },
      (error, response, body) => {
        if (error)
          reject(error);
        try {
          const json = JSON.parse(response.body);
          resolve(json.access_token);
        } catch (_error) {
          resolve('Could not parse response when getting access token from Google.');
        }
      }
    );
  });
}

function getRow(rows, testcase) {
  return new Promise((resolve, reject) => {
    try {
      let rowNumber = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (String(row[1]).trim() === testcase.trim()) {
          console.info(`Found row: ${i + 1}`);
          console.info('[%s, %s, %s, %s]', row[0], row[1], row[2], row[3]);
          rowNumber = i + 1;
          break;
        }
      }
      resolve(rowNumber);
    } catch (error) {
      reject(error);
    }
  });
}

function getSheetData() {
  return new Promise(async (resolve, reject) => {
    const access_token = await getAccessToken();
    request(
      {
        url: `https://sheets.googleapis.com/${_sheetVersion}/spreadsheets/${argv.params._spreadsheetId}/values/${argv.params._range}?key=${api_key}&access_token=${access_token}`,
        method: 'GET'
      },
      (error, response, body) => {
        if (error)
          reject(error);
        try {
          const json = JSON.parse(response.body);
          resolve(json);
        } catch (_error) {
          resolve('Could not parse response when getting sheet data.');
        }
      }
    );
  });
}

// use fixed column
function insertEmptyColumn() {
  return new Promise(async (resolve, reject) => {
    const requestData = {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: argv.params._sheetId,
              dimension: 'COLUMNS',
              startIndex: 7,
              endIndex: 8
            }
          }
        }
      ]
    };
    const access_token = await getAccessToken();
    request(
      {
        url: `https://sheets.googleapis.com/${_sheetVersion}/spreadsheets/${argv.params._spreadsheetId}:batchUpdate?key=${api_key}&access_token=${access_token}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      (error, response, body) => {
        if (error)
          reject(error);
        console.log('Complete insert column result');
        resolve();
      }
    );
  });
}

// use fixed column
async function insertNewResultColumn(name) {
  await insertEmptyColumn();
  const range = `${argv.params._sheetName}!H1`;
  const value = [
    [name]
  ];
  await writeSingleRange(range, value);
  console.log(`complete insert new result column: ${name}`);
}

function writeSingleRange(range, value) {
  return new Promise(async (resolve, reject) => {
    const requestData = {
      range,
      majorDimension: 'ROWS',
      values: value,
    };
    const access_token = await getAccessToken();
    request(
      {
        url: `https://sheets.googleapis.com/${_sheetVersion}/spreadsheets/${argv.params._spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${api_key}&access_token=${access_token}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      (error, response, body) => {
        if (error)
          reject(error);
        console.log(`Complete write values into range${String(range)}`);
        resolve();
      }
    );
  });
}

function appendValue(range, value) {
  return new Promise(async (resolve, reject) => {
    const requestData = {
      range,
      majorDimension: 'ROWS',
      values: value,
    };
    const access_token = await getAccessToken();
    request(
      {
        url: `https://sheets.googleapis.com/${_sheetVersion}/spreadsheets/${argv.params._spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${api_key}&access_token=${access_token}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      (error, response, body) => {
        if (error)
          reject(error);
        console.log(`Complete append values into range: ${String(range)}`);
        resolve();
      }
    );
  });
}

async function processResult(totalRowCount, row, scriptFile, testcase, feature, owner, buildVersion, startTime, result) {
  let range = `${argv.params._sheetName}!A${row}:H${row}`;
  const value = [
    [scriptFile, testcase, feature, owner, buildVersion, startTime, null, result]
  ];
  if (row !== 0) { // Test case is existing on sheet
    await writeSingleRange(range, value);
    console.info(`Updated test case at row: ${row}, ${result}`);
  } else { // Test case is not existing on sheet
    range = `${argv.params._sheetName}!A${totalRowCount+1}:H${totalRowCount+1}`;
    await appendValue(range, value);
    console.info(`Added test case at row: ${totalRowCount+1}, ${result}`);
  }
}

function uploadGoogleResult(scriptFile, testcase, feature, owner, devBuildVersion, startTime, result) {
  return new Promise(async (resolve, reject) => {
    console.info(`*****start to upload result to Google sheet*****\n 
                    |_scriptFile: ${scriptFile}\n 
                    |_testcase: ${testcase}\n 
                    |_feature: ${feature} \n 
                    |_result: ${result}\n`);
    const json = await getSheetData();
    const rows = json.values;
    console.log('Total rows on the sheet is: ' + rows.length);
    const found = await getRow(rows, testcase);
    await processResult(rows.length, found, scriptFile, testcase, feature, owner, devBuildVersion, startTime, result);
    resolve();
  });
}

async function updateGoogleResultSheet(scriptFile, testcase, owner, team, result, resultColumnName, startTime, endTime, devBuildVersion) {
  let oauth2Client = null;
  flow = protractor.promise.controlFlow();

  const restCall = function _makeRestCall() {
    const d = protractor.promise.defer();
    setTimeout(() => {
      console.log('Google sheet API is calling');
      d.fulfill('ok');
    }, 15000);
    return d.promise;
  };
  flow.execute(restCall);

  return new Promise(async (resolve, reject) => {
    console.info(`-----start to update result on google sheet----- \n 
    -- scriptFile: ${scriptFile}\n 
    -- testcase: ${testcase}\n 
    -- owner: ${owner} \n 
    -- result: ${result}\n`);
    // Load client secrets from a local file.
    const content = await fs.readFileSync('client_secret_kms.json', (err, content) => {
      if (err) {
        console.log(`Error loading client secret file: ${err}`);
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
    });
    resolve(content);
  })
    .then(async (content) => {
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
      oauth2Client = await createAuthorization(JSON.parse(content));
      return new Promise(((resolve, reject) => {
        resolve(oauth2Client);
      }));
      // return createAuthorization(JSON.parse(content))
    })
    .then(async (oauth2Client) => {
      const response = await getTestCaseRow(oauth2Client);
      console.log(`Response: ${response}`);
      return new Promise(((resolve, reject) => {
        resolve(response);
      }));
    })
    .then(async (response) => {
      const rows = response.values;
      if (rows.length == 0) {
        console.log('No data found in response');
      } else {
        console.info('Script File ----- Test Case ---- Owner ----- Result');
        const rowNumber = await getRow(rows, testcase);
        console.log(`rowNumber: ${rowNumber}`);
        return new Promise(((resolve, reject) => {
          try {
            resolve(rowNumber);
          } catch (error) {
            console.log(error);
            reject(error);
          }
        }));
      }
    })
    .then(async (row) => {
      if (row != 0) { // Test case is existing on sheet
        const range1 = `${argv.params._sheetName}!A${row}:D${row}`;
        const data1 = {
          values: [[scriptFile, testcase, owner, team]]
        };

        let range2 = null;
        const data2 = {
          values: [[result, startTime, endTime]]
        };
        const range3 = `${argv.params._sheetName}!Q${row}`;
        const data3 = {
          values: [[devBuildVersion]]
        };
        switch (resultColumnName) {
          case 'chrome':
            range2 = `${argv.params._sheetName}!E${row}:G${row}`;
            break;
          case 'firefox':
            range2 = `${argv.params._sheetName}!H${row}:J${row}`;
            break;
          case 'ie':
            range2 = `${argv.params._sheetName}!K${row}:M${row}`;
            break;
          case 'safari':
            range2 = `${argv.params._sheetName}!N${row}:P${row}`;
            break;
        }

        await updateCellData(oauth2Client, range1, data1);
        await updateCellData(oauth2Client, range2, data2);
        await updateCellData(oauth2Client, range3, data3);
        console.info(`Test case row: ${row} is updated with result ${result} completely`);
      } else { // Test case is not existing on sheet
        const range = `${argv.params._sheetName}`;
        let data = null;
        switch (resultColumnName) {
          case 'chrome':
            data = {
              values: [[scriptFile, testcase, owner, team, result, startTime, endTime, '', '', '', '', '', '', '', '', '', devBuildVersion]]
            };
            break;
          case 'firefox':
            data = {
              values: [[scriptFile, testcase, owner, team, '', '', '', result, startTime, endTime, '', '', '', '', '', '', devBuildVersion]]
            };
            break;
          case 'ie':
            data = {
              values: [[scriptFile, testcase, owner, team, '', '', '', '', '', '', result, startTime, endTime, '', '', '', devBuildVersion]]
            };
            break;
          case 'safari':
            data = {
              values: [[scriptFile, testcase, owner, team, '', '', '', '', '', '', '', '', '', result, startTime, endTime, devBuildVersion]]
            };
            break;
        }
        await appendRowData(oauth2Client, range, data);
        console.info('Append one more test case row completely');
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];

  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      // console.info(`Token is going to use is: \n ${token}`)
      callback(oauth2Client);
    }
  });
}

function createAuthorization(credentials) {
  return promise((resolve, reject) => {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];

    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    console.info(`${process.env.USERPROFILE} \n ${process.env.HOME} \n ${process.env.HOMEPATH}`);
    const token = fs.readFileSync(TOKEN_PATH, (err, content) => {
      if (err) {
        console.log(`Error loading client token file: ${err}`);
      }
    });
    oauth2Client.credentials = JSON.parse(token);
    console.info('Complete create authorization and return.');
    resolve(oauth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
}

function updateCellData(auth, range, data) {
  return new Promise(((resolve, reject) => {
    try {
      const sheets = google.sheets(_sheetVersion);
      const request = sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: argv.params._spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: data
      }, (err, response) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          return;
        }
        console.log('-----Update Google cell data complete-----');
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  }));
}

function appendRowData(auth, range, data) {
  return new Promise(((resolve, reject) => {
    try {
      const sheets = google.sheets(_sheetVersion);
      const request = sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: argv.params._spreadsheetId,
        range,
        //valueInputOption: 'USER_ENTERED',
        resource: data
      }, (err, response) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          return;
        }
        console.info(`Complete append new row data: ${data.values[0][1]}`);
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  }));
}

function getCellData(auth) {
  return promise(async (resolve, reject) => {
    console.info(`auth is going to use ${JSON.stringify(auth)}`);
    const sheets = await google.sheets('v4');
    const request = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: spreadSheetId,
      range: 'Team2!A1:D'
    }, (err, response) => {
      console.info('Done request to get cell data');
      // console.log(`Response is ${ JSON.stringify(response) }`);
      if (err) {
        console.log(`The API returned an error: ${err}`);
        return;
      }
      const rows = response.values;
      if (rows.length == 0) {
        console.log('No data found.');
      } else {
        console.info('Name, Major:');
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // Print columns A and E, which correspond to indices 0 and 4.
          console.info('%s, %s', row[0], row[4]);
        }
      }
    });
  });
}

function getTestCaseRow(auth) {
  return new Promise((resolve, reject) => {
    try {
      console.info(`auth is going to use ${JSON.stringify(auth)}`);
      console.info('Start to get all test case rows');
      const sheets = google.sheets(_sheetVersion);
      const request = sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: argv.params._spreadsheetId,
        range: argv.params._range
      }, (err, response) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          return;
        }
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function verifyResultColumnExisted(auth, columnName, completion) {
  return promise(async (resolve, reject) => {
    console.info(`auth is going to use ${JSON.stringify(auth)}`);
    const sheets = await google.sheets(_sheetVersion);
    const request = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: argv.params._spreadsheetId,
      range: argv.params._range
    }, (err, response) => {
      if (err) {
        console.log(`The API returned an error: ${err}`);
        return;
      }
      const rows = response.values;
      if (rows.length == 0) {
        console.log('No data found in response');
      } else {
        // get the header row
        const row = rows[0];
        let columnNumber = 0;

        console.info(`number of columns is ${row.length}`);
        // check whether result column is inserted or not
        // --if existing, update on selected result column
        // --if not exist, insert new result column
        for (let i = 0; i < row.length; i++) {
          if (_.includes(String(row[i]).trim(), columnName)) {
            console.info(`Column Name ${String(row[i]).trim()} is at column index ${i}`);
            columnNumber = i;
            break;
          }
        }
        // column not existed
        if (columnNumber == 0) {
          completion(false, row.length);
        } else { // column existed
          completion(true, columnNumber + 1);
        }
      }
    });
  });
}

function insertRow(auth) {
  return promise(async (resolve, reject) => {
    const sheets = await google.sheets('v4');
    const request = await sheets.spreadsheets.batchUpdate({
      auth,
      // -- Hung's spreadsheet
      spreadsheetId: '1GVa6PJtF_9cSagX2kqgpbzcj9i2k9RCtpcBRmrdrICk',
      sheetId: '383824872',
      range: 'Team2!A1:D',
      dimension: 'ROWS',
      startIndex: 0,
      endIndex: 3
    }, (err, response) => {
      console.info('Done insert row');
      if (err) {
        console.log(`The API returned an error: ${err}`);
      }
    });
  });
}

module.exports = {
  updateGoogleResultSheet,
  getAccessToken,
  getSheetData,
  getRow,
  insertEmptyColumn,
  writeSingleRange,
  appendValue,
  insertNewResultColumn,
  uploadGoogleResult
};