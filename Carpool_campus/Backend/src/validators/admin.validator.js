const { param, query, body } = require('express-validator');

const userIdParam = [param('userId').isMongoId().withMessage('userId must be a valid id')];
const reportIdParam = [param('reportId').isMongoId().withMessage('reportId must be a valid id')];

const listUsers = [
  query('verified').optional().isBoolean().withMessage('verified must be a boolean'),
  query('role').optional().isIn(['driver', 'rider', 'admin']).withMessage('invalid role'),
];

const setStatus = [
  body('status').isIn(['active', 'suspended']).withMessage('status must be active or suspended'),
  body('reason').optional().trim().isString().withMessage('reason must be a string'),
];

const listReports = [
  query('status')
    .optional()
    .isIn(['open', 'reviewing', 'resolved', 'dismissed'])
    .withMessage('invalid status'),
];

const resolveReport = [
  body('resolution')
    .isIn(['resolved', 'dismissed'])
    .withMessage('resolution must be resolved or dismissed'),
  body('notes').optional().trim().isString().withMessage('notes must be a string'),
];

module.exports = { userIdParam, reportIdParam, listUsers, setStatus, listReports, resolveReport };