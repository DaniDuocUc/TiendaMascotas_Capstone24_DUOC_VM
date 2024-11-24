require('dotenv').config();
const express = require('express');
const deviceRoutes = require('./modules/device/deviceRoutes');
const alertRoutes = require('./modules/alert/alertRoutes');
const emailRoutes = require('./modules/email/emailRoutes');
const validateApiKey = require('./middlewares/validateApiKey');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

// Express app setup
const app = express();
app.disable('x-powered-by');

// Middleware to parse JSON requests
app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api', validateApiKey, deviceRoutes);
app.use('/api', validateApiKey, alertRoutes);
app.use('/api', validateApiKey, emailRoutes);

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
