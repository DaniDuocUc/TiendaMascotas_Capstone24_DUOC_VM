const { determineStatus } = require('./statusUtils');

const formatDeviceLogsResponse = (logs, start_date, end_date) => {
  const response = {
    status: 'success',
    data: {
      start_date,
      end_date,
      report_date: new Date().toISOString().split('T')[0],
      zones: [],
    },
  };

  const zoneMap = {};

  logs.forEach(log => {
    const { zona, device_id, day, average_humidity } = log;

    if (!zoneMap[zona]) {
      zoneMap[zona] = { zona, devices: {} };
    }

    if (!zoneMap[zona].devices[device_id]) {
      zoneMap[zona].devices[device_id] = {
        device_id: `IOT N°${device_id}`,
        humidity_readings: {},
      };
    }

    zoneMap[zona].devices[device_id].humidity_readings[day] = average_humidity;
  });

  for (const zone of Object.values(zoneMap)) {
    const devices = Object.values(zone.devices);
    response.data.zones.push({ zona: zone.zona, devices });
  }

  return response;
};

const formatDeviceData = devicesData => {
  return devicesData.map(device => ({
    device_id: device.device_id,
    average_air_temperature: parseFloat(device.average_air_temperature).toFixed(2),
    average_air_humidity: parseFloat(device.average_air_humidity).toFixed(2),
    average_soil_humidity: parseFloat(device.average_soil_humidity).toFixed(2),
    area: JSON.parse(device.area),
    status: determineStatus(parseFloat(device.average_soil_humidity)),
    product_name: device.product_name,
  }));
};

module.exports = {
  formatDeviceLogsResponse,
  formatDeviceData,
};
