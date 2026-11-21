const { Worker } = require('bullmq');
const { createRedisConnection } = require('../config/redis.config');
const { sendEmail } = require('../utils/email.util');

// ─── Email HTML templates ──────────────────────────────────────────────────────

const BASE_URL = process.env.APP_URL || 'https://webtech-ceer.vercel.app';

const bomSubmittedHtml = (d) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <h2 style="color: #1f2937; border-bottom: 3px solid #7f1d1d; padding-bottom: 10px; margin-bottom: 20px;">New BOM Request</h2>
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #374151; font-size: 16px;">Student Information:</h3>
    <p style="margin: 8px 0;"><strong>Student:</strong> ${d.studentName}</p>
    <p style="margin: 8px 0;"><strong>USN:</strong> ${d.studentUsn}</p>
    <p style="margin: 8px 0;"><strong>Team ID:</strong> ${d.teamId || 'N/A'}</p>
    <p style="margin: 8px 0;"><strong>Problem Statement:</strong> ${d.problemStatement || 'N/A'}</p>
  </div>
  <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #7f1d1d; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #7f1d1d; font-size: 16px;">Requested Item Details:</h3>
    <p style="margin: 8px 0;"><strong>Item:</strong> ${d.partName}</p>
    <p style="margin: 8px 0;"><strong>Consumable:</strong> ${d.consumableName}</p>
    <p style="margin: 8px 0;"><strong>Quantity:</strong> ${d.qty}</p>
    <p style="margin: 8px 0;"><strong>Specification:</strong> ${d.specification}</p>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${BASE_URL}/login/faculty"
       style="background-color: #7f1d1d; color: white; padding: 12px 30px; text-decoration: none;
              border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
      Review on Faculty Dashboard
    </a>
  </div>
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
  <p style="color: #6b7280; font-size: 12px; text-align: center;">CEER Portal automated notification.</p>
</div>`;

const bomCopyHtml = (d) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <h2 style="color: #7f1d1d;">BOM Request Submitted</h2>
  <p>Dear ${d.studentName},</p>
  <p>This is a copy of your BOM request submitted on ${d.submittedAt}.</p>
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Item:</strong> ${d.partName}</p>
    <p><strong>Quantity:</strong> ${d.qty}</p>
    <p><strong>Guide:</strong> ${d.guideName || 'N/A'}</p>
  </div>
  <p>You will be notified once your guide reviews the request.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="font-size: 12px; color: #6b7280;">CEER Portal automated notification.</p>
</div>`;

const bomStatusHtml = (d) => {
  const color = d.status === 'approved' ? '#16a34a' : '#dc2626';
  const statusText = d.status.toUpperCase();
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937; border-bottom: 3px solid ${color}; padding-bottom: 10px;">
    BOM Request ${statusText}
  </h2>
  <p>Dear ${d.studentName},</p>
  <p>Your BOM request has been <strong style="color: ${color};">${statusText}</strong> by ${d.facultyName}.</p>
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #374151;">Request Details:</h3>
    <p><strong>Item:</strong> ${d.partName}</p>
    <p><strong>Quantity:</strong> ${d.qty}</p>
    <p><strong>Specification:</strong> ${d.specification}</p>
    ${d.reason ? `<p><strong style="color: #dc2626;">Reason for Rejection:</strong> ${d.reason}</p>` : ''}
  </div>
  ${d.status === 'approved'
    ? '<p style="color: #16a34a;">✓ Your request will now proceed to lab approval.</p>'
    : '<p style="color: #dc2626;">You may submit a new request with the required modifications.</p>'}
  <p><a href="${BASE_URL}/login/student"
        style="background-color: #7f1d1d; color: white; padding: 10px 20px;
               text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
    View Dashboard
  </a></p>
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
  <p style="color: #6b7280; font-size: 12px;">CEER Portal automated notification.</p>
</div>`;
};

// ─── Processor ────────────────────────────────────────────────────────────────

/**
 * Process a single email job.
 * Each jobName maps to a template builder + recipient logic.
 */
const processEmailJob = async (job) => {
  const { name, data } = job;

  let to, subject, text, html, bcc;

  switch (name) {
    case 'bom_submitted':
      to      = data.guideEmail;
      subject = `New BOM Request from ${data.studentName} (${data.studentUsn})`;
      text    = `${data.studentName} submitted a BOM request for ${data.partName} (qty: ${data.qty}).`;
      html    = bomSubmittedHtml(data);
      break;

    case 'bom_copy':
      to      = data.to;
      subject = `Copy: BOM Request Submitted — ${data.partName}`;
      text    = `Your BOM request for ${data.partName} was submitted on ${data.submittedAt}.`;
      html    = bomCopyHtml(data);
      break;

    case 'bom_status':
      to      = data.to;
      subject = `BOM Request ${data.status.toUpperCase()} — ${data.partName}`;
      text    = `Your BOM request for ${data.partName} has been ${data.status} by ${data.facultyName}.${data.reason ? ` Reason: ${data.reason}` : ''}`;
      html    = bomStatusHtml(data);
      break;

    case 'generic':
      ({ to, subject, text, html, bcc } = data);
      break;

    default:
      console.warn(`[EmailWorker] Unknown job type: ${name}`);
      return;
  }

  if (!to) {
    console.warn(`[EmailWorker] Job ${job.id} (${name}) has no recipient — skipping`);
    return;
  }

  const result = await sendEmail(to, subject, text, html, bcc);
  if (!result) {
    // sendEmail returns null on error; throw so BullMQ retries
    throw new Error(`sendEmail returned null for job ${job.id}`);
  }

  console.log(`[EmailWorker] ✅ Sent "${name}" to ${to} (job ${job.id})`);
};

// ─── Worker bootstrap ─────────────────────────────────────────────────────────

let _worker = null;

/**
 * Start the email worker. Call this once at server startup.
 * The worker runs in the same process as Express but non-blocking.
 */
const startEmailWorker = () => {
  if (_worker) return _worker;

  _worker = new Worker('email', processEmailJob, {
    connection: createRedisConnection(),
    concurrency: 5, // process up to 5 emails in parallel
  });

  _worker.on('completed', (job) => {
    console.log(`[EmailWorker] Job ${job.id} (${job.name}) completed`);
  });

  _worker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} (${job?.name}) failed: ${err.message}`);
  });

  _worker.on('error', (err) => {
    console.error('[EmailWorker] Worker error:', err.message);
  });

  console.log('[EmailWorker] 🚀 Started (concurrency=5)');
  return _worker;
};

module.exports = { startEmailWorker };
