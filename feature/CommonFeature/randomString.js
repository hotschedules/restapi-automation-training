const randomNumber = require('./randomNumber');

function randomString(text, count = 6) {
  return text + randomNumber(count);
}

module.exports = randomString;
