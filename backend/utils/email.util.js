const nodemailer = require('nodemailer');

// SCALING FIX (Email): Create the transporter once at module load time, not on every sendEmail() call.
// Re-creating it per request wastes ~50-100ms on SMTP handshake and can exhaust connection pools at scale.
// nodemailer reuses a persistent SMTP connection when the transporter is a module-level singleton.
let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for others
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // SCALING FIX: connection pool — reuse up to 5 SMTP connections concurrently
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return _transporter;
};

/**
 * Send an email via the shared SMTP transporter.
 * @param {string}      to       - Recipient address
 * @param {string}      subject  - Email subject
 * @param {string}      text     - Plain-text body (fallback)
 * @param {string}      html     - HTML body
 * @param {string|null} bcc      - Optional BCC (defaults to system account for audit trail)
 * @returns {Promise<object|null>} nodemailer info object, or null on failure
 */
const sendEmail = async (to, subject, text, html, bcc = null) => {
  // Guard: skip silently if email is not configured (e.g. local dev without .env)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[email] EMAIL_USER / EMAIL_PASS not set — skipping email send');
    return null;
  }

  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"CEER Portal" <${process.env.EMAIL_USER}>`,
      to,
      // BCC system account by default to keep an audit trail in the Sent folder
      bcc: bcc || process.env.EMAIL_USER,
      replyTo: process.env.EMAIL_USER,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    // SCALING FIX: reset the singleton on auth/connection errors so the next
    // call gets a fresh transporter (handles credential rotation, idle timeouts).
    if (error.code === 'EAUTH' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      _transporter = null;
    }
    console.error('[email] Error sending email:', error.message);
    return null;
  }
};

module.exports = { sendEmail };
