const express = require('express');
const controller = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const v = require('../validators/admin.validator');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/users', v.listUsers, validate, controller.listUsers);
router.patch('/users/:userId/verify', v.userIdParam, validate, controller.verifyUser);
router.patch('/users/:userId/status', v.userIdParam, v.setStatus, validate, controller.setUserStatus);
router.get('/reports', v.listReports, validate, controller.listReports);
router.patch(
  '/reports/:reportId/resolve',
  v.reportIdParam,
  v.resolveReport,
  validate,
  controller.resolveReport
);
router.get('/analytics/overview', controller.analyticsOverview);

module.exports = router;