require('dotenv').config();

const { logger } = require('./src/utils/logger');
const app = require('./src/app');
const createTables = require('./src/config/migrations');
const { startMetricsServer } = require('./src/utils/metrics');

// Same behaviour as before (the process exits and PM2 restarts it) - but the reason is now written to the logs first.
process.on('uncaughtException', (err) => {
  logger.fatal({ event: 'uncaught_exception', err }, 'Uncaught exception - exiting');
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ event: 'unhandled_rejection', err: reason instanceof Error ? reason : new Error(String(reason)) }, 'Unhandled promise rejection - exiting');
  process.exit(1);
});

createTables();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info({ event: 'server_started', port: Number(PORT), node: process.version, env: process.env.NODE_ENV || 'unset' }, `Server running on port ${PORT}`);
});

// Prometheus numbers on a separate private port; does nothing unless METRICS_PORT is set in .env
startMetricsServer();