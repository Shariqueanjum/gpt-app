const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, try later'
  }
});

// Money-moving admin actions (unlock / undo): a mis-click storm or a stolen
// token can't hammer balances. Keyed per admin when known, else per IP.
const adminMoneyActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.admin?.id ? `admin-${req.admin.id}` : req.ip),
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: 'Too many balance actions, wait a minute and try again'
  }
});

module.exports = { globalLimiter, adminMoneyActionLimiter};