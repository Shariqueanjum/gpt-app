const pool = require('../config/db');

const getSurveyClickStats = async (userId) => {
  const res = await pool.query(
    `SELECT 
      COUNT(*)::int as total_clicks,
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed,
      COUNT(CASE WHEN status = 'failed' THEN 1 END)::int as failed,
      COUNT(CASE WHEN status = 'quota_full' THEN 1 END)::int as quota_full,
      COUNT(CASE WHEN status = 'security_terminated' THEN 1 END)::int as security_terminated,
      COUNT(CASE WHEN status = 'reversed' THEN 1 END)::int as reversed
     FROM survey_clicks 
     WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0];
};

const getEarningsByOfferWall = async (userId) => {
  const res = await pool.query(
    `SELECT 
      ow.name as offer_wall_name,
      ow.internal_id as offer_wall_internal_id,
      COUNT(*)::int as total_surveys,
      COALESCE(SUM(t.amount), 0) as total_earned,
      COALESCE(AVG(t.amount), 0) as avg_earnings
     FROM transactions t
     JOIN offer_walls ow ON t.offer_wall_id = ow.id
     WHERE t.user_id = $1 
       AND t.type = 'survey' 
       AND t.status IN ('completed', 'locked')
     GROUP BY ow.id, ow.name, ow.internal_id
     ORDER BY total_earned DESC`,
    [userId]
  );
  
  return res.rows.map(r => ({
    ...r,
    total_earned: parseFloat(r.total_earned),
    avg_earnings: parseFloat(r.avg_earnings)
  }));
};

const getMonthlyStats = async (userId) => {
  const res = await pool.query(
    `SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(CASE WHEN type = 'survey' AND status IN ('completed', 'locked') THEN 1 END)::int as surveys_completed,
      COALESCE(SUM(CASE WHEN type = 'survey' AND status IN ('completed', 'locked') THEN amount ELSE 0 END), 0) as earnings,
      COALESCE(SUM(CASE WHEN type = 'referral' AND status = 'completed' THEN amount ELSE 0 END), 0) as referral_earnings,
      COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'pending' THEN ABS(amount) ELSE 0 END), 0) as withdrawals
     FROM transactions
     WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '12 months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY month DESC`,
    [userId]
  );
  
  return res.rows.map(r => ({
    month: r.month,
    surveys_completed: r.surveys_completed,
    earnings: parseFloat(r.earnings),
    referral_earnings: parseFloat(r.referral_earnings),
    withdrawals: parseFloat(r.withdrawals)
  }));
};

module.exports = {
  getSurveyClickStats,
  getEarningsByOfferWall,
  getMonthlyStats
};