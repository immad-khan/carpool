const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const driverRoutes = require('./driver.routes');
const emergencyContactRoutes = require('./emergencyContact.routes');
const routeRoutes = require('./route.routes');
const matchRoutes = require('./match.routes');
const matchActionRoutes = require('./matchAction.routes');
const rideRequestRoutes = require('./rideRequest.routes');
const tripRoutes = require('./trip.routes');
const ratingRoutes = require('./rating.routes');
const userRatingRoutes = require('./userRating.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const safetyRoutes = require('./safety.routes');

const router = express.Router();

// Modules 3-8 per API.md (built by Microponder)
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/drivers', driverRoutes);
router.use('/emergency-contacts', emergencyContactRoutes);
router.use('/routes', routeRoutes);
router.use('/matches', matchRoutes);

// Module 9 - Ride Requests
router.use('/matches', matchActionRoutes);
router.use('/requests', rideRequestRoutes);

// Module 10 - Trips
router.use('/trips', tripRoutes);

// Module 12 - Ratings
router.use('/ratings', ratingRoutes);
router.use('/users', userRatingRoutes);

// Module 13 - Notifications
router.use('/notifications', notificationRoutes);

// Module 14 - Admin
router.use('/admin', adminRoutes);

// Module 15 - Safety (Stretch)
router.use('/safety', safetyRoutes);

module.exports = router;