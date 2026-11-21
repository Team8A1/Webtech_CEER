const mongoose = require('mongoose');

/**
 * Connect to MongoDB with production-grade options.
 *
 * SCALING IMPROVEMENTS:
 *  - maxPoolSize: Keep up to 10 connections ready (default is 5). Prevents
 *    queue build-up under moderate concurrent load.
 *  - serverSelectionTimeoutMS: Fail fast (5 s) if Atlas / replica set is
 *    unreachable instead of hanging for 30 s (Mongoose default).
 *  - socketTimeoutMS: Close idle sockets after 45 s to free resources.
 *  - heartbeatFrequencyMS: Poll replica-set health every 10 s (default 10 s —
 *    made explicit for clarity).
 *  - autoIndex: false in production so index builds don't block startup.
 *    Run `mongoose.model.ensureIndexes()` in a one-off migration script instead.
 */
const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      // Disable auto-index creation in production to prevent startup slowdowns
      autoIndex: process.env.NODE_ENV !== 'production',
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Graceful shutdown: close the connection pool when the process exits
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed on app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
