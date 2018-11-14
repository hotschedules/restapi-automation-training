const {random} = require('lodash');

/**
 *
 * @param {*} text : pre-fix of string need to generate
 */

function createUniqueString(text, maxNumber) {
  if (typeof maxNumber === 'undefined')
    return text + Date.now();
  return text + random(maxNumber).toString();
}

function createRandomNumber(maxNumber) {
  return random(maxNumber);
}

module.exports = {
  createUniqueString,
  createRandomNumber
};