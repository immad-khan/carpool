const { param, query, body } = require('express-validator');

const tripIdParam = [param('tripId').isMongoId().withMessage('tripId must be a valid id')];

const listMine = [
  query('status').optional().isIn(['upcoming', 'completed', 'cancelled']).withMessage('invalid status'),
  query('from').optional().isISO8601().withMessage('from must be an ISO 8601 date'),
  query('to').optional().isISO8601().withMessage('to must be an ISO 8601 date'),
];

// Note: API.md's example only shows "on_the_way" and doesn't define a fixed enum,
// so this validates presence/type rather than a specific closed set of values.
const statusPing = [
  body('status').trim().notEmpty().withMessage('status is required'),
  body('etaMinutes').optional().isInt({ min: 0 }).withMessage('etaMinutes must be a non-negative integer'),
];

const cancelTrip = [
  body('reason').optional().trim().isString().withMessage('reason must be a string'),
];

module.exports = { tripIdParam, listMine, statusPing, cancelTrip };