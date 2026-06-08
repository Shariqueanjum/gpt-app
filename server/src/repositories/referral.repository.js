const pool = require('../config/db');

const getReferralStats = async (userId) => {
  // Total referrals count
  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total_referrals
     FROM users WHERE referred_by = $1`,
    [userId]
  );

  // Total earnings from referrals
  const earningsRes = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total_earned
     FROM transactions 
     WHERE user_id = $1 AND type = 'referral' AND status = 'completed'`,
    [userId]
  );

  // Referral list with basic info
  const listRes = await pool.query(
    `SELECT id, public_id, username, email, full_name, country, 
            balance_available, created_at
     FROM users 
     WHERE referred_by = $1 
     ORDER BY created_at DESC`,
    [userId]
  );

  return {
    total_referrals: countRes.rows[0].total_referrals,
    total_earned: parseFloat(earningsRes.rows[0].total_earned),
    referrals: listRes.rows.map(r => ({
      ...r,
      balance_available: parseFloat(r.balance_available)
    }))
  };
};

module.exports = { getReferralStats };