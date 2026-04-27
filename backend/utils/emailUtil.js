const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html, bcc = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CEER Portal" <${process.env.EMAIL_USER}>`,
      to: to,
      bcc: bcc || process.env.EMAIL_USER, // BCC the system account by default to keep a record in the "Sent" folder
      replyTo: process.env.EMAIL_USER,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

module.exports = { sendEmail };
