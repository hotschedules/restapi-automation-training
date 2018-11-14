const BaseService = require('../../base.service');

class InventoryItemService extends BaseService {

  resourceUrl() {
    return 'InventoryItem';
  }

  async getAllItems() {
    const path = `${this.resourceUrl()}?pageNumber=1&pageSize=100`;
    return this.request.get({ path });
  }
}

module.exports = InventoryItemService;
