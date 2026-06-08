const pool = require('../config/db');

const createVPNCheck = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const {
    user_id, ip_address, is_vpn, is_proxy, is_tor,
    provider, country, risk_score, raw_response
  } = data;

  const res = await executor.query(
    `INSERT INTO vpn_checks 
    (user_id, ip_address, is_vpn, is_proxy, is_tor, provider, country, risk_score, raw_response)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      user_id, ip_address, is_vpn, is_proxy, is_tor,
      provider, country, risk_score, JSON.stringify(raw_response)
    ]
  );
  return res.rows[0];
};

const getVPNChecksByUser = async (userId) => {
  const res = await pool.query(
    `SELECT * FROM vpn_checks WHERE user_id = $1 ORDER BY checked_at DESC`,
    [userId]
  );
  return res.rows;
};

const getVPNStatsForAdmin = async () => {
  const res = await pool.query(
    `SELECT 
      COUNT(*) as total_checks,
      COUNT(CASE WHEN is_vpn = true THEN 1 END) as vpn_detected,
      COUNT(CASE WHEN is_proxy = true THEN 1 END) as proxy_detected,
      COUNT(CASE WHEN is_tor = true THEN 1 END) as tor_detected
     FROM vpn_checks
     WHERE checked_at >= NOW() - INTERVAL '24 hours'`
  );
  return res.rows[0];
};

module.exports = { createVPNCheck, getVPNChecksByUser, getVPNStatsForAdmin };