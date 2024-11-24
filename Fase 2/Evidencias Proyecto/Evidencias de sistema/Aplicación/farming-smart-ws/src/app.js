require('dotenv').config();
const express = require('express');
const { setupWebSocketServer } = require('./controllers/webSocketController');

// Express app setup
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

// Server setup
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

setupWebSocketServer(server);
