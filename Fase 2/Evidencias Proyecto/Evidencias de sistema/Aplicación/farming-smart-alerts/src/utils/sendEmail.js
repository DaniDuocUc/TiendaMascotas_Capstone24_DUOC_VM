const transporter = require('../config/mailConfig');

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.ZOHO_USER,
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          path: './src/assets/logo.png',
          cid: 'logo',
        },
      ],
    });

    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error to sent Email:', error);
  }
};

module.exports = sendEmail;
