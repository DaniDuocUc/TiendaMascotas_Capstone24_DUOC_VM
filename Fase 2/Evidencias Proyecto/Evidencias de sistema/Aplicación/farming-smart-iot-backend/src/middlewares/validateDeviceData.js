const validateDeviceData = (req, res, next) => {
  const { device_id, air_temperature, air_humidity, soil_humidity } = req.body;

  if (
    !device_id ||
    isNaN(air_temperature) ||
    isNaN(air_humidity) ||
    (soil_humidity !== undefined && isNaN(soil_humidity))
  ) {
    return res.status(400).send({
      message:
        'Invalid data. Please ensure all required fields (device_id, air_temperature, air_humidity) are provided and valid. soil_humidity is optional but must be valid if provided.',
    });
  }

  next();
};

module.exports = validateDeviceData;
