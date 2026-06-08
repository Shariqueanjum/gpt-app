const { verifyAdminToken } = require('../utils/jwt');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No admin token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAdminToken(token);

    req.admin = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

module.exports = adminAuthMiddleware;