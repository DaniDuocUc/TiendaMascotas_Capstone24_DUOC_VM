const express = require('express');
const router = express.Router();
const {
  receiveData,
  getDeviceAveragesByAbsoluteTime,
  getDeviceAveragesByRelativeTime,
  getDeviceDailyHumidityAverages,
} = require('./deviceController');
const validateDeviceData = require('../../middlewares/validateDeviceData');
const checkDeviceRegistration = require('../../middlewares/checkDeviceRegistration');
const {
  validateAbsoluteTime,
  validateRelativeTime,
  validateDateRange,
} = require('../../middlewares/validateTimeRange');

router.post('/device', validateDeviceData, checkDeviceRegistration, receiveData);
router.get('/device/averages', validateAbsoluteTime, getDeviceAveragesByAbsoluteTime);
router.get('/device/averages-by-seconds', validateRelativeTime, getDeviceAveragesByRelativeTime);
router.get('/device/daily-humidity-averages', validateDateRange(7), getDeviceDailyHumidityAverages);

module.exports = router;
