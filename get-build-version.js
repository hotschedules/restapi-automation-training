#!/usr/local/bin/node
const request = require('request');

let env = 'qa';
let nameSpace = `${process.env.nameSpace}`;
// Read values from command line

for (let i = 3; i < process.argv.length; i++) {
  const match = process.argv[i].match(/^--params\.([^=]+)=(.*)$/);
  if (match)
    switch (match[1]) {
      case 'environment':
        env = match[2];
        console.log(`\n\n Environment is set to :${env}`.green);
        break;
      case 'site':
        nameSpace = match[2];
        console.log(`\n\nSite is set to :${nameSpace}`.green);
        break;
      default:
        break;
    }
}

function login(userName, userPassword) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  return new Promise((resolve, reject) => {
    if (!global.LOGIN_COOKIE || global.LOGIN_COOKIE.length === 0) {
      const loginUrl = `https://login.bodhi-${env}.io/auth/realms/hotschedules/protocol/openid-connect/token`;
      console.log('\n\n\n START LOGIN to ', env, ' BY USER '.green, userName);
      request({
        method: 'POST',
        uri: loginUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
          grant_type: 'password',
            client_id: 'urn:mace:oidc:hotschedules.com',
            scope: 'openid',
          username: `${userName}`,
          password: `${userPassword}`
        },
      }, (err, response, body) => {
        if (typeof body === 'undefined') {
          reject('Body is not defined');
        } else {
          let objBody = null;
          try {
            objBody = JSON.parse(body);
          } catch (error) {
            reject('Unable to parse response body');
          }
          if (!objBody || !objBody.error) {
              let loginToken;
              if(objBody.id_token)
              {
                  loginToken = objBody.id_token;
              }
              else{
                  loginToken = objBody.access_token;
              }
            const setCookie = `ID_TOKEN=${loginToken}; Max-Age=${objBody.expires_in}; Expires=Wed, 04 Jul 2050 15:26:06 GMT; Path=/; Domain=.bodhi-${env}.io; Secure; HTTPOnly`;
            global.LOGIN_COOKIE = setCookie;
            global.SET_COOKIE_JSON = objBody;
            console.log(' >>> LOGIN SUCCESSFUL'.green);
            resolve(setCookie);
          } else {
            reject(objBody.error_description);
          }
        }
      });
    } else
            resolve(global.LOGIN_COOKIE);
  });
}

function getBEVersion() {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://inventory.bodhi-${env}.io/buildinfo`,
        headers: {
            Authorization: `Bearer ${global.SET_COOKIE_JSON.id_token}`,
        }
      },
            (error, response, body) => {
              if (error)
                reject(`Unable to get backend response:\n${error}`);
              const json = JSON.parse(response.body);
              console.log(`Backend build version = ${json.build.version}`);
              resolve(json.build.version);
            }
        );
  });
}

function getFEVersion() {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://apps.bodhi-${env}.io/${nameSpace}/catalyst-inv-core-spa-ui/buildinfo/data.json`,
        headers: {
            Authorization: `Bearer ${global.SET_COOKIE_JSON.id_token}`,
        }
      },
            (error, response, body) => {
              if (error)
                reject(error);
              const json = JSON.parse(response.body);
              console.log(`FrontEnd build version = ${json.version}`);
              resolve(json.version);
            }
        );
  });
}

async function backEndVersion() {
  await login(`admin__${nameSpace}`, `admin__${nameSpace}`);
  return getBEVersion();
}

async function frontEndVersion() {
  await login(`admin__${nameSpace}`, `admin__${nameSpace}`);
  return getFEVersion();
}

module.exports = {backEndVersion, frontEndVersion, login};

