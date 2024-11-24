const db = require('../../database/dbConnection');

const checkDeviceRegistration = async device_id => {
  try {
    const result = await db.query('SELECT * FROM farming_iot WHERE id = $1 AND deleted_at IS NULL', [device_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error in deviceService:', error);
    throw new Error('Database query failed.');
  }
};

const insertLog = async (device_id, timestamp, air_temperature, air_humidity, soil_humidity) => {
  try {
    const queryGetInfo = `
      SELECT 
        ST_AsGeoJSON(fq.area) AS area, 
        fp."name" AS product_name,
        fq.zone_id AS zone_id
      FROM farming_iot fi
      INNER JOIN farming_quadrant fq ON fq.iot_id = fi.id
      INNER JOIN farming_product fp ON fp.id = fq.product_id
      WHERE fi.id = $1;
    `;
    const deviceInfoResult = await db.query(queryGetInfo, [device_id]);
    const { area = null, product_name = null, zone_id = null } = deviceInfoResult.rows[0] || {};

    const queryInsertLog = `
      INSERT INTO farming_iot_logs (device_id, timestamp, air_temperature, air_humidity, soil_humidity, area, product_name,zone_id)
      VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6), $7, $8)
      RETURNING *;
    `;
    const values = [device_id, timestamp, air_temperature, air_humidity, soil_humidity, area, product_name, zone_id];
    const result = await db.query(queryInsertLog, values);

    console.log('Inserted log:', result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error('Error inserting log data:', error);
    throw new Error('Failed to insert log data into the database.');
  }
};

const getDeviceAveragesByAbsoluteTime = async (start_time, end_time) => {
  try {
    const query = `
      SELECT 
        device_id, 
        ROUND(CAST(AVG(air_temperature) AS numeric), 2) AS average_air_temperature,
        ROUND(CAST(AVG(air_humidity) AS numeric), 2) AS average_air_humidity,
        ROUND(CAST(AVG(soil_humidity) AS numeric), 2) AS average_soil_humidity,
        ST_AsGeoJSON(area) AS area, 
        product_name
      FROM farming_iot_logs
      WHERE timestamp AT TIME ZONE 'America/Santiago' >= $1 
        AND timestamp AT TIME ZONE 'America/Santiago' <= $2
      GROUP BY area, device_id, product_name; 
    `;
    const values = [start_time, end_time];
    const result = await db.query(query, values);

    return result.rows;
  } catch (error) {
    console.error('Error getting average data:', error);
    throw new Error('Database query failed.');
  }
};

const getDeviceAveragesByRelativeTime = async seconds => {
  try {
    const query = `
      SELECT 
        device_id, 
        ROUND(CAST(AVG(air_temperature) AS numeric), 2) AS average_air_temperature,
        ROUND(CAST(AVG(air_humidity) AS numeric), 2) AS average_air_humidity,
        ROUND(CAST(AVG(soil_humidity) AS numeric), 2) AS average_soil_humidity,
        ST_AsGeoJSON(area) AS area, 
        product_name
      FROM farming_iot_logs
      WHERE timestamp  AT TIME ZONE 'America/Santiago' >= (NOW() AT TIME ZONE 'America/Santiago') - INTERVAL '${seconds} seconds'
      GROUP BY area, device_id, product_name;
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting average data:', error);
    throw new Error('Database query failed.');
  }
};

const getDeviceDailyHumidityAverages = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        fil.zone_id AS zona,
        fil.device_id,
        TO_CHAR(fil.timestamp AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD') AS day,
        ROUND(CAST(AVG(fil.soil_humidity) AS numeric), 2) AS average_humidity
      FROM 
        farming_iot_logs fil
      WHERE 
        fil.timestamp AT TIME ZONE 'America/Santiago' >= $1
        AND fil.timestamp AT TIME ZONE 'America/Santiago' < $2
        AND fil.zone_id IS NOT NULL
      GROUP BY 
        fil.zone_id, 
        fil.device_id, 
        TO_CHAR(fil.timestamp AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD')
      ORDER BY 
        fil.zone_id, 
        fil.device_id, 
        TO_DATE(TO_CHAR(fil.timestamp AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD'), 'YYYY-MM-DD');
    `;
    const values = [startDate, endDate];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching logs by date range:', error);
    throw new Error('Database query failed');
  }
};

module.exports = {
  checkDeviceRegistration,
  insertLog,
  getDeviceAveragesByAbsoluteTime,
  getDeviceAveragesByRelativeTime,
  getDeviceDailyHumidityAverages,
};
