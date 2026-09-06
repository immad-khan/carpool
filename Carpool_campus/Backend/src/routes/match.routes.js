const express = require('express');
const controller = require('../controllers/match.controller');
const validate = require('../middleware/validate');
const v = require('../validators/match.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/:matchId', v.matchIdParam, validate, controller.getById);

module.exports = router;
