const { DateTime } = require('luxon');
const { conditionMap, metricMap, operatorMap, statusMap } = require('../../utils/mappings');
const { formatTimeWindow } = require('../../utils/dateUtils');
const alertService = require('./alertService');

const createAlert = async (req, res) => {
  try {
    const { product_id, name, condition, operator, threshold, time_window, emails, status } = req.body;

    const newAlert = await alertService.createAlert({
      product_id,
      name,
      condition,
      operator,
      threshold,
      time_window,
      emails,
      status,
    });

    res.status(201).send({
      message: 'Alert created successfully',
      data: newAlert,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).send({
      message: 'An error occurred while creating the alert.',
    });
  }
};

const getAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const alertsData = await alertService.getAlerts(page, limit);
    const chileTime = DateTime.now().setZone('America/Santiago').toFormat('dd/MM/yyyy - HH:mm:ss');

    const mappedAlerts = alertsData.alerts.map(alert => {
      return {
        ...alert,
        condition: conditionMap[alert.condition] || alert.condition,
        operator: operatorMap[alert.operator] || alert.operator,
        time_window: formatTimeWindow(alert.time_window),
        status: statusMap[alert.status] || alert.status,
        metric: metricMap[alert.metric] || alert.metric,
      };
    });

    res.status(200).send({
      request_time: chileTime,
      current_page: alertsData.currentPage,
      total_pages: alertsData.totalPages,
      total_alerts: alertsData.totalAlerts,
      alerts: mappedAlerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).send({
      message: 'An error occurred while fetching alerts.',
    });
  }
};

const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).send({
        message: 'The ID must be a numeric value.',
      });
    }
    const alert = await alertService.getAlertById(id);

    if (!alert) {
      return res.status(404).send({
        message: `Alert with id ${id} not found.`,
      });
    }

    const chileTime = DateTime.now().setZone('America/Santiago').toFormat('dd/MM/yyyy - HH:mm:ss');

    res.status(200).send({
      request_time: chileTime,
      alert: {
        ...alert,
        condition: conditionMap[alert.condition] || alert.condition,
        operator: operatorMap[alert.operator] || alert.operator,
        status: statusMap[alert.status] || alert.status,
        metric: metricMap[alert.metric] || alert.metric,
      },
    });
  } catch (error) {
    console.error(`Error fetching alert with id ${id}:`, error);
    res.status(500).send({
      message: 'An error occurred while fetching the alert.',
    });
  }
};

const updateAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      product_id = req.alert.product_id,
      name = req.alert.name,
      condition = req.alert.condition,
      operator = req.alert.operator,
      threshold = req.alert.threshold,
      emails = req.alert.emails,
      status = req.alert.status,
      time_window = req.alert.time_window,
      metric = req.alert.metric,
    } = req.body;

    const updatedAlert = await alertService.updateAlert(id, {
      product_id,
      name,
      condition,
      operator,
      threshold,
      emails,
      status,
      time_window,
      metric,
    });

    res.status(200).send({
      message: 'Alert updated successfully',
      alert: updatedAlert,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).send({
      message: 'An error occurred while updating the alert',
    });
  }
};

const deleteAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAlert = await alertService.deleteAlert(id);
    
    res.status(200).send({
      message: 'Alert deleted successfully',
      alert: deletedAlert,
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).send({
      message: 'An error occurred while deleting the alert',
    });
  }
};

const getTriggeredAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const triggeredAlertsData = await alertService.getTriggeredAlerts(page, limit);
    const chileTime = DateTime.now().setZone('America/Santiago').toFormat('dd/MM/yyyy - HH:mm:ss');

    const mappedAlerts = triggeredAlertsData.alerts.map(alert => {
      return {
        ...alert,
        condition: conditionMap[alert.condition] || alert.condition,
        operator: operatorMap[alert.operator] || alert.operator,
        time_window: formatTimeWindow(alert.time_window),
        metric: metricMap[alert.metric] || alert.metric,
      };
    });

    res.status(200).send({
      request_time: chileTime,
      current_page: triggeredAlertsData.currentPage,
      total_pages: triggeredAlertsData.totalPages,
      total_triggered_alerts: triggeredAlertsData.totalAlerts,
      alerts: mappedAlerts,
    });
  } catch (error) {
    console.error('Error fetching triggered alerts:', error);
    res.status(500).send({
      message: 'An error occurred while fetching triggered alerts.',
    });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlertById,
  deleteAlertById,
  getTriggeredAlerts,
};
