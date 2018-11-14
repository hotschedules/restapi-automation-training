const execute = require('./execute');

const methods = ['get', 'post', 'put', 'patch', 'delete'];
const joinPath = (first, second) => {
  if (!first || !second) return '';
  const lastPart = second[0] !== '/' ? `/${second}` : second;
  return first + lastPart;
};

const createMethod = ({ baseUrl, nameSpace, cookieManager, securityMethod, method }) => {
  if(global.testSite){
    nameSpace=global.testSite;
  }
  else {
    nameSpace=process.env.nameSpace;
  }
  cookieManager=global.LOGIN_COOKIE;
  return ({ path, onResponse, expectData, headers, data }) => {
    const defaultHeaders = { [securityMethod]: cookieManager };
    const requestInfo = {
      expectData,
      onResponse,
      request: {
        baseUrl,
        method,
        data,
        path: joinPath(nameSpace, path),
        headers: Object.assign({}, defaultHeaders, headers),
      },
    };
    return execute(requestInfo);
  };
};

/**
 * @class Request
 * Instance of class Request contains 5 methods
 *   - get({ path, onResponse, expectData, headers, data })
 *   - post({ path, onResponse, expectData, headers, data })
 *   - put({ path, onResponse, expectData, headers, data })
 *   - patch({ path, onResponse, expectData, headers, data })
 *   - delete({ path, onResponse, expectData, headers, data })
 * Parameter path shouldn't include namespace, because it will be added automatically
 */
class Request {
  constructor({ baseUrl, nameSpace, cookieManager, securityMethod }) {
    Object.assign(
      this,
      methods.reduce((result, method) => {
        result[method] = createMethod({ baseUrl,
          cookieManager,
          nameSpace,
          securityMethod,
          method });
        return result;
      }, {}));
  }
}
module.exports = Request;
