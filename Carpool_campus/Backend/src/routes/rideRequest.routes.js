const express = require('express');
const controller = require('../controllers/rideRequest.controller');
const validate = require('../middleware/validate');
const v = require('../validators/rideRequest.validator');
const { authenticate, requireCapability } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', requireCapability('driver'), v.listIncoming, validate, controller.listIncoming);

module.exports = router;