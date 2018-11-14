#!/usr/local/bin/node
const request = require('request');
const Cookie = require('request-cookies').Cookie;
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

let PLAY_SESSION = null;


module.exports = () => {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  return new Promise((resolve, reject) => {
    let loginUrl = `https://login.bodhi-${process.env.env}.io/auth/realms/hotschedules/protocol/openid-connect/token`;
    if (process.env.env === 'prd' || process.env.env === 'hotschedules')
      loginUrl = `https://login.hotschedules.io/auth/realms/hotschedules/protocol/openid-connect/token`;
    console.log('Verifying username and password...');
    request({
      method: 'POST',
      uri: loginUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        grant_type: 'password',
        username: `admin__${process.env.namespace}`,
        password: `admin__${process.env.namespace}`,
        client_id: 'urn:mace:oidc:hotschedules.com',
        scope: 'openid'
      },
    }, (err, response, body) => {
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
          // const setCookie = "ID_TOKEN=ABC; Max-Age=28800; Expires=Wed, 04 Jul 2018 15:26:06 GMT; Path=/; Domain=.bodhi-stg.io; Secure; HTTPOnly"
          const setCookie = `ID_TOKEN=${objBody.id_token}; Max-Age=${objBody.expires_in}; Expires=Wed, 04 Jul 2050 15:26:06 GMT; Path=/; Domain=.bodhi-${process.env.env}.io; Secure; HTTPOnly`;
          global.LOGIN_COOKIE = setCookie;
          console.log('   >>>   LOGIN SUCCESSFUL', objBody);
          resolve(setCookie);
        } else {
          reject(objBody.error_description);
        }
      }
    });
  });
};
