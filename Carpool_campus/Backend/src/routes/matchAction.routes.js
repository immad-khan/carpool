const express = require('express');
const controller = require('../controllers/rideRequest.controller');
const validate = require('../middleware/validate');
const v = require('../validators/rideRequest.validator');
const matchValidator = require('../validators/match.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/:matchId/request', matchValidator.matchIdParam, v.sendRequest, validate, controller.sendRequest);
router.patch('/:matchId/approve', matchValidator.matchIdParam, validate, controller.approve);
router.patch('/:matchId/decline', matchValidator.matchIdParam, v.decline, validate, controller.decline);

module.exports = router;