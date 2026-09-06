const { body, param } = require('express-validator');

const submit = [
  body('tripId').isMongoId().withMessage('tripId must be a valid id'),
  body('toUserId').isMongoId().withMessage('toUserId must be a valid id'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('score must be an integer between 1 and 5'),
  body('comment').optional().trim().isString().withMessage('comment must be a string'),
];

const userIdParam = [param('userId').isMongoId().withMessage('userId must be a valid id')];

module.exports = { submit, userIdParam };