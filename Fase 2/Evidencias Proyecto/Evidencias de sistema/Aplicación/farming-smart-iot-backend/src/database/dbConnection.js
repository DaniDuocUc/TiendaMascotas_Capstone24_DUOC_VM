const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client from pool', err.stack);
    return;
  }
  console.log('Successfully connected to the database');
  release();
});

module.exports = pool;
