const pool = require('../config/db');

const getSettingByKey = async (key) => {
  const res = await pool.query(
    'SELECT value FROM settings WHERE key = $1',
    [key]
  );
  return res.rows[0]?.value || null;
};

const upsertSetting = async (clientOrPool, key, value) => {
  const executor = clientOrPool || pool;
  await executor.query(
    `INSERT INTO settings (key, value) 
     VALUES ($1, $2)
     ON CONFLICT (key) 
     DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
    [key, value]
  );
};

const getAllSettings = async () => {
  const res = await pool.query(
    'SELECT key, value FROM settings ORDER BY key'
  );
  return res.rows;
};

module.exports = { getSettingByKey, upsertSetting, getAllSettings };