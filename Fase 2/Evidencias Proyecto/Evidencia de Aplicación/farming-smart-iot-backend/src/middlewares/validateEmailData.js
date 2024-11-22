const validateEmailData = (req, res, next) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    return res.status(400).send({ message: 'Missing required fields: to, subject, htmlContent.' });
  }

  if (!validateEmails(to)) {
    return res.status(400).send({ message: 'Invalid email format in "to" field.' });
  }

  next();
};

function validateEmails(emails) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
  const emailArray = emails.split(',').map(email => email.trim());
  const invalidEmails = emailArray.filter(email => !emailRegex.test(email));
  return invalidEmails.length === 0;
}

module.exports = { validateEmailData };
