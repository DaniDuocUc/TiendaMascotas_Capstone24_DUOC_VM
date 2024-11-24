const validateApiKey = (req, res, next) => {
  const apiKey = req.header('API-Key');
  const validApiKeys = [process.env.API_KEY_DEVICE_1];

  if (validApiKeys.includes(apiKey)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid API Key' });
  }
};

module.exports = validateApiKey;
