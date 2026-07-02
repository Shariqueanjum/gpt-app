const pool = require('../config/db');

const getUserSurveyStats = async (userId) => {
  // Total completed surveys
  const completedRes = await pool.query(
    `SELECT COUNT(*)::int as total_completed
     FROM survey_clicks 
     WHERE user_id = $1 AND status = 'completed'`,
    [userId]
  );

  // Total reversed surveys
  const reversedRes = await pool.query(
    `SELECT COUNT(*)::int as total_reversed
     FROM survey_clicks sc
     JOIN transactions t ON t.reference_id = sc.id AND t.reference_type = 'survey_click'
     WHERE sc.user_id = $1 AND t.type = 'reversal'`,
    [userId]
  );

  const completed = completedRes.rows[0].total_completed;
  const reversed = reversedRes.rows[0].total_reversed;

  // Reversal rate: reversed / completed * 100
  // If no completed surveys, rate is 0
  const reversalRate = completed > 0 ? parseFloat(((reversed / completed) * 100).toFixed(2)) : 0;

  return {
    total_completed: completed,
    total_reversed: reversed,
    reversal_rate: reversalRate
  };
};

const lockUserForLevelCheck = async (client, userId) => {
  const executor = client || pool;
  const res = await executor.query(
    `SELECT id, username, level, balance_available
     FROM users WHERE id = $1 FOR UPDATE`,
    [userId]
  );
  return res.rows[0];
};


const updateUserLevel = async (clientOrPool, userId, newLevel) => {
  const executor = clientOrPool || pool;
  
  const res = await executor.query(
    `UPDATE users 
     SET level = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, username, level`,
    [newLevel, userId]
  );
  return res.rows[0];
};

module.exports = { getUserSurveyStats, lockUserForLevelCheck, updateUserLevel };