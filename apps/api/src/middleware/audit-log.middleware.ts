import { Request, Response, NextFunction } from 'express';
import prisma from '../infrastructure/database/prisma.client';
import logger from '../infrastructure/logger/logger';

export function auditLogMiddleware(action: string, entityType: string, getEntityId?: (req: Request) => string | undefined) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function (body: any) {
      res.json = originalJson;
      const response = res.json(body);

      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const actorId = req.user.userId;
        const ipAddress = req.ip || req.socket.remoteAddress || null;
        const userAgent = req.headers['user-agent'] || null;
        
        let entityId = getEntityId ? getEntityId(req) : undefined;
        if (!entityId && body?.data?.id) {
          entityId = body.data.id;
        }

        const resolvedEntityId = entityId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(entityId)
          ? entityId
          : '00000000-0000-0000-0000-000000000000';

        prisma.auditLog.create({
          data: {
            actorId,
            action,
            entityType,
            entityId: resolvedEntityId,
            ipAddress,
            userAgent,
            metadata: {
              method: req.method,
              url: req.originalUrl,
              body: req.body,
              query: req.query
            }
          }
        }).catch(err => {
          logger.error({ err }, 'Failed to persist audit log entry.');
        });
      }

      return response;
    };

    next();
  };
}
