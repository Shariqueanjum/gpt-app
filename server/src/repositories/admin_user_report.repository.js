const pool = require('../config/db');
const {
  SURVEY_TYPES, REFERRAL_TYPES, BONUS_TYPES, BONUS_HISTORY_TYPES, ADJUSTMENT_TYPES,
  reversalIsActive, surveyIsReversed, referralIsReversed, referralClickId, safeInt, escapeLike
} = require('../utils/adminUserSql');

const MAX_LIMIT = 100;
const num = (v) => parseFloat(v) || 0;

// ------------------------------------------------------------
// Small helpers shared by every paged history query
// ------------------------------------------------------------
const toPaging = (q = {}) => {
  const limit = Math.min(Math.max(parseInt(q.limit) || 20, 1), MAX_LIMIT);
  const page = Math.max(parseInt(q.page) || 1, 1);
  return { limit, page, offset: (page - 1) * limit };
};

const buildMeta = (page, limit, total) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1
});

// Collects WHERE conditions with correctly numbered $n placeholders.
// Values start AFTER the base query's own parameters (just $1 = user id).
const createFilterBuilder = (startIndex = 2) => {
  const conditions = [];
  const values = [];
  let idx = startIndex;
  return {
    // "?" marks where the value goes; it may appear several times (one value, many columns)
    add(sqlWithPlaceholder, value) {
      const placeholder = `$${idx++}`;
      conditions.push(sqlWithPlaceholder.split('?').join(placeholder));
      values.push(value);
    },
    // condition that needs no value (e.g. "amount > 0")
    addRaw(sql) { conditions.push(sql); },
    get where() { return conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''; },
    values,
    get nextIndex() { return idx; }
  };
};

const applyDateRange = (fb, q, column = 'created_at') => {
  if (q.date_from) fb.add(`${column} >= ?::date`, q.date_from);
  if (q.date_to) fb.add(`${column} < (?::date + 1)`, q.date_to);
};

const applyPointsRange = (fb, q, column = 'amount_abs') => {
  if (q.min_points !== undefined && q.min_points !== '') fb.add(`${column} >= ?::numeric`, q.min_points);
  if (q.max_points !== undefined && q.max_points !== '') fb.add(`${column} <= ?::numeric`, q.max_points);
};

const likeValue = (text) => `%${escapeLike(text)}%`;

/**
 * Runs: WITH base AS (<baseSql>) SELECT ... FROM base <where> ORDER BY ... LIMIT/OFFSET
 * baseSql must only reference $1 (user id). Sort column comes from a whitelist.
 */
