const { DateTime } = require('luxon');

const formatTimeWindow = input => {
  const minutes = Number(input);
  if (minutes < 60) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let hourStr = `${hours} hora${hours !== 1 ? 's' : ''}`;
  let minuteStr = '';
  if (remainingMinutes > 0) {
    minuteStr = ` y ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
  }

  return hourStr + minuteStr;
};

const getChileTime = () => {
  const chileTime = DateTime.now().setZone('America/Santiago').toSQL();
  return chileTime;
};

const isValidISO8601 = dateString => {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  return iso8601Regex.test(dateString);
};

module.exports = {
  formatTimeWindow,
  getChileTime,
  isValidISO8601,
};
