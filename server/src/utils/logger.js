const pino = require('pino');
const crypto = require('crypto');

// Salted hash of an IP so logs can still group by "same visitor" without storing the real IP.
// Set LOG_IP_SALT in the server .env. If it is missing a built-in fallback is used (app still works).
const IP_SALT = process.env.LOG_IP_SALT || 'pickopinion-default-salt-change-me';

const hashIp = (ip) => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(IP_SALT + String(ip)).digest('hex').slice(0, 12);
};

// "john.doe@gmail.com" -> "j***@gmail.com"
const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return null;
  const [name, domain] = email.split('@');
  return `${name.slice(0, 1)}***@${domain}`;
};

// Anything matching these keys is replaced with [REDACTED] in every log line.
const REDACT_KEYS = [
  'password', 'newPassword', 'oldPassword', 'currentPassword', 'confirmPassword',
  'token', 'accessToken', 'refreshToken', 'otp', 'api_key', 'apiKey',
  'secret', 'hash_key', 'signature', 'authorization', 'cookie', 'email'
];

const redact = {
  paths: [
    ...REDACT_KEYS,
    ...REDACT_KEYS.map((k) => `*.${k}`),
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]'
  ],
  censor: '[REDACTED]'
};

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'gpt-app' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  },
  redact,
  serializers: {
    err: pino.stdSerializers.err
  }
});

module.exports = { logger, hashIp, maskEmail };
