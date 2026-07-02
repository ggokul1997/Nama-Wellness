import { Queue } from 'bullmq';
import logger from '../logger/logger';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export const connection = {
  host: redisHost,
  port: redisPort
};

export const pdfGenerationQueue = new Queue('pdf-generation', { connection });
export const emailNotificationQueue = new Queue('email-notification', { connection });
export const payoutCalculationQueue = new Queue('monthly-payout', { connection });
export const aiReportsQueue = new Queue('ai-reports', { connection });

logger.info('BullMQ Queues initialized.');
export default pdfGenerationQueue;