const runPaged = async ({ baseSql, userId, fb, query, sortMap, defaultSort, sumColumn = 'amount' }) => {
  const { limit, page, offset } = toPaging(query);
  const sortColumn = sortMap[query.sort_by] || sortMap[defaultSort];
  const sortOrder = String(query.sort_order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const params = [userId, ...fb.values];

  const countSql = `
    WITH base AS (${baseSql})
    SELECT COUNT(*)::int AS total, COALESCE(SUM(${sumColumn}), 0) AS total_points
    FROM base ${fb.where}`;

  const dataSql = `
    WITH base AS (${baseSql})
    SELECT * FROM base ${fb.where}
    ORDER BY ${sortColumn} ${sortOrder}, id DESC
    LIMIT $${fb.nextIndex} OFFSET $${fb.nextIndex + 1}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, [...params, limit, offset])
  ]);

  const total = countRes.rows[0].total;
  return {
    rows: dataRes.rows,
    meta: { ...buildMeta(page, limit, total), filtered_points: num(countRes.rows[0].total_points) }
  };
};

// ------------------------------------------------------------
// OVERVIEW pieces
// ------------------------------------------------------------

// Identity + who referred this user (no password hash, no bank details)
const getUserIdentity = async (userId) => {
  const res = await pool.query(
    `SELECT u.id, u.public_id, u.username, u.email, u.full_name, u.country, u.level,
            u.current_streak, u.is_active, u.is_verified, u.ban_reason, u.banned_at,
            u.referral_code, u.created_at, u.last_login_at,
            u.balance_available, u.balance_locked, u.balance_denied,
            r.id AS referrer_id, r.username AS referrer_username, r.public_id AS referrer_public_id
     FROM users u
     LEFT JOIN users r ON r.id = u.referred_by
     WHERE u.id = $1`,
    [userId]
  );
  return res.rows[0] || null;
};

// Everything the user earned / was adjusted, from the ledger
const getEarningTotals = async (userId) => {
  const res = await pool.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type = ANY($2) AND amount > 0 AND status IN ('completed','locked','reversed')), 0) AS survey_earned,
       COALESCE(SUM(amount) FILTER (WHERE type = ANY($3) AND amount > 0 AND status IN ('completed','locked','reversed')), 0) AS referral_earned,
       COALESCE(SUM(amount) FILTER (WHERE type = ANY($4) AND amount > 0 AND status IN ('completed','locked','reversed')), 0) AS bonus_earned,
       COALESCE(SUM(amount) FILTER (WHERE type = ANY($5) AND status IN ('completed','locked')), 0) AS adjustments_net,
       COUNT(*) FILTER (WHERE type = ANY($2) AND amount > 0)::int AS surveys_credited
     FROM transactions
     WHERE user_id = $1`,
    [userId, SURVEY_TYPES, REFERRAL_TYPES, BONUS_TYPES, ADJUSTMENT_TYPES]
  );
  return res.rows[0];
};

// Reversals still in force (undone ones are ignored)
const getReversalTotals = async (userId) => {
  const res = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE t.reference_type = 'survey_click')::int AS survey_count,
       COALESCE(SUM(ABS(t.amount)) FILTER (WHERE t.reference_type = 'survey_click'), 0) AS survey_points,
       COUNT(*) FILTER (WHERE t.reference_type = 'referral')::int AS referral_count,
       COALESCE(SUM(ABS(t.amount)) FILTER (WHERE t.reference_type = 'referral'), 0) AS referral_points
     FROM transactions t
     WHERE t.user_id = $1 AND t.type = 'reversal' AND ${reversalIsActive('t')}`,
    [userId]
  );
  return res.rows[0];
};

// Withdrawal totals grouped by status
const getWithdrawalTotals = async (userId) => {
  const res = await pool.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount), 0) AS points
     FROM withdrawals WHERE user_id = $1 GROUP BY status`,
    [userId]
  );
  const out = { pending: { count: 0, points: 0 }, processing: { count: 0, points: 0 }, paid: { count: 0, points: 0 }, rejected: { count: 0, points: 0 } };
  res.rows.forEach((r) => { if (out[r.status]) out[r.status] = { count: r.count, points: num(r.points) }; });
  return out;
};

