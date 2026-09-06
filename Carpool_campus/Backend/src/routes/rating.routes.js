const express = require('express');
const controller = require('../controllers/rating.controller');
const validate = require('../middleware/validate');
const v = require('../validators/rating.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', v.submit, validate, controller.submit);

module.exports = router;