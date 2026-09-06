const { param } = require('express-validator');

const matchIdParam = [param('matchId').isMongoId().withMessage('matchId must be a valid id')];

module.exports = { matchIdParam };
