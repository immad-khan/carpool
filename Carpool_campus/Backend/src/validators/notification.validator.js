const { param, query } = require('express-validator');

const notificationIdParam = [
  param('notificationId').isMongoId().withMessage('notificationId must be a valid id'),
];

const listMine = [query('unread').optional().isBoolean().withMessage('unread must be a boolean')];

module.exports = { notificationIdParam, listMine };