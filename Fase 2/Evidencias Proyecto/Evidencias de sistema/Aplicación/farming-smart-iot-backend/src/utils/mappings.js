const conditionMap = {
  soil_humidity: 'Humedad Tierra',
  air_humidity: 'Humedad Aire',
  air_temperature: 'Temperatura Aire',
};

const metricMap = {
  AVG: 'Promedio',
};

const operatorMap = {
  '>': 'Mayor que',
  '<': 'Menor que',
  '=': 'Igual a',
  '>=': 'Mayor o igual que',
  '<=': 'Menor o igual que',
};

const statusMap = {
  true: 'Activa',
  false: 'Inactiva',
};

module.exports = {
  metricMap,
  conditionMap,
  operatorMap,
  statusMap,
};
