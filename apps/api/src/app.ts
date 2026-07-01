import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import logger from './infrastructure/logger/logger';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

// Structured request logging
app.use(pinoHttp({
  logger,
  genReqId: (req) => req.id || 'anonymous',
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'x-active-role': req.headers['x-active-role']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
}));

app.use('/api/v1', router);

app.use(errorHandler);

export default app;
