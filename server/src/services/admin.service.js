const bcrypt = require('bcryptjs');
const { findAdminByEmail, updateAdminLastLogin } = require('../repositories/admin.repository');
const { generateAdminToken } = require('../utils/jwt');

const loginAdmin = async (payload) => {
  let { email, password } = payload;
  email = email.toLowerCase().trim();

  const admin = await findAdminByEmail(email);
  
  if (!admin) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  await updateAdminLastLogin(admin.id);

  const token = generateAdminToken(admin);

  const safeAdmin = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role
  };

  return { admin: safeAdmin, token };
};

module.exports = { loginAdmin };