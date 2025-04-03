const nodemailer = require('nodemailer');
require('dotenv').config();

// Function to send email
exports.sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'ODRS'} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Add HTML version if provided
  if (options.html) {
    mailOptions.html = options.html;
  }

  // Add application URL to email templates
  const appUrl = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.DOMAIN}` 
    : 'http://localhost:3000';
  
  // Replace placeholders in email templates
  mailOptions.text = mailOptions.text.replace('{APP_URL}', appUrl);
  
  if (mailOptions.html) {
    mailOptions.html = mailOptions.html.replace(/{APP_URL}/g, appUrl);
  }

  // Send email
  await transporter.sendMail(mailOptions);
};