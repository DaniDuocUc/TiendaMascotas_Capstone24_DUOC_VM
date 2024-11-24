const db = require('../database/dbConnection');

const getActiveAlerts = async () => {
  try {
    const query = `
      SELECT 
        fa.id AS alert_id,
        fp.name AS product_name,
        fa.name AS alert_name,
        fa.condition,
        fa.operator,
        fa.threshold,
        fa.time_window,
        fa.metric,
        fa.emails,
        fa.status,
        MAX(to_char(fat.triggered_at, 'YYYY-MM-DD HH24:MI:SS')) AS last_triggered_at
      FROM 
        farming_alerts fa
      JOIN 
        farming_product fp ON fa.product_id = fp.id
      LEFT JOIN 
        farming_alerts_triggered fat ON fa.id = fat.alert_id
      WHERE 
        fa.status = true
        AND fa.deleted_at IS NULL
      GROUP BY 
        fa.id, fp.name, fa.name, fa.condition, fa.operator, fa.threshold, fa.time_window, fa.status, fa.metric;
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    throw new Error('Database query failed.');
  }
};

const getCalculatedCondition = async (productName, condition, timeWindow, metric) => {
  const query = `
        SELECT 
          device_id,
          ${metric}(${condition}) AS calculated_value
        FROM 
          farming_iot_logs
        WHERE 
          product_name = $1
          AND timestamp AT TIME ZONE 'America/Santiago' >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') - INTERVAL '${timeWindow} minutes'
        GROUP BY 
          device_id;
      `;
  const result = await db.query(query, [productName]);
  return result.rows;
};

const insertTriggeredAlert = async alertData => {
  const query = `
    INSERT INTO farming_alerts_triggered (
      alert_id,
      device_id,
      alert_name,
      product_name,
      condition,
      operator,
      threshold,
      time_window,
      triggered_threshold_value,
      triggered_at,
      metric
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  const values = [
    alertData.alert_id,
    alertData.device_id,
    alertData.alert_name,
    alertData.product_name,
    alertData.condition,
    alertData.operator,
    alertData.threshold,
    alertData.time_window,
    alertData.triggered_threshold_value,
    alertData.triggered_at,
    alertData.metric,
  ];

  try {
    await db.query(query, values);
  } catch (err) {
    console.error('Error inserting triggered alert:', err);
  }
};

module.exports = {
  getActiveAlerts,
  getCalculatedCondition,
  insertTriggeredAlert,
};
