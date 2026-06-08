const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, public_id: user.public_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d'}
  );
};


const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};


const generateAdminToken = (admin) => {
  return jwt.sign(
    { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const verifyAdminToken = (token) => {
  return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
};

module.exports = { generateToken, verifyToken, generateAdminToken, verifyAdminToken };