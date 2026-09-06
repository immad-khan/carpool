const express = require('express');
const controller = require('../controllers/emergencyContact.controller');
const validate = require('../middleware/validate');
const v = require('../validators/emergencyContact.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', v.create, validate, controller.create);
router.patch('/:contactId', v.contactIdParam, v.update, validate, controller.update);
router.delete('/:contactId', v.contactIdParam, validate, controller.remove);

module.exports = router;
