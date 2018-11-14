const { assert } = require('chai');

function verifyResponseCode(res, expectedCode) {
  const { body, status } = res;
  assert.strictEqual(status, expectedCode, `Response code is incorrect\n${JSON.stringify(body)}`);
}

module.exports = verifyResponseCode;
