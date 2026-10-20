const pool = require('../config/db');
const { reversalIsActive, safeInt, BONUS_TYPES, ADJUSTMENT_TYPES } = require('../utils/adminUserSql');

// ============================================================
// Revenue & profit queries.
//
// All amounts are POINTS (100 points = $1). Every query takes the same
// "scope": { from, to, trunc, offerWallId }
//   from / to : 'YYYY-MM-DD' (to is EXCLUSIVE) or null for "no limit"
//   trunc     : null | 'month' | 'quarter' | 'year'  (groups rows into buckets)
//   offerWallId: null | number                      (one client only)
// `trunc` is chosen from a fixed whitelist by the service and is the only
// value placed into SQL text; everything else is a $n parameter.
// ============================================================

const TRUNC_WHITELIST = ['month', 'quarter', 'year'];
const num = (v) => parseFloat(v) || 0;

// Returns the bucket start as plain text 'YYYY-MM-DD' so no timezone conversion can shift a month
const bucketSql = (trunc, column) => {
  if (!trunc) return 'NULL::text';
  if (!TRUNC_WHITELIST.includes(trunc)) throw new Error('Invalid bucket');
  return `to_char(date_trunc('${trunc}', ${column}), 'YYYY-MM-DD')`;
};

const rangeSql = (column) =>
  `($1::date IS NULL OR ${column} >= $1::date) AND ($2::date IS NULL OR ${column} < $2::date)`;

// Queries that filter by client use all three ($1 from, $2 to, $3 client)
const params = (scope, ...extra) => [scope.from || null, scope.to || null, scope.offerWallId || null, ...extra];
// Global queries (bonuses, adjustments, withdrawals) have no client filter, so they only take $1, $2 (+ extras from $3)
const rangeParams = (scope, ...extra) => [scope.from || null, scope.to || null, ...extra];

// Surveys completed: what the client paid, what users got, what we kept, what referrers got
const getSurveyRevenue = async (scope) => {
  const res = await pool.query(
    `SELECT ${bucketSql(scope.trunc, 't.created_at')} AS bucket, t.offer_wall_id,
            COUNT(*)::int AS surveys,
            COALESCE(SUM(t.amount + t.commission_earned), 0) AS client_value,
            COALESCE(SUM(t.amount), 0) AS user_value,
            COALESCE(SUM(t.commission_earned), 0) AS commission,
            COALESCE(SUM(t.referrer_earned), 0) AS referral_paid,
            COUNT(*) FILTER (WHERE t.referrer_earned > 0)::int AS referred_surveys
     FROM transactions t
     WHERE t.type = 'survey' AND t.amount > 0 AND t.status IN ('completed', 'locked', 'reversed')
       AND ${rangeSql('t.created_at')}
       AND ($3::int IS NULL OR t.offer_wall_id = $3)
     GROUP BY 1, 2`,
    params(scope)
  );
  return res.rows;
};

// Survey reversals still in force. A reversal always takes the WHOLE survey back,
// so the commission we lose is exactly that survey's commission.
// The loss is counted in the month of the ORIGINAL survey (not the month it was reversed),
// so August's numbers show what August really kept. `late_*` = reversed after the period ended.
const getSurveyReversals = async (scope) => {
  const res = await pool.query(
    `SELECT ${bucketSql(scope.trunc, 'st.created_at')} AS bucket, rt.offer_wall_id,
            COUNT(*)::int AS cnt,
            COALESCE(SUM(st.amount + st.commission_earned), 0) AS client_value,
            COALESCE(SUM(st.amount), 0) AS user_value,
            COALESCE(SUM(st.commission_earned), 0) AS commission_lost,
            COUNT(*) FILTER (WHERE $2::date IS NOT NULL AND rt.created_at >= $2::date)::int AS late_cnt,
            COALESCE(SUM(st.commission_earned) FILTER (WHERE $2::date IS NOT NULL AND rt.created_at >= $2::date), 0) AS commission_lost_later
     FROM transactions rt
     JOIN transactions st
       ON st.type = 'survey' AND st.user_id = rt.user_id
      AND st.reference_type = 'survey_click' AND st.reference_id = rt.reference_id
     WHERE rt.type = 'reversal' AND rt.reference_type = 'survey_click'
       AND ${reversalIsActive('rt')}
       AND ${rangeSql('st.created_at')}
       AND ($3::int IS NULL OR rt.offer_wall_id = $3)
     GROUP BY 1, 2`,
    params(scope)
  );
  return res.rows;
};

