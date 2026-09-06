const express = require('express');
const controller = require('../controllers/notification.controller');
const validate = require('../middleware/validate');
const v = require('../validators/notification.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', v.listMine, validate, controller.listMine);
router.patch('/read-all', controller.markAllRead);
router.patch('/:notificationId/read', v.notificationIdParam, validate, controller.markRead);

module.exports = router;