const { cloneDeep } = require('lodash');
const randomString = require('./randomString');

function generateUniqueData(data, fields) {
  const uniqueData = cloneDeep(data);
  for (const field of fields) {
    uniqueData[field] = randomString(uniqueData[field]);
  }
  return uniqueData;
}

module.exports = generateUniqueData;
