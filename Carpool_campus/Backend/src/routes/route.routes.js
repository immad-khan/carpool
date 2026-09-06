const express = require('express');
const controller = require('../controllers/route.controller');
const matchController = require('../controllers/match.controller');
const validate = require('../middleware/validate');
const v = require('../validators/route.validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', v.createRoute, validate, controller.create);
router.get('/me', v.listMyRoutes, validate, controller.listMine);
router.get('/:routeId', v.routeIdParam, validate, controller.getById);
router.patch('/:routeId', v.routeIdParam, v.updateRoute, validate, controller.update);
router.post('/:routeId/skip', v.routeIdParam, v.skipDay, validate, controller.skipDay);
router.patch('/:routeId/status', v.routeIdParam, v.setStatus, validate, controller.setStatus);
router.delete('/:routeId', v.routeIdParam, validate, controller.remove);

// Matching module endpoint, mounted per API.md §8 (`/routes/:routeId/matches`)
router.get('/:routeId/matches', v.routeIdParam, v.listMatches, validate, controller.getMatchesForRoute);

module.exports = router;
