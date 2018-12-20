const generateUniqueData = require('../../CommonFeature/generateUniqueData');

function generateUniqueUom(uom) {
  const uniqueFields = ['name'];
  return generateUniqueData(uom, uniqueFields);
}

module.exports = generateUniqueUom;
