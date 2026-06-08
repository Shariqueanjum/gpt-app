const pool = require('../config/db');

const getUserStreak = async (userId) => {
  const res = await pool.query(
    `SELECT current_streak, last_active_date
     FROM users WHERE id = $1`,
    [userId]
  );
  return res.rows[0];
};

const lockUserStreak = async (client, userId) => {
  const res = await client.query(
    `SELECT current_streak, last_active_date, balance_available
     FROM users WHERE id = $1 FOR UPDATE`,
    [userId]
  );
  return res.rows[0];
};

const updateStreak = async (clientOrPool, userId, newStreak, date) => {
  const executor = clientOrPool || pool;
  
  const res = await executor.query(
    `UPDATE users 
     SET current_streak = $1,
         last_active_date = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING current_streak, last_active_date`,
    [newStreak, date, userId]
  );
  return res.rows[0];
};

module.exports = { getUserStreak, lockUserStreak, updateStreak };