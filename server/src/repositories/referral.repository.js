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

 // Referral list with per-referral earnings
  // Join users with transactions to sum how much YOU earned from EACH referred user
  const listRes = await pool.query(
    `SELECT 
       u.id,
       u.public_id,
       u.username,
       u.email,
       u.full_name,
       u.country,
       u.created_at,
       COALESCE(SUM(t.amount), 0) as earned_from_referral
     FROM users u
     LEFT JOIN transactions t 
       ON t.reference_id = u.id        -- t.reference_id = the referred user
       AND t.user_id = $1                -- t.user_id = YOU (the referrer)
       AND t.type = 'referral'
       AND t.status = 'completed'
     WHERE u.referred_by = $1
     GROUP BY u.id, u.public_id, u.username, u.email, u.full_name, u.country, u.created_at
     ORDER BY u.created_at DESC`,
    [userId]
  );

  return {
    total_referrals: countRes.rows[0].total_referrals,
    total_earned: parseFloat(earningsRes.rows[0].total_earned),
    referrals: listRes.rows.map(r => ({
      ...r,
     earned_from_referral: parseFloat(r.earned_from_referral)
    }))
  };
};

module.exports = { getReferralStats };