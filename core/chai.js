const chai = require('chai');
const chaiHttp = require('chai-http');

const {expect, assert} = chai;
chai.use(chaiHttp);

module.exports = {
  chai,
  expect,
  assert
};
