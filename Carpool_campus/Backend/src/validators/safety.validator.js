const { body } = require('express-validator');

const submitReport = [
  body('reportedUserId').isMongoId().withMessage('reportedUserId must be a valid id'),
  body('tripId').optional().isMongoId().withMessage('tripId must be a valid id'),
  body('reason').trim().notEmpty().withMessage('reason is required'),
];

const shareStatus = [
  body('emergencyContactId').isMongoId().withMessage('emergencyContactId must be a valid id'),
];

module.exports = { submitReport, shareStatus };