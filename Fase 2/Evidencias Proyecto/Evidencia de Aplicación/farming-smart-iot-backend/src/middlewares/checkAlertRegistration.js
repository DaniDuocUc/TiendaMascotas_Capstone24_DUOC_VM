const alertService = require('../modules/alert/alertService');

const checkAlertRegistration = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).send({ message: 'The ID must be a numeric value.' });
  }

  try {
    const alert = await alertService.getAlertById(id);

    if (!alert) {
      return res.status(404).send({ message: 'Alert not found' });
    }

    req.alert = alert;
    next();
  } catch (error) {
    console.error('Error validating alert:', error);
    return res.status(500).send({ message: 'An error occurred while validating the alert.' });
  }
};

module.exports = checkAlertRegistration;
