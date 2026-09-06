require('express-async-errors'); // must be required before routes
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

const app = express();

// A Vercel Function imports this file instead of running src/server.js. Start
// shared service connections once per warm function instance and wait for them
// before handling a request.
const servicesReady = Promise.all([connectDB(), connectRedis()]);
servicesReady.catch((err) => console.error('Failed to initialize backend services:', err));

app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include health checks and server-to-server calls.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(async (req, res, next) => {
  try {
    await servicesReady;
    next();
  } catch (err) {
    next(err);
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const basePath = process.env.API_BASE_PATH || '/api/v1';
app.use(basePath, routes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'CarpoolCampus API is running.' });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
