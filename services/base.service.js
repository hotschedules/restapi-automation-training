const Request = require('../core/request');
const commonData = require('../constant/commonData');
const { find } = require('lodash');
const SanityConfig = require('../data/Sanity/SanityConfig');

/**
 * @class BaseService
 * BaseService give these info for derived class
 * - request: is an instance of class Request. It is use to make request to server
 * - storeKey: is store key string
 */
class BaseService {
  constructor() {
    this.internalRequest = null;
    this.internalBodhiRequest = null;
    this.internalS3Request = null;
    this.requestData = null;
    const sanityStoreKey = this.getStoreKeyFromSanityConfig();
    this._storeKey = sanityStoreKey || commonData.storeKey;
  }

  get request() {
    if (!this.internalRequest) {
      const requestInfo = {
        baseUrl: `https://inventory.${this.getCurrentEnv()}.io`,
        nameSpace: process.env.nameSpace,
        cookieManager: global.LOGIN_COOKIE,
        securityMethod: 'Cookie',
        method: ''
      };
      this.internalRequest = new Request(requestInfo);
    }
    return this.internalRequest;
  }

  get bodhiRequest() {
    if (!this.internalBodhiRequest) {
      const requestInfo = {
        baseUrl: `https://api.bodhi-${process.env.env}.io`,
        nameSpace: process.env.namespace,
        cookieManager: global.LOGIN_COOKIE,
        securityMethod: 'Cookie',
        method: ''
      };
      if (process.env.env === 'prd')
        requestInfo.baseUrl = 'https://api.hotschedules.io';
      this.internalBodhiRequest = new Request(requestInfo);
    }
    return this.internalBodhiRequest;
  }

  get storeKey() {
    return this._storeKey;
  }

  set storeKey(key) {
    this._storeKey = key;
  }

  resourceUrl() {
    return '';
  }

  resourceUrlWithStoreKey() {
    return `${this.storeKey}/${this.resourceUrl()}`;
  }

  getCurrentEnv() {
    const currentEnv = process.env.env;
    if (currentEnv === 'hotschedules') {
      return currentEnv;
    }
    return `bodhi-${currentEnv}`;
  }

  getStoreKeyFromSanityConfig() {
    const namespace = process.env.namespace;
    const store = find(SanityConfig, { namespace });
    return store && store.storeLevelUser.storeKey;
  }
}

module.exports = BaseService;
