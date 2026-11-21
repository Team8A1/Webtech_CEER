const { Queue } = require('bullmq');
const { createRedisConnection } = require('../config/redis.config');

/**
 * Email Queue
 *
 * Instead of calling sendEmail() inline (which blocks the HTTP response for
 * ~200-500ms per SMTP round-trip), controllers add jobs to this queue and
 * return immediately. The Worker (email.worker.js) picks them up and sends
 * asynchronously with retry support.
 *
 * Job types (jobName) and their data shapes:
 *
 *  'bom_submitted'   → { to, studentName, guideEmail, partName, consumableName, qty, specification, teamId, problemStatement, studentUsn }
 *  'bom_copy'        → { to, studentName, guideName, partName, qty, submittedAt }
 *  'bom_status'      → { to, studentName, facultyName, status, partName, qty, specification, reason }
 *  'generic'         → { to, subject, text, html, bcc }
 */

let _emailQueue = null;

const getEmailQueue = () => {
  if (!_emailQueue) {
    _emailQueue = new Queue('email', {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 3,                // retry up to 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 5000,             // 5s → 25s → 125s
        },
        removeOnComplete: { count: 100 },  // keep last 100 completed jobs for audit
        removeOnFail:     { count: 200 },  // keep last 200 failed jobs for debugging
      },
    });
  }
  return _emailQueue;
};

/**
 * Enqueue an email job.
 * Controllers call this instead of calling sendEmail() directly.
 *
 * @param {string} jobName  - One of the job types listed above
 * @param {object} data     - Payload matching that job type
 * @param {object} [opts]   - Optional BullMQ job options (delay, priority, etc.)
 */
const enqueueEmail = async (jobName, data, opts = {}) => {
  try {
    const queue = getEmailQueue();
    const job = await queue.add(jobName, data, opts);
    return job.id;
  } catch (err) {
    // If Redis is unavailable, fall back to direct send so emails are never lost
    console.warn('[EmailQueue] Redis unavailable — falling back to direct send:', err.message);
    const { sendEmail } = require('../utils/email.util');
    // Build a minimal direct send from whatever data we have
    if (data.subject && data.to) {
      await sendEmail(data.to, data.subject, data.text || '', data.html || '', data.bcc);
    }
    return null;
  }
};

module.exports = { getEmailQueue, enqueueEmail };