// Per-provider (offer wall) breakdown: credited, reversed, clicks that did not complete
const getProviderBreakdown = async (userId) => {
  const res = await pool.query(
    `WITH credited AS (
       SELECT offer_wall_id, COUNT(*)::int AS cnt, COALESCE(SUM(amount), 0) AS pts
       FROM transactions
       WHERE user_id = $1 AND type = 'survey' AND amount > 0 AND offer_wall_id IS NOT NULL
       GROUP BY offer_wall_id
     ),
     reversed AS (
       SELECT t.offer_wall_id, COUNT(*)::int AS cnt, COALESCE(SUM(ABS(t.amount)), 0) AS pts
       FROM transactions t
       WHERE t.user_id = $1 AND t.type = 'reversal' AND t.reference_type = 'survey_click'
         AND t.offer_wall_id IS NOT NULL AND ${reversalIsActive('t')}
       GROUP BY t.offer_wall_id
     ),
     clicks AS (
       SELECT offer_wall_id,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status IN ('failed','quota_full','security_terminated','terminated'))::int AS not_completed
       FROM survey_clicks WHERE user_id = $1 GROUP BY offer_wall_id
     )
     SELECT ow.id AS offer_wall_id, ow.name,
            COALESCE(c.cnt, 0) AS completed_count, COALESCE(c.pts, 0) AS completed_points,
            COALESCE(r.cnt, 0) AS reversed_count, COALESCE(r.pts, 0) AS reversed_points,
            COALESCE(k.total, 0) AS clicks_total, COALESCE(k.not_completed, 0) AS clicks_not_completed
     FROM offer_walls ow
     LEFT JOIN credited c ON c.offer_wall_id = ow.id
     LEFT JOIN reversed r ON r.offer_wall_id = ow.id
     LEFT JOIN clicks k ON k.offer_wall_id = ow.id
     WHERE c.offer_wall_id IS NOT NULL OR r.offer_wall_id IS NOT NULL OR k.offer_wall_id IS NOT NULL
     ORDER BY COALESCE(c.pts, 0) DESC, ow.name ASC`,
    [userId]
  );
  return res.rows.map((r) => ({
    offer_wall_id: r.offer_wall_id,
    name: r.name,
    completed_count: r.completed_count,
    completed_points: num(r.completed_points),
    reversed_count: r.reversed_count,
    reversed_points: num(r.reversed_points),
    net_points: num(r.completed_points) - num(r.reversed_points),
    clicks_total: r.clicks_total,
    clicks_not_completed: r.clicks_not_completed
  }));
};

const getReferredCount = async (userId) => {
  const res = await pool.query('SELECT COUNT(*)::int AS total FROM users WHERE referred_by = $1', [userId]);
  return res.rows[0].total;
};

// Filter dropdown: every provider that exists (so admin can filter even without activity)
const getProviderOptions = async () => {
  const res = await pool.query('SELECT id, name FROM offer_walls ORDER BY name ASC');
  return res.rows;
};

// ------------------------------------------------------------
// HISTORY: surveys
// ------------------------------------------------------------
const getSurveyHistory = async (userId, q = {}) => {
  const baseSql = `
    SELECT * FROM (
      SELECT t.id, t.amount, ABS(t.amount) AS amount_abs, t.created_at,
             t.commission_earned,
             sc.id AS click_id, sc.survey_name, sc.transaction_id AS click_transaction_id,
             sc.external_transaction_id, t.offer_wall_id, ow.name AS provider,
             CASE WHEN ${surveyIsReversed('t')} THEN 'reversed'
                  WHEN t.status = 'locked' THEN 'locked'
                  ELSE 'completed' END AS status
      FROM transactions t
      LEFT JOIN survey_clicks sc ON t.reference_type = 'survey_click' AND sc.id = t.reference_id
      LEFT JOIN offer_walls ow ON ow.id = t.offer_wall_id
      WHERE t.user_id = $1 AND t.type = 'survey'
    ) s`;

  const fb = createFilterBuilder();
  if (q.status) fb.add('status = ?', q.status);
  if (q.offer_wall_id) fb.add('offer_wall_id = ?', parseInt(q.offer_wall_id));
  if (q.search) {
    fb.add(`(COALESCE(survey_name,'') ILIKE ? OR COALESCE(click_transaction_id,'') ILIKE ? OR COALESCE(external_transaction_id,'') ILIKE ?)`, likeValue(q.search));
  }
  applyDateRange(fb, q);
  applyPointsRange(fb, q);

  const { rows, meta } = await runPaged({
    baseSql, userId, fb, query: q,
    sortMap: { created_at: 'created_at', amount: 'amount_abs' }, defaultSort: 'created_at'
  });

  return {
    data: rows.map((r) => ({ ...r, amount: num(r.amount), commission_earned: num(r.commission_earned), amount_abs: undefined })),
    meta
  };
};


