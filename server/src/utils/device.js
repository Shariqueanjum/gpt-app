const crypto = require('crypto');

const generateDeviceFingerprint = (req) => {
  const data = [
    req.ip,
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || ''
  ].join('|');

  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = { generateDeviceFingerprint };