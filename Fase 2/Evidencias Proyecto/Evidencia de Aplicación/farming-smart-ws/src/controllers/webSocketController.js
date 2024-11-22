const WebSocket = require('ws');
const { getAverageData, getLatestTriggeredAlert } = require('../services/apiService');
const { handleIoTNotification, handleAlertsNotification } = require('../utils/notificationHandler');
const e = require('express');

function handleMessage({ message, ws, apiDetails, state, endpoint, clientIp, clientOrigin }) {
  let parsedMessage;

  // Parse the incoming message
  try {
    parsedMessage = JSON.parse(message.toString());
  } catch (err) {
    const errorMessage = 'Invalid JSON format';
    console.log(`Error parsing message: ${errorMessage}`);
    ws.send(JSON.stringify({ message: errorMessage }));
    return;
  }

  const { command, seconds } = parsedMessage;

  if (command === 'startUpdates') {
    if (state.notificationListener) {
      state.notificationListener.removeListener();
    }

    // Log the change in seconds if the value is different from the previous request
    if (state.seconds && state.seconds !== seconds) {
      const currentTime = Date.now();
      const previousTimeRequested = ((currentTime - state.requestTime) / 1000).toFixed(2); // Calculate the duration in seconds

      console.log(
        `Client with IP: ${clientIp}, Origin: ${clientOrigin}, changed request from ${state.seconds} seconds to ${seconds} seconds after ${previousTimeRequested} seconds.`
      );

      state.requestTime = currentTime;
    } else {
      state.requestTime = Date.now();
    }

    state.sendUpdates = true;
    state.seconds = seconds;

    ws.send('Updates will now be sent for any database changes');
    console.log(`Client with IP: ${clientIp}, Origin: ${clientOrigin}, requested updates for ${seconds} seconds.`);

    // Listen for IoT notifications
    state.notificationListener = handleIoTNotification(async () => {
      if (state.sendUpdates) {
        try {
          const data = await getAverageData({ ...apiDetails, seconds, endpoint });
          ws.send(JSON.stringify(data));
        } catch (error) {
          ws.send(JSON.stringify({ message: error.message }));
          // Log the error and stop sending updates
          console.log(`Error occurred: ${error.message}. Stopping updates for client IP: ${clientIp}`);
          state.sendUpdates = false;

          if (state.notificationListener) {
            state.notificationListener.removeListener();
            state.notificationListener = null;
          }
        }
      }
    });
  } else if (command === 'stopUpdates' && state.sendUpdates) {
    state.sendUpdates = false;
    ws.send('Updates have been paused');

    // Log that the client stopped requesting updates and the duration of the request
    const stopTime = Date.now();
    const timeRequested = ((stopTime - state.requestTime) / 1000).toFixed(2); // Calculate the duration in seconds

    console.log(
      `Client with IP: ${clientIp}, Origin: ${clientOrigin}, stopped requested for ${state.seconds} seconds. Request was active for ${timeRequested} seconds.`
    );

    if (state.notificationListener) {
      state.notificationListener.removeListener();
      state.notificationListener = null;
    }
  }
}

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  const apiDetails = {
    apiUrl: process.env.API_URL,
    apiKey: process.env.API_KEY,
  };

  wss.on('connection', async (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const clientOrigin = req.headers.origin;
    const connectionTime = Date.now();

    console.log(`New client connected from IP: ${clientIp}, Origin: ${clientOrigin}`);
    ws.send('Connection established with the WebSocket server. Please send startUpdates to begin.');

    const state = {
      sendUpdates: false,
      notificationListener: null,
      seconds: null,
    };

    // Listen for triggered alerts
    const alertsListener = handleAlertsNotification(async () => {
      const endpoint = '/alerts/triggered?limit=1';
      try {
        const latestAlert = await getLatestTriggeredAlert({ ...apiDetails, endpoint });
        ws.send(JSON.stringify(latestAlert));
      } catch (error) {
        console.log(`Error fetching latest alert: ${error.message}`);
        ws.send(JSON.stringify({ message: 'Error fetching latest alert' }));
      }
    });

    ws.on('message', message => {
      handleMessage({
        message,
        ws,
        apiDetails,
        state,
        endpoint: '/device/averages-by-seconds',
        clientIp,
        clientOrigin,
      });
    });

    ws.on('close', () => {
      // Calculate the time connected
      const disconnectionTime = Date.now();
      const timeConnected = ((disconnectionTime - connectionTime) / 1000).toFixed(2); // Calculate the duration in seconds

      console.log(
        `Client disconnected from IP: ${clientIp}, Origin: ${clientOrigin}. Time connected: ${timeConnected} seconds.`
      );
      if (alertsListener) {
        alertsListener.removeListener();
      }

      if (state.notificationListener) {
        state.notificationListener.removeListener();
      }
    });
  });
}

module.exports = {
  setupWebSocketServer,
};
