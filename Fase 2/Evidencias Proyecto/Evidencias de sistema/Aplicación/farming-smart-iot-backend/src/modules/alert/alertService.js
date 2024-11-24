const db = require('../../database/dbConnection');

const createAlert = async alertData => {
  try {
    const { product_id, name, condition, operator, threshold, emails, status, time_window } = alertData;
    const query = `
      INSERT INTO farming_alerts (product_id, name, condition, operator, threshold, emails, status, time_window, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *;
    `;
    const values = [product_id, name, condition, operator, threshold, emails, status, time_window];
    const result = await db.query(query, values);

    return result.rows[0];
  } catch (error) {
    console.error('Error inserting alert into the database:', error);
    throw new Error('Failed to create alert');
  }
};

const getAlerts = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Count total alerts
    const countQuery = `
      SELECT COUNT(*) AS total_alerts
      FROM farming_alerts
      WHERE deleted_at IS NULL;
    `;
    const countResult = await db.query(countQuery);
    const totalAlerts = parseInt(countResult.rows[0].total_alerts, 10);
    const totalPages = Math.ceil(totalAlerts / limit);

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
        MAX(to_char(fat.triggered_at AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD HH24:MI:SS')) AS last_triggered_at
      FROM 
        farming_alerts fa
      JOIN 
        farming_product fp ON fa.product_id = fp.id
      LEFT JOIN 
        farming_alerts_triggered fat ON fa.id = fat.alert_id
      WHERE 
        fa.deleted_at IS NULL
      GROUP BY 
        fa.id, fp.name, fa.name, fa.condition, fa.operator, fa.threshold, fa.status
      ORDER BY 
        fa.created_at ASC
      LIMIT $1 OFFSET $2;
    `;
    const values = [limit, offset];
    const result = await db.query(query, values);

    return {
      alerts: result.rows,
      currentPage: page,
      totalPages: totalPages,
      totalAlerts: totalAlerts,
    };
  } catch (error) {
    console.error('Error fetching paginated alerts:', error);
    throw new Error('Database query failed.');
  }
};

const getAlertById = async id => {
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
        MAX(to_char(fat.triggered_at AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD HH24:MI:SS')) AS last_triggered_at
      FROM 
        farming_alerts fa
      JOIN 
        farming_product fp ON fa.product_id = fp.id
      LEFT JOIN 
        farming_alerts_triggered fat ON fa.id = fat.alert_id
      WHERE 
        fa.id = $1 AND fa.deleted_at IS NULL
      GROUP BY 
        fa.id, fp.name, fa.name, fa.condition, fa.operator, fa.threshold, fa.status;
    `;
    const values = [id];
    const result = await db.query(query, values);

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching alert by id:', error);
    throw new Error('Database query failed.');
  }
};

const getTriggeredAlerts = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Count total alerts
    const countQuery = `
      SELECT COUNT(*) AS total_triggered_alerts
      FROM farming_alerts_triggered;
    `;
    const countResult = await db.query(countQuery);
    const totalAlerts = parseInt(countResult.rows[0].total_triggered_alerts, 10);
    const totalPages = Math.ceil(totalAlerts / limit);

    const query = `
      SELECT 
        id,
        alert_id,
        device_id,
        alert_name,
        product_name,
        condition,
        operator,
        threshold,
        time_window,
        metric,
        ROUND(CAST(triggered_threshold_value AS numeric), 2) AS triggered_threshold_value,
        to_char(triggered_at AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD HH24:MI:SS') AS triggered_at
      FROM 
        farming_alerts_triggered
      ORDER BY 
        triggered_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const values = [limit, offset];
    const result = await db.query(query, values);

    return {
      alerts: result.rows,
      currentPage: page,
      totalPages: totalPages,
      totalAlerts: totalAlerts,
    };
  } catch (error) {
    console.error('Error fetching triggered alerts:', error);
    throw new Error('Database query failed.');
  }
};

const deleteAlert = async id => {
  try {
    const query = `
      UPDATE farming_alerts
      SET status = false, deleted_at = NOW() AT TIME ZONE 'America/Santiago'
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id];
    const result = await db.query(query, values);

    return result.rows[0];
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw new Error('Failed to delete alert');
  }
};

const updateAlert = async (id, alertData) => {
  try {
    const query = `
      UPDATE farming_alerts
      SET 
        product_id = COALESCE($1, product_id),
        name = COALESCE($2, name),
        condition = COALESCE($3, condition),
        operator = COALESCE($4, operator),
        threshold = COALESCE($5, threshold),
        emails = COALESCE($6, emails),
        status = COALESCE($7, status),
        time_window = COALESCE($8, time_window),
        metric = COALESCE($9, metric),
        updated_at = NOW() AT TIME ZONE 'America/Santiago'
      WHERE id = $10
      RETURNING *;
    `;
    const values = [
      alertData.product_id,
      alertData.name,
      alertData.condition,
      alertData.operator,
      alertData.threshold,
      alertData.emails,
      alertData.status,
      alertData.time_window,
      alertData.metric,
      id,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating alert in the database:', error);
    throw new Error('Failed to update alert');
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  getTriggeredAlerts,
  deleteAlert,
  updateAlert,
};
