const pool = require('../config/db');

const executeQuery = async (sql, values) => {
  const res = await pool.query(sql, values);
  return res.rows;
};

const executeCount = async (sql, values) => {
  const res = await pool.query(sql, values);
  return res.rows[0].total;
};

const createLoginHistory = async (clientOrPool, { user_id, ip_address, user_agent, device_fingerprint, status }) => {
  const executor = clientOrPool || pool;
  
  await executor.query(
    `INSERT INTO login_history 
    (user_id, ip_address, user_agent, device_fingerprint, status)
    VALUES ($1,$2,$3,$4,$5)`,
    [user_id, ip_address, user_agent, device_fingerprint, status]
  );
};

module.exports = { executeCount, executeQuery, createLoginHistory};