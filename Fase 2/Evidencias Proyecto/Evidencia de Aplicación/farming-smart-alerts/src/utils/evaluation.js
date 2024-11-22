const evaluateCondition = (averageValue, operator, threshold) => {
  switch (operator) {
    case '>':
      return averageValue > threshold;
    case '<':
      return averageValue < threshold;
    case '>=':
      return averageValue >= threshold;
    case '<=':
      return averageValue <= threshold;
    case '=':
      return averageValue === threshold;
    default:
      return false;
  }
};

module.exports = evaluateCondition;
