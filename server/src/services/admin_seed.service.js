const bcrypt = require('bcryptjs');
const { createAdmin, findAdminByEmailOrUsername } = require('../repositories/admin.repository');

const DEFAULT_ADMIN = {
  username: 'sharique',
  email: 'admin@wabcash.com',
  password: 'Admin@1234',
  role: 'super_admin'
};

const seedAdmin = async (customData = null) => {
  // Merge custom data with defaults, ensuring password always exists
  const data = {
    ...DEFAULT_ADMIN,
    ...(customData || {})
  };

  // Validate required fields
  if (!data.password) {
    const error = new Error('Password is required');
    error.status = 400;
    throw error;
  }

  const existing = await findAdminByEmailOrUsername(data.email, data.username);
  
  if (existing) {
    return { 
      message: 'Admin already exists. Skipping seed.',
      already_exists: true 
    };
  }

  const password_hash = await bcrypt.hash(data.password, 10);
  
  const admin = await createAdmin(null, {
    username: data.username,
    email: data.email,
    password_hash,
    role: data.role
  });

  return {
    message: 'Admin created successfully',
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    },
    warning: 'Please change the default password after first login'
  };
};

module.exports = { seedAdmin };