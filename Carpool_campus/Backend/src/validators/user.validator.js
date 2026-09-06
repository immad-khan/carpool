const { body, param } = require('express-validator');

const userIdParam = [param('userId').isMongoId().withMessage('userId must be a valid id')];

const updateMe = [
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
];

module.exports = { userIdParam, updateMe };
