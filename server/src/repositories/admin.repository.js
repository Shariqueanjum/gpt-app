const pool = require('../config/db');

const findAdminByEmail = async (email) => {
  const res = await pool.query(
    'SELECT * FROM admin_users WHERE email = $1',
    [email]
  );
  return res.rows[0];
};

const findAdminByUsername = async (username) => {
  const res = await pool.query(
    'SELECT * FROM admin_users WHERE username = $1',
    [username]
  );
  return res.rows[0];
};

const findAdminByEmailOrUsername = async (email, username) => {
  const res = await pool.query(
    'SELECT id FROM admin_users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return res.rows[0];
};

const createAdmin = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const { username, email, password_hash, role } = data;

  const res = await executor.query(
    `INSERT INTO admin_users (username, email, password_hash, role)
     VALUES ($1,$2,$3,$4)
     RETURNING id, username, email, role, created_at`,
    [username, email, password_hash, role || 'admin']
  );
  return res.rows[0];
};

const updateAdminLastLogin = async (id) => {
  await pool.query(
    'UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );
};

module.exports = { findAdminByEmail, findAdminByUsername, findAdminByEmailOrUsername, createAdmin, updateAdminLastLogin };