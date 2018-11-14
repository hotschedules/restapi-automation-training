const request = require('request');
const colors = require('colors/safe');

function getDomainName(env) {
  if(env === 'hotschedules') {
    return `hotschedules.io`;
  } else {
    return `bodhi-${env}.io`;
  }
}

function getLoginUrl(env) {
  return `https://login.${getDomainName(env)}/auth/realms/hotschedules/protocol/openid-connect/token`;
}

const getToken = (env, username, password) => {
  return new Promise((resolve, reject) => {
    const loginUrl = getLoginUrl(env);
    console.log('Verifying username and password...');
    console.log(`${colors.red('POST')} ${colors.green(loginUrl)}`);
    request({
      method: 'POST',
      uri: loginUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        grant_type: 'password',
        client_id: 'admin-cli',
        username,
        password,
      },
    }, (err, response, body) => {
      console.log(colors.red(`Raw response body:\n ${body}`));
      if (typeof body === 'undefined') {
        reject('Response body is undefinded');
      } else {
        let objBody = null;
        try {
          objBody = JSON.parse(body);
        } catch (error) {
          reject('Unable to parse response body');
        }
        if (!objBody || !objBody.error) {
          console.log(colors.green(`objBody.id_token:\n ${objBody.id_token}`));
          resolve(objBody.id_token);
        } else {
          reject(objBody.error_description);
        }
      }
    });
  });
};
module.exports = getToken;
