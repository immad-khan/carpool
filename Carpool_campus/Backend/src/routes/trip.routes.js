const express = require('express');
const controller = require('../controllers/trip.controller');
const costSplitController = require('../controllers/costSplit.controller');
const safetyController = require('../controllers/safety.controller');
const validate = require('../middleware/validate');
const v = require('../validators/trip.validator');
const csV = require('../validators/costSplit.validator');
const safetyV = require('../validators/safety.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', v.listMine, validate, controller.listMine);
router.get('/:tripId', v.tripIdParam, validate, controller.getById);
router.post('/:tripId/status-ping', v.tripIdParam, v.statusPing, validate, controller.statusPing);
router.patch('/:tripId/complete', v.tripIdParam, validate, controller.completeTrip);
router.patch('/:tripId/cancel', v.tripIdParam, v.cancelTrip, validate, controller.cancelTrip);

// Module 11 - Cost-Split, nested under Trips per API.md §11
router.get('/:tripId/cost-split', v.tripIdParam, validate, costSplitController.getCostSplit);
router.post(
  '/:tripId/cost-split/recalculate',
  v.tripIdParam,
  csV.recalculate,
  validate,
  costSplitController.recalculate
);

// Module 15 - Safety, nested under Trips per API.md §15
router.post(
  '/:tripId/share-status',
  v.tripIdParam,
  safetyV.shareStatus,
  validate,
  safetyController.shareStatus
);

module.exports = router;