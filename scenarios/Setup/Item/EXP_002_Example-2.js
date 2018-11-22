const { assert } = require('chai');
const InventoryItemService = require('../../../services/Setup/Item/InventoryItem.service');

const itemService = new InventoryItemService();

describe('EXP_002_Example-2', () => {
  let allItems;
  let response;
  let item1;
  it('Get all global inventory items', async () => {
    response = await itemService.getAllItems();
    allItems = response.body;
    item1 = allItems[0];
    console.log('Item name of item 1 = ', item1.itemName);
  });
  it('Check the response code (1)', () => {
    assert.equal(response.status, '409', 'Response code is incorrect');
  });
  it('Check the response code (2)', () => {
    console.log('response.status == \'200\': ', response.status == '200');
    assert.equal(response.status, '200', 'Response code is incorrect');
  });
  it('Check the response code (3)', () => {
    console.log('response.status === \'200\': ', response.status === '200');
    assert.strictEqual(response.status, '200', 'Response code is incorrect');
  });
  it('Verify item1 include itemName and data type is string', () => {
    assert.isNumber(item1.itemName, 'Name of item1 must be string');
  });
  it('Exercise 3 : Verify itemName of item1 = ABC', () => {
    // Your code here
  });
  it('Exercise 4: Find the item has id = inv-item-0000082 in item list, verify item code = 2072 and status = Active', () => {
    // Your code here
  });
});
