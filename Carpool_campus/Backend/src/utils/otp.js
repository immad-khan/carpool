const crypto = require('crypto');
const { getRedis } = require('../config/redis');

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function otpKey(purpose, email) {
  return `otp:${purpose}:${email.toLowerCase()}`;
}

function resendCooldownKey(purpose, email) {
  return `otp:cooldown:${purpose}:${email.toLowerCase()}`;
}

async function storeOtp(purpose, email, otp) {
  const redis = getRedis();
  const ttl = Number(process.env.OTP_TTL_SECONDS) || 600;
  await redis.set(otpKey(purpose, email), otp, 'EX', ttl);
}

async function getOtp(purpose, email) {
  const redis = getRedis();
  return redis.get(otpKey(purpose, email));
}

async function clearOtp(purpose, email) {
  const redis = getRedis();
  await redis.del(otpKey(purpose, email));
}

async function isInResendCooldown(purpose, email) {
  const redis = getRedis();
  const exists = await redis.exists(resendCooldownKey(purpose, email));
  return exists === 1;
}

async function setResendCooldown(purpose, email) {
  const redis = getRedis();
  const cooldown = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
  await redis.set(resendCooldownKey(purpose, email), '1', 'EX', cooldown);
}

module.exports = {
  generateOtp,
  storeOtp,
  getOtp,
  clearOtp,
  isInResendCooldown,
  setResendCooldown,
};
