const { assert } = require('chai');
const { find } = require('lodash');
const verifyResponseCode = require('../../../feature/CommonFeature/verifyResponseCode');
const TransactionService = require('../../../services/Bodhi/InventoryOHUpdateTransaction.service');

const transactionService = new TransactionService();

describe('EXP_003_Example-3', () => {
  const pageNumber = 1;
  it('Get transaction count', async () => {
    const res = await transactionService.getTransactionCount();
    console.log('Number of transaction = ', res.body);
    verifyResponseCode(res, 200);
  });
  it('Get transaction by page', async () => {
    const res = await transactionService.getTransactions(pageNumber);
    console.log(JSON.stringify(res.body, null, 2));
    verifyResponseCode(res, 200);
  });
});
