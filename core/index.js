const { chai, expect, assert } = require('./chai');
const execute = require('./execute');
const login = require('./login');
const loginspecific = require('./loginspecific');
const loginBackEnd = require('./login-backend');
const chain = require('./chain');
const compose = require('./compose');
const { randomNumber } = require('./random');
const { sort } = require('./sort');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
module.exports = {
  chai,
  expect,
  assert,
  execute,
  chain,
  compose,
  randomNumber,
  sort,
  login,
  loginspecific,
  loginBackEnd
};
