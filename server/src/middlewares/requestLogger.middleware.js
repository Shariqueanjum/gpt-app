const crypto = require('crypto');
const pinoHttp = require('pino-http');
const { logger, ipLogFields } = require('../utils/logger');

// Not logged: health checks (uptime monitors hit them constantly) and long-lived SSE streams.
const isQuiet = (req) => {
  const path = (req.originalUrl || req.url || '').split('?')[0];
  return (
    path === '/' ||
    path === '/health' ||
    path === '/api' ||
    path === '/api/' ||
    path === '/api/health' ||
    path.endsWith('/stream')
  );
};

const requestLogger = pinoHttp({
  logger,

  // Every request gets a fresh ID, also sent back to the client as the X-Request-Id header.
  genReqId: (req, res) => {
    const id = crypto.randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },

  autoLogging: { ignore: isQuiet },

  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    // 401 (not logged in / wrong password) and 404 (not found) are routine noise: info, not warn.
    if (res.statusCode === 401 || res.statusCode === 404) return 'info';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  customSuccessMessage: () => 'http_request',
  customErrorMessage: () => 'http_request_failed',

  // Extra fields on every request line (ids only, never emails or tokens).
   customProps: (req, res) => {
    if (!res.writableEnded) return {};
    return {
      event: 'http_request',
      user_id: req.user?.id ?? null,
      admin_id: req.admin?.id ?? null
    };
  },

  // Only safe fields: path WITHOUT the query string (queries can hold tokens/signatures), hashed IP, no headers.
  serializers: {
    req: (req) => {
      const raw = req.raw || req; // pino-http hands us a wrapper; the Express request is in .raw
      return {
        id: req.id,
        method: req.method,
        path: (raw.originalUrl || req.url || '').split('?')[0],
        ...ipLogFields(raw) 
      };
    },
    res: (res) => ({ statusCode: res.statusCode })
  }
});

module.exports = requestLogger;
