const pool = require('../config/db');

const ALLOWED_PAYMENT_FIELDS = ['upi_id', 'bank_account', 'paypal_email'];

const findUsersByDeviceFingerprint = async (fingerprint, excludeUserId = null) => {
  let sql = `
    SELECT DISTINCT u.id, u.public_id, u.username, u.email, u.created_at
    FROM users u
    JOIN login_history lh ON u.id = lh.user_id
    WHERE lh.device_fingerprint = $1
  `;
  const values = [fingerprint];
  
  if (excludeUserId) {
    sql += ` AND u.id != $2`;
    values.push(excludeUserId);
  }
  
  const res = await pool.query(sql, values);
  return res.rows;
};

const findUsersByPaymentDetail = async (field, value, excludeUserId = null) => {
  // WHITELIST: Never allow arbitrary column names
  if (!ALLOWED_PAYMENT_FIELDS.includes(field)) {
    throw new Error(`Invalid payment field: ${field}`);
  }

  let sql = `
    SELECT id, public_id, username, email, created_at
    FROM users
    WHERE ${field} = $1 AND ${field} IS NOT NULL
  `;
  const values = [value];
  
  if (excludeUserId) {
    sql += ` AND id != $2`;
    values.push(excludeUserId);
  }
  
  const res = await pool.query(sql, values);
  return res.rows;
};

const findReferralDepth = async (userId) => {
  // Count how many levels deep this user's referral tree goes
  const res = await pool.query(
    `WITH RECURSIVE referral_tree AS (
      SELECT id, referred_by, 1 as depth
      FROM users WHERE id = $1
      UNION ALL
      SELECT u.id, u.referred_by, rt.depth + 1
      FROM users u
      JOIN referral_tree rt ON u.id = rt.referred_by
      WHERE rt.depth < 10
    )
    SELECT MAX(depth) as max_depth FROM referral_tree`,
    [userId]
  );
  return res.rows[0]?.max_depth || 0;
};

const findRapidRegistrations = async (ip, deviceFingerprint, timeWindowMinutes = 1) => {
  const res = await pool.query(
    `SELECT COUNT(*)::int as count
     FROM login_history
     WHERE ip_address = $1 
       AND device_fingerprint = $2
       AND status = 'success'
       AND created_at >= NOW() - INTERVAL '${timeWindowMinutes} minutes'`,
    [ip, deviceFingerprint]
  );
  return res.rows[0].count;
};

const findSurveyCompletionTimes = async (userId) => {
  const res = await pool.query(
    `SELECT sc.id, sc.loi, sc.created_at, t.created_at as completed_at,
            EXTRACT(EPOCH FROM (t.created_at - sc.created_at))/60 as minutes_spent
     FROM survey_clicks sc
     JOIN transactions t ON t.reference_id = sc.id AND t.reference_type = 'survey_click'
     WHERE sc.user_id = $1 
       AND sc.status = 'completed'
       AND t.type = 'survey'
     ORDER BY sc.created_at DESC
     LIMIT 20`,
    [userId]
  );
  return res.rows.map(r => ({
    ...r,
    loi: parseInt(r.loi),
    minutes_spent: parseFloat(r.minutes_spent)
  }));
};

const findAllUsersForFraudScan = async (limit = 1000, offset = 0) => {
  const res = await pool.query(
    `SELECT id, public_id, username, email, upi_id, bank_account, paypal_email,
            referral_code, referred_by, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
};

const getLatestDeviceFingerprint = async (userId) => {
  const res = await pool.query(
    `SELECT device_fingerprint FROM login_history 
     WHERE user_id = $1 AND status = 'success'
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return res.rows[0]?.device_fingerprint || null;
};

const getLatestIP = async (userId) => {
  const res = await pool.query(
    `SELECT ip_address FROM login_history 
     WHERE user_id = $1 AND status = 'success'
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return res.rows[0]?.ip_address || null;
};

module.exports = {
  findUsersByDeviceFingerprint,
  findUsersByPaymentDetail,
  findReferralDepth,
  findRapidRegistrations,
  findSurveyCompletionTimes,
  findAllUsersForFraudScan,
  getLatestDeviceFingerprint,
  getLatestIP
};