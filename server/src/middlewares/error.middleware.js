const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const status = err.status || 500;

  // Console: Always show full details for you
  console.error(`[ERROR] ${status} | ${req.method} ${req.originalUrl} | ${err.message}`);
  if (isDev) {
    console.error(err.stack);
  }

  // Response to frontend
  const response = {
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message,
    code: status
  };

  // Development only: Add debug info
  if (isDev) {
    response.stack = err.stack;
    response.debug = {
      name: err.name,
      body: req.body
    };
  }

  res.status(status).json(response);
};

module.exports = errorHandler;