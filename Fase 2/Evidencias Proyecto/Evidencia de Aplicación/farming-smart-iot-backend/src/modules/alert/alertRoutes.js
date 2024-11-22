const express = require('express');
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlertById,
  deleteAlertById,
  getTriggeredAlerts,
} = require('./alertController');
const checkProductRegistration = require('../../middlewares/checkProductRegistration');
const checkAlertRegistration = require('../../middlewares/checkAlertRegistration');
const validateAlertData = require('../../middlewares/validateAlertData');

router.get('/alerts', getAlerts);
router.post('/alert', checkProductRegistration, validateAlertData(), createAlert);
router.get('/alert/:id', getAlertById);
router.put('/alert/:id', checkAlertRegistration, validateAlertData(true), updateAlertById);
router.delete('/alert/:id', checkAlertRegistration, deleteAlertById);
router.get('/alerts/triggered', getTriggeredAlerts);

module.exports = router;
