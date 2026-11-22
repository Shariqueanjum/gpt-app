const { logger } = require('../utils/logger');

// Short, stable codes the frontend / support can quote. Never contains internal details.
const STATUS_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED'
};

const errorCodeFor = (err, status) => {
  if (err.errorCode && typeof err.errorCode === 'string') return err.errorCode; // set deliberately in code
  if (err.type === 'entity.parse.failed') return 'INVALID_JSON';
  return STATUS_CODES[status] || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const isDev = process.env.NODE_ENV === 'development';
  const status = err.status || err.statusCode || 500;
  const errorCode = errorCodeFor(err, status);
  const log = req.log || logger;

  // Full detail goes to the logs only. Stack trace is included for server faults (5xx).
  // Request body is deliberately NOT logged (may contain passwords).
  const fields = {
    event: status >= 500 ? 'unhandled_error' : 'request_error',
    status,
    error_code: errorCode,
    method: req.method,
    path: (req.originalUrl || '').split('?')[0],
    user_id: req.user?.id ?? null,
    admin_id: req.admin?.id ?? null
  };

  try {
    if (status >= 500) {
      log.error({ ...fields, err }, err.message || 'Internal server error');
    } else {
      log.warn({ ...fields, err_message: err.message }, err.message || 'Request error');
    }
  } catch (_) { /* logging must never break the error response */ }

  // What the user sees: clean message, short code, request id for support. Same fields as before + two new ones.
  const message =
    status >= 500 ? 'Internal server error' :
    err.type === 'entity.parse.failed' ? 'Invalid JSON in request body' :
    err.message;

    const response = {
    success: false,
    message,
    code: status,
    error_code: errorCode,
    request_id: req.id || null
  };

   // Local development only: show the stack in the response (never in production)
  if (isDev) {
    response.stack = err.stack;
    response.debug = { name: err.name };
  }

  res.status(status).json(response);
};

module.exports = errorHandler;