// Referral commission taken back from referrers because the survey was reversed.
// Counted in the month of the ORIGINAL survey (the referral commission was created at the same moment).
const getReferralClawbacks = async (scope) => {
  const res = await pool.query(
    `SELECT ${bucketSql(scope.trunc, 'COALESCE(rf.created_at, rv.created_at)')} AS bucket, sc.offer_wall_id,
            COUNT(*)::int AS cnt,
            COALESCE(SUM(ABS(rv.amount)), 0) AS clawed_back
     FROM transactions rv
     LEFT JOIN transactions rf ON rf.id = rv.reference_id
     LEFT JOIN survey_clicks sc ON sc.id = ${safeInt("rf.metadata->>'from_survey_click'")}
     WHERE rv.type = 'reversal' AND rv.reference_type = 'referral'
       AND ${reversalIsActive('rv')}
       AND ${rangeSql('COALESCE(rf.created_at, rv.created_at)')}
       AND ($3::int IS NULL OR sc.offer_wall_id = $3)
     GROUP BY 1, 2`,
    params(scope)
  );
  return res.rows;
};

// Daily bonus, level-up rewards and other bonuses (not tied to one client)
const getBonuses = async (scope) => {
  const res = await pool.query(
    `SELECT ${bucketSql(scope.trunc, 't.created_at')} AS bucket, t.type,
            COUNT(*)::int AS cnt, COALESCE(SUM(t.amount), 0) AS points
     FROM transactions t
     WHERE t.type = ANY($3::text[]) AND t.amount > 0 AND t.status IN ('completed', 'locked')
       AND ${rangeSql('t.created_at')}
     GROUP BY 1, 2`,
    rangeParams(scope, BONUS_TYPES)
  );
  return res.rows;
};

// Manual admin credits / debits (shown as a memo, not part of profit)
const getAdjustments = async (scope) => {
  const res = await pool.query(
    `SELECT ${bucketSql(scope.trunc, 't.created_at')} AS bucket,
            COALESCE(SUM(t.amount) FILTER (WHERE t.amount > 0), 0) AS credits,
            COALESCE(ABS(SUM(t.amount) FILTER (WHERE t.amount < 0)), 0) AS debits
     FROM transactions t
     WHERE t.type = ANY($3::text[]) AND t.status IN ('completed', 'locked')
       AND ${rangeSql('t.created_at')}
     GROUP BY 1`,
    rangeParams(scope, ADJUSTMENT_TYPES)
  );
  return res.rows;
};

// Who received the most referral commission in the period
const getTopReferrers = async (scope, limit = 5) => {
  const res = await pool.query(
    `SELECT st.referrer_id AS user_id, u.username, u.public_id,
            COUNT(*)::int AS surveys, COALESCE(SUM(st.referrer_earned), 0) AS earned
     FROM transactions st
     JOIN users u ON u.id = st.referrer_id
     WHERE st.type = 'survey' AND st.amount > 0 AND st.referrer_earned > 0
       AND ${rangeSql('st.created_at')}
       AND ($3::int IS NULL OR st.offer_wall_id = $3)
     GROUP BY st.referrer_id, u.username, u.public_id
     ORDER BY earned DESC
     LIMIT ${Math.min(Math.max(parseInt(limit) || 5, 1), 20)}`,
    params(scope)
  );
  return res.rows;
};

// Cash that actually left the business: withdrawals marked paid in the period
const getPaidWithdrawals = async (scope) => {
  const res = await pool.query(
    `SELECT ${bucketSql(scope.trunc, 'w.updated_at')} AS bucket,
            COUNT(*)::int AS cnt, COALESCE(SUM(w.amount), 0) AS points
     FROM withdrawals w
     WHERE w.status = 'paid' AND ${rangeSql('w.updated_at')}
     GROUP BY 1`,
    rangeParams(scope)
  );
  return res.rows;
};

// Right now (not period based): what the business still owes users
const getLiabilitySnapshot = async () => {
  const [bal, wd] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(balance_available), 0) AS available, COALESCE(SUM(balance_locked), 0) AS locked FROM users`),
    pool.query(`SELECT COUNT(*)::int AS cnt, COALESCE(SUM(amount), 0) AS points FROM withdrawals WHERE status IN ('pending', 'processing')`),
  ]);
  return {
    available: num(bal.rows[0].available),
    locked: num(bal.rows[0].locked),
    pending_withdrawals: { count: wd.rows[0].cnt, points: num(wd.rows[0].points) },
  };
};

const getOfferWalls = async () => {
  const res = await pool.query('SELECT id, name, commission_rate, is_active FROM offer_walls ORDER BY name ASC');
  return res.rows;
};

// First and last year that has any completed survey (for the year picker)
const getYearRange = async () => {
  const res = await pool.query(
    `SELECT EXTRACT(YEAR FROM MIN(created_at))::int AS first_year, EXTRACT(YEAR FROM MAX(created_at))::int AS last_year
     FROM transactions WHERE type = 'survey' AND amount > 0`
  );
  return res.rows[0];
};

module.exports = {
  getSurveyRevenue, getSurveyReversals, getReferralClawbacks, getBonuses, getAdjustments,
  getTopReferrers, getPaidWithdrawals, getLiabilitySnapshot, getOfferWalls, getYearRange,
};
