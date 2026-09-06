const { body, query } = require('express-validator');

const sendRequest = [
  body('message').optional().trim().isString().withMessage('message must be a string'),
];

const decline = [
  body('reason').optional().trim().isString().withMessage('reason must be a string'),
];

const listIncoming = [
  query('status')
    .optional()
    .isIn(['requested', 'approved', 'declined'])
    .withMessage('status must be one of requested, approved, declined'),
];

module.exports = { sendRequest, decline, listIncoming };