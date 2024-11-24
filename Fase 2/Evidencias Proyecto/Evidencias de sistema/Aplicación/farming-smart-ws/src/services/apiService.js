const axios = require('axios');

async function getAverageData({ apiUrl, apiKey, seconds, endpoint }) {
  try {
    const response = await axios.get(`${apiUrl}${endpoint}`, {
      params: { seconds },
      headers: { 'API-Key': apiKey },
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error('Error fetching data from the API');
    }
  }
}
async function getLatestTriggeredAlert({ apiUrl, apiKey, endpoint }) {
  try {
    const response = await axios.get(`${apiUrl}${endpoint}`, {
      headers: { 'API-Key': apiKey },
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error('Error fetching latest alert from the API');
    }
  }
}

module.exports = {
  getAverageData,
  getLatestTriggeredAlert,
};
