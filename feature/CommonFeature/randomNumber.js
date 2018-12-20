function randomNumber(count = 6) {
  const now = `${Date.now()}`;
  const start = now.length - count;
  const end = now.length;
  return now.substring(start, end);
}

module.exports = randomNumber;
