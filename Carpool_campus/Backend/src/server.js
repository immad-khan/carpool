require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`CarpoolCampus API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
