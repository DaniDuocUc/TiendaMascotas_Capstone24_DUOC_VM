const db = require('../config/database');

function handleIoTNotification(callback) {
  db.query('LISTEN farming_iot_logs_changes');

  const listener = async msg => {
    if (msg.channel === 'farming_iot_logs_changes') {
      await callback();
    }
  };

  db.on('notification', listener);

  return {
    removeListener: () => {
      db.removeListener('notification', listener);
    },
  };
}

function handleAlertsNotification(callback) {
  db.query('LISTEN farming_alerts_triggered_changes');

  const listener = async msg => {
    if (msg.channel === 'farming_alerts_triggered_changes') {
      await callback();
    }
  };

  db.on('notification', listener);

  return {
    removeListener: () => {
      db.removeListener('notification', listener);
    },
  };
}

module.exports = {
  handleIoTNotification,
  handleAlertsNotification,
};
