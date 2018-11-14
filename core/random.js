const _ = require('lodash');

function randomNumber(count = 5) {
  return Math.floor(Math.random() * Math.pow(10, count));
}

function randomIndexes(count, arrayLength) {
  if (arrayLength <= count) {
    return _.range(arrayLength);
  }

  const indexes = [];
  while (indexes.length < count) {
    const index = Math.floor(Math.random() * 1000000) % arrayLength;
    if (!indexes.includes(index)) {
      indexes.push(index);
    }
  }

  return indexes;
}

function randomString(text, maxNumber) {
  if (typeof maxNumber === 'undefined')
    return text + Date.now();
  return text + (Math.floor((Math.random() * maxNumber) + 1)).toString();
}

module.exports = {
  randomNumber,
  randomIndexes,
  randomString
};