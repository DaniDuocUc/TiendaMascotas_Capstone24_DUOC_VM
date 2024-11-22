const deviceService = require('../modules/device/deviceService');

const checkDeviceRegistration = async (req, res, next) => {
  const { device_id } = req.body;

  try {
    const deviceExists = await deviceService.checkDeviceRegistration(device_id);

    if (!deviceExists) {
      return res.status(404).send({
        message: 'Device not registered. Please check the device_id or register the device.',
      });
    }

    next();
  } catch (error) {
    console.error('Error in checkDeviceRegistration middleware:', error);
    res.status(500).send({
      message: 'An error occurred while checking device registration.',
    });
  }
};

module.exports = checkDeviceRegistration;
