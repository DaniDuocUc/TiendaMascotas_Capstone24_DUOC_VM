const axios = require('axios');
const { DateTime } = require('luxon');

async function keepAppAwake(intervalTime) {
  setInterval(async () => {
    const appUrl = process.env.APP_URL;
    const currentTime = DateTime.now().setZone('America/Santiago').toFormat('yyyy-MM-dd HH:mm:ss');
    console.log(`keepAppAwake started at ${currentTime}. URL: ${appUrl}`);

    try {
      const response = await axios.get(appUrl);
      console.log(`Request to ${appUrl} sent. Status: ${response.status}`);
    } catch (error) {
      console.error('Error making the request:', error.message);
    }
  }, intervalTime);
}

module.exports = keepAppAwake;
