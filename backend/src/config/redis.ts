import { createClient } from 'redis';
import env from './env';

// Create Redis client
const redis = createClient({
  url: env.REDIS_URL,
});

// Handle Redis events
redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
redis.on('connect', () => console.log('✅ Redis Client Connected'));
redis.on('ready', () => console.log('✅ Redis Client Ready'));
redis.on('end', () => console.log('Redis Client Connection Ended'));

// Test Redis connection
async function testConnection() {
  try {
    await redis.connect();
    await redis.ping();
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  }
}

export { redis, testConnection }; 