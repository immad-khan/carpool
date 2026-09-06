require('express-async-errors'); // must be required before routes
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
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
