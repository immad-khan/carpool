const Redis = require('ioredis');

let client;
let connectionPromise;

async function connectRedis() {
  if (client && client.status === 'ready') return client;
  if (connectionPromise) return connectionPromise;

  client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { lazyConnect: true });

  client.on('connect', () => console.log('Redis connected'));
  client.on('error', (err) => console.error('Redis error:', err));

  connectionPromise = client.connect()
    .then(() => client)
    .catch((err) => {
      connectionPromise = undefined;
      client.disconnect();
      client = undefined;
      throw err;
    });

  return connectionPromise;
}

function getRedis() {
  if (!client) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return client;
}

module.exports = { connectRedis, getRedis };
