const { body, param } = require('express-validator');

const upsertProfile = [
  body('carModel').trim().notEmpty().withMessage('carModel is required'),
  body('plateNumber').trim().notEmpty().withMessage('plateNumber is required'),
  body('seatsAvailable').isInt({ min: 1, max: 8 }).withMessage('seatsAvailable must be 1-8'),
];

const userIdParam = [param('userId').isMongoId().withMessage('userId must be a valid id')];

module.exports = { upsertProfile, userIdParam };
