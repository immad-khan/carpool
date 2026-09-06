const { body, param, query } = require('express-validator');
const Route = require('../models/Route');

const geoPoint = (field) => [
  body(`${field}.lat`).isFloat({ min: -90, max: 90 }).withMessage(`${field}.lat must be a valid latitude`),
  body(`${field}.lng`).isFloat({ min: -180, max: 180 }).withMessage(`${field}.lng must be a valid longitude`),
  body(`${field}.label`).trim().notEmpty().withMessage(`${field}.label is required`),
];

const createRoute = [
  body('role').isIn(['driver', 'rider']).withMessage('role must be driver or rider'),
  ...geoPoint('origin'),
  ...geoPoint('destination'),
  body('daysOfWeek')
    .isArray({ min: 1 })
    .withMessage('daysOfWeek must be a non-empty array')
    .custom((arr) => arr.every((d) => Route.DAYS.includes(d)))
    .withMessage('daysOfWeek must only contain mon..sun'),
  body('departureTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('departureTime must be HH:mm 24-hour'),
];

const updateRoute = [
  body('departureTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('departureTime must be HH:mm 24-hour'),
  body('daysOfWeek')
    .optional()
    .isArray({ min: 1 })
    .custom((arr) => arr.every((d) => Route.DAYS.includes(d)))
    .withMessage('daysOfWeek must only contain mon..sun'),
];

const routeIdParam = [param('routeId').isMongoId().withMessage('routeId must be a valid id')];

const skipDay = [body('date').isISO8601().withMessage('date must be an ISO 8601 date (YYYY-MM-DD)')];

const setStatus = [body('status').isIn(['active', 'paused', 'archived']).withMessage('invalid status')];

const listMyRoutes = [
  query('role').optional().isIn(['driver', 'rider']),
  query('status').optional().isIn(['active', 'paused', 'archived']),
];

const listMatches = [
  query('minOverlap').optional().isFloat({ min: 0, max: 1 }),
];

module.exports = { createRoute, updateRoute, routeIdParam, skipDay, setStatus, listMyRoutes, listMatches };
