const { assert } = require('chai');
const { find, ceil, concat, forEach, isArray, includes, isNumber } = require('lodash');
const verifyResponseCode = require('../../../feature/CommonFeature/verifyResponseCode');
const TransactionService = require('../../../services/Bodhi/InventoryOHUpdateTransaction.service');
const fs = require('fs');

const rootFolder = process.cwd();
const filePath = `${rootFolder}/data/TransactionBadData.json`;

const transactionService = new TransactionService();

describe('EXP_003_Example-3', () => {
  const pageNumber = 1;
  let totalPage = 0;
  const badTransactions = [];
  let allTransactions = [];
  const baseUnits = ['Each', 'Gram', 'Milliliter', 'Wt. Oz', 'Fl. Oz'];
  it('Get transaction count', async () => {
    const res = await transactionService.getTransactionCount();
    console.log('Number of transaction = ', res.body.count);
    verifyResponseCode(res, 200);
    totalPage = ceil(res.body.count / 100);
    console.log('Number of page = ', totalPage);
  });
  it('Get all transactions', async () => {
    for (let i = 0; i < totalPage; i++) {
      const currentPageTrans = await transactionService.getTransactions(i + 1);
      allTransactions = concat(allTransactions, currentPageTrans.body);
      console.log('All transactions length = ', allTransactions.length);
    }
  });
});
