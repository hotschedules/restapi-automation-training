const {assert} = require('chai');

function verifyUom(actual, expected) {
  assert.deepInclude(actual, expected, 'UOM is not correct');
}

module.exports = verifyUom;
