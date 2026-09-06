const mongoose = require('mongoose');

let connectionPromise;
let hasErrorListener = false;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set in .env');

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);
  connectionPromise = mongoose.connect(uri)
    .then(() => {
      console.log('MongoDB connected');
      return mongoose.connection;
    })
    .catch((err) => {
      connectionPromise = undefined;
      throw err;
    });

  if (!hasErrorListener) {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    hasErrorListener = true;
  }

  return connectionPromise;
}

module.exports = connectDB;
