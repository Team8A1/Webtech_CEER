const { Redis } = require('ioredis');

/**
 * Shared Redis connection for BullMQ.
 *
 * BullMQ requires TWO separate ioredis connections per queue —
 * one for the Queue (publisher) and one for the Worker (subscriber/blocking).
 * We expose a factory so each queue/worker creates its own connection.
 *
 * Config is read from REDIS_URL (e.g. redis://localhost:6379 or a Redis Cloud URL).
 * Falls back to localhost:6379 for local dev.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

/**
 * Create a fresh ioredis connection configured for BullMQ.
 * BullMQ manages the lifecycle; we just hand it the connection.
 */
const createRedisConnection = () => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,    // Required by BullMQ
    lazyConnect: true,
  });

  client.on('error', (err) => {
    // Log but don't crash — if Redis is down, emails are skipped gracefully
    console.error('[Redis] Connection error:', err.message);
  });

  return client;
};

module.exports = { createRedisConnection };
