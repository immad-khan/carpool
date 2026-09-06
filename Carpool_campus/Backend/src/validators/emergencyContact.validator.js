const { body, param } = require('express-validator');

const create = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('phone').trim().notEmpty().withMessage('phone is required'),
];

const update = [
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('phone cannot be empty'),
];

const contactIdParam = [param('contactId').isMongoId().withMessage('contactId must be a valid id')];

module.exports = { create, update, contactIdParam };
