/**
 * MOCK DATA STORE
 * Central in-memory store used by all mock controllers.
 * Because Vercel is stateless across cold starts, data won't persist between
 * deployments / cold starts — but it works within a single warm instance.
 */

const { v4: uuidv4 } = (() => {
  // Tiny UUID-like generator without external deps
  const gen = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return { v4: gen };
})();

const id = () => uuidv4();

const users = new Map(); // email -> user object
const routes = new Map(); // routeId -> route object
const matches = new Map(); // matchId -> match object
const trips = new Map(); // tripId -> trip object
const emergencyContacts = new Map(); // contactId -> contact
const notifications = new Map(); // notifId -> notif
const ratings = new Map(); // ratingId -> rating
const safetyReports = new Map(); // reportId -> report

// Seed one default test user so login always works
const MOCK_USER_ID = 'mock-user-001';
const MOCK_USER = {
  id: MOCK_USER_ID,
  _id: MOCK_USER_ID,
  name: 'Test User',
  email: 'test@gcu.edu.pk',
  roles: ['rider'],
  verified: true,
  status: 'active',
  rating: 4.8,
  profilePictureUrl: null,
  toPublicJSON() {
    return { id: this.id, name: this.name, email: this.email, roles: this.roles, verified: this.verified, rating: this.rating, profilePictureUrl: this.profilePictureUrl };
  },
  toLimitedPublicJSON() {
    return { id: this.id, name: this.name, rating: this.rating, profilePictureUrl: this.profilePictureUrl };
  },
  hasCapability: (r) => true,
  isAdmin: () => false,
  save: async function() { return this; },
};

module.exports = { id, users, routes, matches, trips, emergencyContacts, notifications, ratings, safetyReports, MOCK_USER_ID, MOCK_USER };
