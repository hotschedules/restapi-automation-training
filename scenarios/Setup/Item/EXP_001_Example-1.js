const InventoryItemService = require('../../../services/Setup/Item/InventoryItem.service');

const itemService = new InventoryItemService();

describe('EXP_001_Example-1', () => {
  let allItems;
  let response;
  it('Get all global inventory items', async () => {
    response = await itemService.getAllItems();
    // Show response code
    console.log('Response code = ', response.status);
    // Show all items
    allItems = response.body;
    console.log('All items = ', allItems);
    // Show the first item
    const item1 = allItems[0];
    console.log('Item 1 = ', item1);
    // Show item name of item 1
    console.log('Item name of item 1 = ', item1.itemName);
  });
});
