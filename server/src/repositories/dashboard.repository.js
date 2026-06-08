const pool = require('../config/db');

const getUserBalances = async (userId) => {
  const res = await pool.query(
    `SELECT 
      public_id, username, email, country, 
      referral_code, profile_completion,
      balance_available, balance_locked, balance_denied
     FROM users 
     WHERE id = $1`,
    [userId]
  );
  return res.rows[0];
};

const getTransactionStats = async (userId) => {
  const res = await pool.query(
    `SELECT 
      COALESCE(SUM(CASE WHEN amount > 0 AND status IN ('completed', 'locked') AND type != 'withdrawal' THEN amount ELSE 0 END), 0) as total_earned,
      COALESCE(SUM(CASE WHEN type = 'reversal' THEN ABS(amount) ELSE 0 END), 0) as total_reversed,
      COALESCE(SUM(CASE WHEN type = 'referral' AND status IN ('completed', 'locked') THEN amount ELSE 0 END), 0) as referral_earnings
     FROM transactions 
     WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0];
};

const getTotalWithdrawn = async (userId) => {
  const res = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total_withdrawn
     FROM withdrawals 
     WHERE user_id = $1 AND status = 'paid'`,
    [userId]
  );
  return res.rows[0].total_withdrawn;
};

const getTotalSurveysCompleted = async (userId) => {
  const res = await pool.query(
    `SELECT COUNT(*)::int as total_surveys
     FROM survey_clicks 
     WHERE user_id = $1 AND status = 'completed'`,
    [userId]
  );
  return parseInt(res.rows[0].total_surveys);
};

const getTotalReferrals = async (userId) => {
  const res = await pool.query(
    `SELECT COUNT(*)::int as total_referrals
     FROM users 
     WHERE referred_by = $1`,
    [userId]
  );
  return parseInt(res.rows[0].total_referrals);
};

module.exports = { getUserBalances, getTransactionStats, getTotalWithdrawn, getTotalSurveysCompleted, getTotalReferrals };