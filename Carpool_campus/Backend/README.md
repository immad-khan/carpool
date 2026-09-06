# CarpoolCampus Backend — Modules 1–6

Implements the Auth, Users & Profiles, Driver Profile, Emergency Contacts, Routes, and Matching
modules from `API.md` (v1.0 draft).

## Stack
- Node.js / Express
- MongoDB (Mongoose)
- Redis (ioredis) — refresh-token allow-list, OTP storage, resend cooldowns, rate limiting
- Cloudinary — profile picture uploads
- Nodemailer (Google SMTP) — OTP emails

## Setup

```bash
npm install
cp .env.example .env
# edit .env: MONGO_URI, REDIS_URL, JWT secrets, SMTP_*, CLOUDINARY_*
```

You need a running MongoDB and Redis instance. Locally, e.g.:

```bash
# MongoDB (if not already running)
mongod --dbpath ./data/db &

# Redis (if not already running)
redis-server &
```

## Run

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

Server listens on `http://localhost:5000`, API mounted at `/api/v1` (matches `API.md` §1.1).

## Create an admin user (for the Admin module, added later)

```bash
npm run seed:admin -- "Admin Name" admin@campus.edu "StrongPass123!"
```

## Project layout

```
src/
  server.js            entrypoint: connects DB/Redis, starts listener
  app.js               express app, middleware, route mounting
  config/              db.js, redis.js, cloudinary.js, mailer.js
  models/              User, DriverProfile, EmergencyContact, Route, Match
  middleware/          auth.js (JWT), errorHandler.js, upload.js (multer/cloudinary),
                        rateLimiters.js, validate.js
  validators/          express-validator chains per module
  controllers/          business logic per module
  routes/              express routers per module + index.js mounting them
  utils/               ApiError, apiResponse, jwt, otp, pagination, matching (overlap engine)
  scripts/             createAdmin.js
```

## Notes on TBD items (per API.md §16)
- Password rules: currently min 8 chars — tune in `validators/auth.validator.js`.
- Campus email domains: set `APPROVED_EMAIL_DOMAINS` in `.env` (comma-separated). Empty = no restriction.
- JWT lifetimes: `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` in `.env`.
- Matching algorithm: heuristic in `utils/matching.js` (weighted origin/destination proximity,
  time proximity, day-of-week overlap). Swap out freely — it's isolated to one file.
- Rate limits: coarse IP-based limiter in `middleware/rateLimiters.js` (`loginLimiter`, `otpLimiter`).
- Profile picture size/type limits: 5MB, jpg/png — in `middleware/upload.js`.
- Account deletion policy: currently blocks (`409`) if the user has any `active` route.

## Endpoints implemented

**Auth** (`/api/v1/auth`): register, verify-email, resend-otp, login, refresh-token,
forgot-password, reset-password, logout

**Users** (`/api/v1/users`): GET me, GET :userId, PATCH me, PUT me/profile-picture, DELETE me

**Driver Profile** (`/api/v1/drivers`): PUT me (upsert), GET :userId

**Emergency Contacts** (`/api/v1/emergency-contacts`): GET, POST, PATCH :contactId, DELETE :contactId

**Routes** (`/api/v1/routes`): POST, GET me, GET :routeId, PATCH :routeId, POST :routeId/skip,
PATCH :routeId/status, DELETE :routeId

**Matching** (`/api/v1/matches`, mounted partly under `/routes`): GET :routeId/matches,
GET matches/:matchId

Modules 7+ (Ride Requests, Trips, Cost-Split, Ratings, Notifications, Admin, Safety) are not
included in this pass.
