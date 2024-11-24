const validateAlertData = (isUpdate = false) => {
  return (req, res, next) => {
    const { condition, operator, threshold, emails, status, time_window } = req.body;

    if (!isUpdate && !validateRequiredFields(req.body)) {
      return res.status(400).send({
        message:
          'Missing required fields: product_id, name, condition, operator, threshold, emails, status, time_window',
      });
    }

    if (condition && !validateCondition(condition)) {
      return res.status(400).send({
        message: 'Invalid condition. Allowed value is: soil_humidity',
      });
    }

    if (operator && !validateOperator(operator)) {
      return res.status(400).send({
        message: 'Invalid operator. Allowed operators are: >, <, >=, <=, =',
      });
    }

    if (emails && !validateEmails(emails)) {
      return res.status(400).send({
        message: 'Invalid email format. Please provide valid email addresses.',
      });
    }

    if (status !== undefined && !validateStatus(status)) {
      return res.status(400).send({
        message: 'Status must be either true or false.',
      });
    }

    if (threshold !== undefined && !validateThreshold(threshold)) {
      return res.status(400).send({
        message: 'Threshold must be a number between 0 and 100.',
      });
    }

    if (time_window !== undefined && !validateTimeWindow(time_window)) {
      return res.status(400).send({
        message: 'Time window must be a number between 1 minute and 1440 minutes (24 hours).',
      });
    }

    next();
  };
};

function validateRequiredFields({ product_id, name, condition, operator, threshold, emails, status, time_window }) {
  return (
    product_id &&
    name &&
    condition &&
    operator &&
    threshold !== undefined &&
    emails &&
    status !== undefined &&
    time_window !== undefined
  );
}

function validateCondition(condition) {
  const validCondition = 'soil_humidity';
  return condition === validCondition;
}

function validateOperator(operator) {
  const validOperators = ['>', '<', '>=', '<=', '='];
  return validOperators.includes(operator);
}

function validateEmails(emails) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
  const emailArray = emails.split(',').map(email => email.trim());
  const invalidEmails = emailArray.filter(email => !emailRegex.test(email));
  return invalidEmails.length === 0;
}

function validateStatus(status) {
  return typeof status === 'boolean';
}

function validateThreshold(threshold) {
  return !isNaN(threshold) && threshold >= 0 && threshold <= 100;
}

function validateTimeWindow(time_window) {
  return !isNaN(time_window) && time_window >= 1 && time_window <= 1440;
}

module.exports = validateAlertData;
