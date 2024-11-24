const fs = require('fs');
const path = require('path');
const sendEmail = require('../../utils/sendEmail');

const sendEmailController = async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    // Read the email template
    const templatePath = path.join(__dirname, '../../templates/emailTemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Replace the placeholders
    emailTemplate = emailTemplate.replace('{{content}}', htmlContent);
    emailTemplate = emailTemplate.replace('{{url}}', process.env.URL_FRONTEND);

    // If a file is uploaded, add it as an attachment
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        path: req.file.path,
      });
    }

    const info = await sendEmail(to, subject, emailTemplate, attachments);

    res.status(200).send({
      message: 'Email sent successfully',
      info,
    });

    // Delete the uploaded file after sending the email
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('Uploaded file deleted:', req.file.path);
        }
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email', error: error.message });
  }
};

module.exports = { sendEmailController };
