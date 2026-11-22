const { Pool } = require('pg');
require('dotenv').config();
const { logger } = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  logger.debug({ event: 'db_connect' }, 'Connected to PostgreSQL');
});

pool.on('error', (err) => {
  logger.fatal({ event: 'db_pool_error', err }, 'PostgreSQL pool error - exiting so PM2 restarts the app');
  process.exit(-1);
});

module.exports = pool;