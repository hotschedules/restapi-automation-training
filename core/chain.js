const { assert } = require('./chai');
const execute = require('./execute');
const { asyncify, waterfall } = require('async');

/*
[
  request: {
    baseUrl,
    headers,
    query,
    data
  },
  expectData,
  onResponse
]
*/
module.exports = (steps) => {
  return new Promise((resolve, reject) => {
    const promises = steps.map((step) => {
      return asyncify(previousResponse => execute(step, previousResponse));
    });

    waterfall(promises, (error, result) => {
      if (error) {
        assert.fail(error, null, 'Chain request error: ');
        reject(error);
        return;
      }

      resolve(result);
    });
  });
};
