const BaseService = require('../base.service');

class TransactionService extends BaseService {

  resourceUrl() {
    return 'resources/InventoryOHUpdateTransaction';
  }

  async getTransactionCount() {
    const path = `${this.resourceUrl()}/count`;
    return this.bodhiRequest.get({ path });
  }

  async getTransactions(pageNumber) {
    const path = `${this.resourceUrl()}?paging=page:${pageNumber}`;
    return this.bodhiRequest.get({ path });
  }
}

module.exports = TransactionService;
