const { Client } = require('pg');

const client = new Client({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Successfully connected to the database');
});

module.exports = client;
