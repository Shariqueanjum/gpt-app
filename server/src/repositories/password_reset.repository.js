const pool = require('../config/db');

const createPasswordReset = async (clientOrPool, { email, token, expires_at }) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `INSERT INTO password_resets (email, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, token, expires_at]
  );
  return res.rows[0];
};

const findPasswordResetByToken = async (token) => {
  const res = await pool.query(
    `SELECT * FROM password_resets 
     WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL`,
    [token]
  );
  return res.rows[0];
};

const markPasswordResetUsed = async (clientOrPool, token) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `UPDATE password_resets 
     SET used_at = CURRENT_TIMESTAMP
     WHERE token = $1
     RETURNING *`,
    [token]
  );
  return res.rows[0];
};

const deleteOldPasswordResets = async (email) => {
  await pool.query(
    `DELETE FROM password_resets WHERE email = $1`,
    [email]
  );
};

module.exports = {
  createPasswordReset,
  findPasswordResetByToken,
  markPasswordResetUsed,
  deleteOldPasswordResets
};