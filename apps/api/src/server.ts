import app from './app';
import './infrastructure/queue/worker';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[Server] Express API server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('[Server] Process terminated.');
    process.exit(0);
  });
});

export default server;
