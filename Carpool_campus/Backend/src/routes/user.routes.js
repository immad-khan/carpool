const express = require('express');
const controller = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const v = require('../validators/user.validator');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.get('/me', controller.getMe);
router.patch('/me', v.updateMe, validate, controller.updateMe);
router.put('/me/profile-picture', upload.single('image'), controller.updateProfilePicture);
router.delete('/me', controller.deleteMe);
router.get('/:userId', v.userIdParam, validate, controller.getById);

module.exports = router;