// ------------------------------------------------------------
// HISTORY: bonuses, daily bonus, level-up, admin adjustments, refunds
// ------------------------------------------------------------
const getBonusHistory = async (userId, q = {}) => {
  const baseSql = `
    SELECT t.id, t.type, t.amount, ABS(t.amount) AS amount_abs, t.status, t.created_at,
           COALESCE(
             t.metadata->>'reason',
             t.metadata->>'rejection_reason',
             CASE WHEN t.type = 'daily_bonus' THEN 'Streak day ' || COALESCE(t.metadata->>'streak_day', '?') END,
             CASE WHEN t.type = 'level_up_bonus' THEN 'Reached level ' || COALESCE(t.metadata->>'new_level', '?') END
           ) AS note
    FROM transactions t
    WHERE t.user_id = $1 AND t.type = ANY('{${BONUS_HISTORY_TYPES.join(',')}}'::text[])`;

  const fb = createFilterBuilder();
  if (q.type) fb.add('type = ?', q.type);
  if (q.direction === 'credit') fb.addRaw('amount > 0');
  if (q.direction === 'debit') fb.addRaw('amount < 0');
  applyDateRange(fb, q);
  applyPointsRange(fb, q);

  const { rows, meta } = await runPaged({
    baseSql, userId, fb, query: q,
    sortMap: { created_at: 'created_at', amount: 'amount_abs' }, defaultSort: 'created_at'
  });
  return { data: rows.map((r) => ({ ...r, amount: num(r.amount), amount_abs: undefined })), meta };
};

// ------------------------------------------------------------
// HISTORY: reversals (survey reversals + referral commission clawbacks)
// ------------------------------------------------------------
const getReversalHistory = async (userId, q = {}) => {
  const baseSql = `
    SELECT * FROM (
      SELECT t.id, t.amount, ABS(t.amount) AS amount_abs, t.created_at,
             CASE WHEN t.reference_type = 'survey_click' THEN 'survey' ELSE 'referral' END AS kind,
             CASE WHEN ${reversalIsActive('t')} THEN 'active' ELSE 'undone' END AS state,
             COALESCE(t.metadata->>'source', 'manual') AS source,
             t.metadata->>'reason' AS reason,
             t.offer_wall_id, ow.name AS provider,
             sc.survey_name, sc.transaction_id AS click_transaction_id, sc.external_transaction_id,
             t.metadata->>'from_username' AS from_username
      FROM transactions t
      LEFT JOIN offer_walls ow ON ow.id = t.offer_wall_id
      LEFT JOIN survey_clicks sc ON t.reference_type = 'survey_click' AND sc.id = t.reference_id
      WHERE t.user_id = $1 AND t.type = 'reversal'
    ) r`;

  const fb = createFilterBuilder();
  if (q.kind) fb.add('kind = ?', q.kind);
  if (q.state) fb.add('state = ?', q.state);
  if (q.source) fb.add('source = ?', q.source);
  if (q.offer_wall_id) fb.add('offer_wall_id = ?', parseInt(q.offer_wall_id));
  if (q.search) {
    fb.add(`(COALESCE(reason,'') ILIKE ? OR COALESCE(survey_name,'') ILIKE ? OR COALESCE(click_transaction_id,'') ILIKE ? OR COALESCE(external_transaction_id,'') ILIKE ? OR COALESCE(from_username,'') ILIKE ?)`, likeValue(q.search));
  }
  applyDateRange(fb, q);
  applyPointsRange(fb, q);

  const { rows, meta } = await runPaged({
    baseSql, userId, fb, query: q,
    sortMap: { created_at: 'created_at', amount: 'amount_abs' }, defaultSort: 'created_at',
    sumColumn: 'amount_abs'
  });
  return { data: rows.map((r) => ({ ...r, amount: num(r.amount), amount_abs: undefined })), meta };
};

