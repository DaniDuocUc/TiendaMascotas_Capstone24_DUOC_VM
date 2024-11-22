require('dotenv').config();
const express = require('express');
const { alertProcess, keepAppAwake } = require('./jobs');

const app = express();
app.disable('x-powered-by');

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send({
    status: 'UP',
    message: 'Service is healthy',
  });
});

// Handle non-existent routes
app.use((req, res) => {
  res.status(404).send({
    message: 'The route does not exist. Please check the URL and try again.',
  });
});

// Setup intervals
const alertProcessInterval = (process.env.alertProcessInterval_SECONDS || 15) * 1000;
const keepAwakeInterval = (process.env.KEEP_AWAKE_INTERVAL_SECONDS || 60) * 1000;

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  keepAppAwake(keepAwakeInterval);
  alertProcess(alertProcessInterval);
});
