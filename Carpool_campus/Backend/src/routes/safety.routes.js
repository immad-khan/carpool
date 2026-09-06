const express = require('express');
const controller = require('../controllers/safety.controller');
const validate = require('../middleware/validate');
const v = require('../validators/safety.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/reports', v.submitReport, validate, controller.submitReport);

module.exports = router;