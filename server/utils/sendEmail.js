const nodemailer = require('nodemailer');

/**
 * Sends an HTML email via Gmail SMTP using a Gmail App Password.
 *
 * SETUP REQUIRED:
 * 1. Enable 2-Factor Authentication on your Gmail account.
 * 2. Go to: https://myaccount.google.com/security -> App Passwords
 * 3. Generate a password for "Mail" -> "Other" -> name it "ESIWES"
 * 4. Use the 16-character code (no spaces) as EMAIL_PASSWORD in .env
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body content
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials not configured. Set EMAIL_USERNAME and EMAIL_PASSWORD in .env');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"UniIlorin E-SIWES" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId} -> ${to}`);
  return info;
};

module.exports = sendEmail;