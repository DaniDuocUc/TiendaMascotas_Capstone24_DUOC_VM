const transporter = require('../config/mailConfig');

const sendEmail = async (to, subject, emailTemplate, attachments) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: emailTemplate,
      attachments: [
        {
          filename: 'logo.png',
          path: './src/assets/logo.png',
          cid: 'logo',
        },
        ...attachments,
      ],
    });

    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error to sent Email:', error);
  }
};

module.exports = sendEmail;
