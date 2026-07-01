import { Request, Response } from 'express';
import { PRODUCT_VARIANTS, ApiResponseEnvelope } from '@nama/shared';
import redisClient from '../infrastructure/redis/redis.client';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  variant: string;
  services: {
    database: string;
    redis: string;
  };
}

export async function getHealth(_req: Request, res: Response) {
  let redisStatus = 'unhealthy';
  try {
    if (redisClient.status !== 'ready') {
      await redisClient.connect();
    }
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      redisStatus = 'healthy';
    }
  } catch (err) {
    redisStatus = `unhealthy: ${err instanceof Error ? err.message : String(err)}`;
  }

  const healthData: HealthStatus = {
    status: redisStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    variant: PRODUCT_VARIANTS.EDPRO,
    services: {
      database: 'pending_setup',
      redis: redisStatus
    }
  };

  const response: ApiResponseEnvelope<HealthStatus> = {
    data: healthData
  };

  res.status(200).json(response);
}
