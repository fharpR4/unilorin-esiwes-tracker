const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let retryCount = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    retryCount = 0;

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      reconnect();
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    reconnect();
  }
};

const reconnect = () => {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`Reconnect attempt ${retryCount}/${MAX_RETRIES} in ${RETRY_INTERVAL_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_INTERVAL_MS);
  } else {
    console.error('Max MongoDB reconnection attempts reached. Shutting down.');
    process.exit(1);
  }
};

module.exports = connectDB;