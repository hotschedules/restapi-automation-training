/*
  Author: Thanh Luu
  Date: Aug 19th, 2017
  Info: Refactor execute function
*/

const {chai, assert} = require('./chai');
const _ = require('lodash');

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const PATCH = 'patch';
const DELETE = 'delete';
const LOGIC_STATUS_CODES = [
  201,
  204,
  422,
  409,
  401,
  404
];

const httpMethods = [GET, POST, PUT, PATCH, DELETE];
const getHttpMethod = (method = GET) => {
  const lowCaseMethod = method
    .trim()
    .toLowerCase();

  return httpMethods.includes(lowCaseMethod)
    ? lowCaseMethod
    : GET;
};

const normalizePath = (path) => {
  if (!_.isString(path) || !path || path[0] === '/') {
    return path;
  }

  return `/${path}`;
};

const applyFunction = (options, previousResult) => {
  const {expectData} = options;
  const newRequest = {};

  _.each(options.request, (value, key) => {
    newRequest[key] = value;
    _.isFunction(value) && (newRequest[key] = value(previousResult));
  });

  return {
    request: newRequest,
    expectData: _.isFunction(expectData)
      ? expectData(previousResult)
      : expectData,
    onResponse: options.onResponse
  };
};

function getErrorMessage(error) {
  const {response, message} = error;
  let text = message;

  if (response) {
    try {
      text = JSON.parse(response.text);
    } catch (err) {
      text = response.text;
    }
  }

  return text;
}

function handleUnExpectedError({error, expectData, reject}) {
  const {status} = error;
  const errorMessage = getErrorMessage(error);

  console.error('*********************************BEGIN ERROR*********************************');
  console.error('Status: ', status);
  errorMessage && console.error('Error detail: ', errorMessage);
  console.error('*********************************END ERROR*********************************');
  console.error('Full Error: ', error);

  assert.fail(error, expectData, 'Execute request error: ');
  reject(error);
}

function handleSucceededResponse({onResponse, res, previousResult, options, expectData, resolve}) {

  const {status: expectedStatus, body: expectedBody} = expectData;
  const result = _.isFunction(onResponse) && onResponse(res, {
    prevResponse: previousResult,
    request: options.request
  });

  if (expectData) {
    _.isNumber(expectedStatus) && (assert.equal(res.status, expectedStatus));
    expectedBody && assert.include(res.body, expectedBody);
  }

  if (result && result.then) {
    result.then(resolve);
  } else {
    resolve(res);
  }
}

function isValidStatus(status, expectedStatus) {
  return LOGIC_STATUS_CODES.includes(status)
    || (expectedStatus && status === expectedStatus);
}

function onRequestDone(params) {
  const {
    error,
    res,
    expectData,
    resolve,
    reject,
    onResponse,
    previousResult,
    options
  } = params;

  const expectedStatus = _.get(expectData, 'status');

  if (error && (!res || !isValidStatus(res.status, expectedStatus))) {
    handleUnExpectedError({error, expectData, reject});
  } else {
    handleSucceededResponse({onResponse, res, previousResult, options, expectData, resolve});
  }
}

/*
 {
 request: {
 baseUrl,
 method,
 path,
 headers,
 query,
 data
 },
 expectData,
 onResponse,
 onBeforeRequest
 }
 */
/**
 * Execute a request, then compare response or call onResponse
 * @param  {Object} options contains information for a request
 * options's structure
 * @param {Object} previousResult is previous response
 * @return {Promise} return a Promise
 */
module.exports = (options, previousResult = null) => {
  const newOptions = previousResult
    ? applyFunction(options, previousResult)
    : options;
  const {
    expectData = {},
    onResponse,
    onBeforeRequest
  } = newOptions;
  let {
    baseUrl,
    path = '/',
    method,
    headers,
    query,
    data
  } = newOptions.request;

  const httpMethod = getHttpMethod(method);
  const httpRequest = chai.request(baseUrl)[httpMethod](normalizePath(path));

  // SET HEADERS
  headers && _.each(headers, (value, key) => httpRequest.set(key, value));

  // query
  query && httpRequest.query(query);

  // send data
  data && (httpRequest.send(data));

  onBeforeRequest && onBeforeRequest(newOptions, previousResult);

  return new Promise((resolve, reject) => {
    httpRequest.end((error, res) => {
      try {
        onRequestDone({
          error,
          res,
          expectData,
          resolve,
          reject,
          onResponse,
          previousResult,
          options: newOptions
        });
        resolve('complete request');
      } catch (err) {
        reject(err);
      }
    });
  });
};

