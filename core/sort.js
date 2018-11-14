const _ = require('lodash');

function compareBy(properties, isAscending = true) {
  const delta = isAscending ? 1 : -1;

  return (a, b) => {
    for (const property of properties) {
      const aValue = a[property];
      const bValue = b[property];
      if (aValue < bValue)
        return -1 * delta;
      if (aValue > bValue)
        return 1 * delta;
    }

    return 0;
  };
}

function sort(array, properties, isAscending) {
  const cloneArray = [...array];
  if (_.isEmpty(properties))
    return cloneArray;

  cloneArray.sort(compareBy(properties, isAscending));

  return cloneArray;
}

module.exports = {
  compareBy,
  sort
};
