const { DateTime } = require('luxon');
const { checkActiveAlerts, processAlert, triggerAlert } = require('../controllers/alertController');
const {
  conditionMap,
  evaluateCondition,
  generateEmailTemplate,
  formatTimeWindow,
  metricMap,
  operatorMap,
  sendEmail,
} = require('../utils');

const processSingleAlert = async (alert, averageValues) => {
  for (const value of averageValues) {
    const { device_id, calculated_value } = value;

    const formattedOperator = operatorMap[alert.operator] || alert.operator;
    const formattedMetric = metricMap[alert.metric] || alert.metric;
    const formattedTimeWindow = formatTimeWindow(alert.time_window);
    const formattedCondition = conditionMap[alert.condition] || alert.condition;
    const formattedCalculatedValue = calculated_value.toFixed(2);

    if (evaluateCondition(calculated_value, alert.operator, alert.threshold)) {
      console.log(
        `Device ID: ${device_id} meets the condition (${formattedCondition} ${formattedOperator} ${alert.threshold}). Calculated value: ${formattedCalculatedValue}`
      );

      const triggered_at = DateTime.now().setZone('America/Santiago').toSQL();
      console.log('Triggered at:', triggered_at);
      const triggeredData = {
        ...alert,
        device_id,
        triggered_threshold_value: calculated_value,
        triggered_at,
      };
      await triggerAlert(triggeredData);

      const subject = `Alerta activada: ${alert.alert_name}`;
      const text = generateEmailTemplate({
        ...alert,
        device_id,
        condition: formattedCondition,
        operator: formattedOperator,
        time_window: formattedTimeWindow,
        triggered_threshold_value: formattedCalculatedValue,
        metric: formattedMetric,
      });

      await sendEmail(alert.emails, subject, text);
    }
  }
};

const processAlerts = async () => {
  console.log('Checking for active alerts...');

  const activeAlerts = await checkActiveAlerts();

  if (!activeAlerts || activeAlerts.length === 0) {
    console.log('No active alerts found.');
    return;
  }

  for (const alert of activeAlerts) {
    const lastTriggeredAt = DateTime.fromSQL(alert.last_triggered_at);
    const currentTime = DateTime.now().setZone('utc');

    const alertCoolDownMinutes = process.env.ALERT_COOLDOWN_MINUTES || 5;
    const minutesSinceLastTrigger = currentTime.diff(lastTriggeredAt, 'minutes').minutes;

    if (minutesSinceLastTrigger < alertCoolDownMinutes) {
      console.log(
        `Skipping alert: ${
          alert.alert_name
        }, triggered less than ${alertCoolDownMinutes} minutes ago. Last triggered at: ${lastTriggeredAt.toFormat(
          'dd-MM-yyyy HH:mm:ss'
        )}`
      );
      continue;
    }

    const averageValues = await processAlert(alert);

    console.log('-----------------------------------');
    console.log(`Alert: ${alert.alert_name}`);
    console.log(`Product: ${alert.product_name}`);
    console.log(`Condition: ${alert.condition}`);
    console.log(`Time Window: ${alert.time_window} minutes`);

    await processSingleAlert(alert, averageValues);
  }
};

const alertProcess = async intervalTime => {
  try {
    await processAlerts();
  } catch (error) {
    console.error('Error processing alerts:', error);
  } finally {
    setTimeout(() => alertProcess(intervalTime), intervalTime);
  }
};

module.exports = alertProcess;
