const { DateTime } = require('luxon');
const deviceService = require('./deviceService');
const { getChileTime } = require('../../utils/dateUtils');
const { formatDeviceLogsResponse, formatDeviceData } = require('../../utils/formatters');

const receiveData = async (req, res) => {
  const { device_id, air_temperature, air_humidity, soil_humidity } = req.body;

  try {
    const timestamp = getChileTime();
    const logData = await deviceService.insertLog(
      device_id,
      timestamp,
      air_temperature,
      air_humidity,
      soil_humidity || null
    );

    res.status(201).send({
      message: 'Data stored successfully',
      data: logData,
    });
  } catch (error) {
    console.error('Error in deviceController:', error);
    res.status(500).send({
      message: 'An error occurred while storing the data.',
    });
  }
};

const getDeviceAveragesByAbsoluteTime = async (req, res) => {
  const { start_time, end_time } = req.query;

  try {
    const devicesData = await deviceService.getDeviceAveragesByAbsoluteTime(start_time, end_time);
    const chileTime = DateTime.now().setZone('America/Santiago').toFormat('dd/MM/yyyy - HH:mm:ss');

    const response = {
      request_time: chileTime,
      time_range: { start_time, end_time },
      devices: formatDeviceData(devicesData),
    };

    res.status(200).send(response);
  } catch (error) {
    console.error('Error in getDeviceAveragesByAbsoluteTime controller:', error);
    res.status(500).send({
      message: 'An error occurred while fetching data.',
    });
  }
};

const getDeviceAveragesByRelativeTime = async (req, res) => {
  const { seconds } = req.query;

  try {
    const devicesData = await deviceService.getDeviceAveragesByRelativeTime(seconds);
    const chileTime = DateTime.now().setZone('America/Santiago').toFormat('dd/MM/yyyy - HH:mm:ss');

    const response = {
      request_time: chileTime,
      devices: formatDeviceData(devicesData),
    };

    res.status(200).send(response);
  } catch (error) {
    console.error('Error in getDeviceAveragesByRelativeTimeController:', error);
    res.status(500).send({
      message: 'An error occurred while fetching data.',
    });
  }
};

const getDeviceDailyHumidityAverages = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    // Add one day to the end date to include all logs from that day
    const adjustedEndDate = new Date(end_date);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const logs = await deviceService.getDeviceDailyHumidityAverages(start_date, adjustedEndDate);

    const formattedResponse = formatDeviceLogsResponse(logs, start_date, end_date);

    res.status(200).send(formattedResponse);
  } catch (error) {
    console.error('Error in getDeviceDailyHumidityAverages:', error);
    res.status(500).send({
      message: 'An error occurred while fetching data.',
    });
  }
};

module.exports = {
  receiveData,
  getDeviceAveragesByAbsoluteTime,
  getDeviceAveragesByRelativeTime,
  getDeviceDailyHumidityAverages,
};
