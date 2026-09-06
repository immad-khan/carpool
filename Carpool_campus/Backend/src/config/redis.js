const Redis = require('ioredis');

let client;

async function connectRedis() {
  client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

  client.on('connect', () => console.log('Redis connected'));
  client.on('error', (err) => console.error('Redis error:', err));

  return client;
}

function getRedis() {
  if (!client) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return client;
}

module.exports = { connectRedis, getRedis };
