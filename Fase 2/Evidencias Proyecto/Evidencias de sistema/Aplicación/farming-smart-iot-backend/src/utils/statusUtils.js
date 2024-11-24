const determineStatus = soil_humidity => {
  if (soil_humidity >= 60 && soil_humidity < 80) {
    return 'green';
  } else if ((soil_humidity >= 50 && soil_humidity < 60) || (soil_humidity >= 80 && soil_humidity < 90)) {
    return 'yellow';
  } else {
    return 'red';
  }
};

module.exports = {
  determineStatus,
};
