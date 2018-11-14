/**
 * Verify if the inputted array is sorted
 * @param array
 * @param sortOrder - can be 'asc' or 'desc'
 * @returns {*}
 */

function verifySorted(array, sortOrder) {
  let result;
  if (sortOrder === 'asc')
    result = array.every( (item, i, arr) => i < arr.length - 1 ? arr[i] <= arr[i + 1] : true );
  else
    result = array.every( (item, i, arr) => i < arr.length - 1 ? arr[i] >= arr[i + 1] : true );
  return result;
}

module.exports = {
  verifySorted
};