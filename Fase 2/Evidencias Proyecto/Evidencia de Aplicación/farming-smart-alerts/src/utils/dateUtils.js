const formatTimeWindow = minutes => {
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

module.exports = formatTimeWindow;
