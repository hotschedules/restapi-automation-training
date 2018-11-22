#!/usr/local/bin/node
const request = require('request');
const Cookie = require('request-cookies').Cookie;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let PLAY_SESSION = null;

function getDomainName(env) {
  if(env === 'hotschedules') {
    return `hotschedules`;
  } else {
    return `bodhi-${env}`;
  }
}

function parseCookies(rawcookies, cookieJar) {
  let list = [];

  for (let i in rawcookies) {
    let cookie = new Cookie(rawcookies[i]);
    list.push(cookie);
  }
  return list;
}

function followupCallback(url, referer, resolve, reject) {
  // console.log (`followupCallback ${url}`)
  request.get({
    url,
    headers: {
      'Cookie': `${PLAY_SESSION.key}=${PLAY_SESSION.value}`,
      'Referer': referer
    },
    timeout:600000
  },
  (err, response, body) => {
    if (err)
      reject();
    // commonData.cookieManager = parseCookies(response.headers['set-cookie'])[0].value;
    // commonData.cookieManager = response.headers['set-cookie'];
    console.log(response.headers['set-cookie']);
    // console.log(response);
    resolve(response.headers['set-cookie']);
  });
}

function loginKCForm(url, referer, KC_RESTART, username, password, resolve, reject) {
  // console.log (`loginKCForm url" ${url}`);
  request.post(
    {
      url,
      form: {username, password},
      headers: {
        'Cookie': `${KC_RESTART.key}=${KC_RESTART.value}`,
        'Referer': referer,
        'Host': `authp.${getDomainName(process.env.env)}.io`,
        'Origin': `https://authp.${getDomainName(process.env.env)}.io`
      },
      timeout:600000
    },
    (err, response, body) => {
      if (err) {
        reject (err);
        console.log (`loginKCForm err: ${err}`);
        return;
      }
      // Cookie:KEYCLOAK_IDENTITY, KEYCLOAK_SESSION, KEYCLOAK_REMEMBER_ME
      const authCookies = parseCookies(response.headers['set-cookie']);
      followupCallback(response.headers.location, referer, resolve, reject);
    }
  );

}


module.exports = (username, password) => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://authp.${getDomainName(process.env.env)}.io/oidc/index.html`,
        followRedirect: false,
        timeout:600000
      },
      (error, response, body) => {
        if (error)
          reject(error);
        PLAY_SESSION = parseCookies(response.headers['set-cookie'])[0];
        const redirectURL = response.headers.location;
        request.get(redirectURL, {timeout:600000},(redirectError, redirectResponse, redirectBody) => {
          if (redirectError)
            reject (redirectError);
          else try {
            const dom = new JSDOM(redirectBody);
            const KC_RESTART = parseCookies(redirectResponse.headers['set-cookie'])[0];
            const referer = redirectResponse.request.href;
            loginKCForm(dom.window.document.querySelector('#kc-form-login').action,
              referer,
              KC_RESTART, username, password,
              resolve, reject);
          }
          catch (exc) {
            reject(exc);
          }
        });
      }
    );
  });
};
