const { body } = require('express-validator');

const recalculate = [
  body('fuelPricePerLiter')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('fuelPricePerLiter must be a positive number'),
];

module.exports = { recalculate };