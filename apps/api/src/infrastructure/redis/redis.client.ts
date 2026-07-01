import Redis from 'ioredis';
import logger from '../logger/logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
});

redisClient.on('connect', () => {
  logger.info({ REDIS_HOST, REDIS_PORT }, 'Connecting to Redis...');
});

redisClient.on('ready', () => {
  logger.info('Redis client is ready and connected.');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redisClient.on('end', () => {
  logger.warn('Redis client connection closed.');
});

export default redisClient;
