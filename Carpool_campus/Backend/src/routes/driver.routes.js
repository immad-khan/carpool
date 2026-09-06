const express = require('express');
const controller = require('../controllers/driver.controller');
const validate = require('../middleware/validate');
const v = require('../validators/driver.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.put('/me', v.upsertProfile, validate, controller.upsertMyProfile);
router.get('/:userId', v.userIdParam, validate, controller.getByUserId);

module.exports = router;
