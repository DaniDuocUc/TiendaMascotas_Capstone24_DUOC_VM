const alertService = require('../services/alertService');

const checkActiveAlerts = async () => {
  try {
    const alerts = await alertService.getActiveAlerts();
    return alerts;
  } catch (error) {
    console.error('Error checking active alerts:', error);
  }
};

const processAlert = async alert => {
  try {
    const { product_name, condition, time_window, metric } = alert;

    const averageValue = await alertService.getCalculatedCondition(product_name, condition, time_window, metric);
    return averageValue;
  } catch (error) {
    console.error('Error processing alert:', error);
    throw new Error('Failed to process alert');
  }
};

const triggerAlert = async alertData => {
  try {
    await alertService.insertTriggeredAlert(alertData);

    console.log(`Triggered alert ${alertData.alert_name} handled successfully.`);
  } catch (error) {
    console.error('Error handling triggered alert:', error);
  }
};
module.exports = {
  checkActiveAlerts,
  processAlert,
  triggerAlert,
};