// ------------------------------------------------------------
// HISTORY: withdrawals
// ------------------------------------------------------------
const getWithdrawalHistory = async (userId, q = {}) => {
  const baseSql = `
    SELECT w.id, w.amount, w.amount AS amount_abs, w.method, w.method_details, w.status,
           w.rejection_reason, w.bank_transaction_id, w.created_at, w.updated_at
    FROM withdrawals w
    WHERE w.user_id = $1`;

  const fb = createFilterBuilder();
  if (q.status) fb.add('status = ?', q.status);
  if (q.method) fb.add('method = ?', q.method);
  if (q.search) {
    fb.add(`(COALESCE(bank_transaction_id,'') ILIKE ? OR COALESCE(rejection_reason,'') ILIKE ?)`, likeValue(q.search));
  }
  applyDateRange(fb, q);
  applyPointsRange(fb, q);

  const { rows, meta } = await runPaged({
    baseSql, userId, fb, query: q,
    sortMap: { created_at: 'created_at', amount: 'amount_abs' }, defaultSort: 'created_at'
  });
  return { data: rows.map((r) => ({ ...r, amount: num(r.amount), amount_abs: undefined })), meta };
};

// Distinct payment methods this user has used (for the filter dropdown)
const getWithdrawalMethodOptions = async (userId) => {
  const res = await pool.query('SELECT DISTINCT method FROM withdrawals WHERE user_id = $1 ORDER BY method', [userId]);
  return res.rows.map((r) => r.method);
};

// ------------------------------------------------------------
// HISTORY: users this person referred + commission earned from each
// ------------------------------------------------------------
const getReferredUsers = async (userId, q = {}) => {
  const baseSql = `
    SELECT u.id, u.username, u.public_id, u.country, u.created_at AS joined_at,
           u.is_active,
           COALESCE((SELECT SUM(t.amount) FROM transactions t
                      WHERE t.user_id = $1 AND t.type = 'referral'
                        AND t.reference_type = 'user' AND t.reference_id = u.id
                        AND t.amount > 0 AND t.status IN ('completed','locked','reversed')), 0) AS commission_earned,
           COALESCE((SELECT SUM(ABS(rv.amount)) FROM transactions rv
                      WHERE rv.user_id = $1 AND rv.type = 'reversal' AND rv.reference_type = 'referral'
                        AND ${safeInt('rv.metadata->>\'from_user_id\'')} = u.id
                        AND ${reversalIsActive('rv')}), 0) AS commission_reversed,
           (SELECT COUNT(*)::int FROM transactions st
             WHERE st.user_id = u.id AND st.type = 'survey' AND st.amount > 0) AS surveys_completed,
           u.id AS sort_id, u.created_at AS created_at
    FROM users u
    WHERE u.referred_by = $1`;

  const fb = createFilterBuilder();
  if (q.search) fb.add(`username ILIKE ?`, likeValue(q.search));
  if (q.date_from) fb.add('joined_at >= ?::date', q.date_from);
  if (q.date_to) fb.add('joined_at < (?::date + 1)', q.date_to);

  const { rows, meta } = await runPaged({
    baseSql, userId, fb, query: q,
    sortMap: { joined: 'joined_at', earned: 'commission_earned' }, defaultSort: 'joined',
    sumColumn: 'commission_earned'
  });

  return {
    data: rows.map((r) => ({
      id: r.id, username: r.username, public_id: r.public_id, country: r.country,
      joined_at: r.joined_at, is_active: r.is_active, surveys_completed: r.surveys_completed,
      commission_earned: num(r.commission_earned),
      commission_reversed: num(r.commission_reversed),
      commission_net: num(r.commission_earned) - num(r.commission_reversed)
    })),
    meta
  };
};

module.exports = {
  getUserIdentity, getEarningTotals, getReversalTotals, getWithdrawalTotals,
  getProviderBreakdown, getReferredCount, getProviderOptions,
  getSurveyHistory, getBonusHistory, getReversalHistory, getWithdrawalHistory,
  getWithdrawalMethodOptions, getReferredUsers
};
