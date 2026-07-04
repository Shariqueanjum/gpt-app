const pool = require('../config/db');

/**
 * Get all locked survey transactions for admin panel
 * Includes user info, offer wall info, and linked referral transaction
 */
const getLockedSurveys = async (filters = {}, pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  let whereClause = "WHERE t.type = 'survey' AND t.status = 'locked'";
  const values = [];
  let idx = 1;

  if (filters.user_id) {
    whereClause += ` AND t.user_id = $${idx++}`;
    values.push(filters.user_id);
  }

  if (filters.offer_wall_id) {
    whereClause += ` AND t.offer_wall_id = $${idx++}`;
    values.push(filters.offer_wall_id);
  }

  if (filters.date_from && filters.date_to) {
    whereClause += ` AND t.created_at BETWEEN $${idx++} AND $${idx++}`;
    values.push(filters.date_from, filters.date_to);
  }

  if (filters.search) {
    whereClause += ` AND (u.username ILIKE $${idx++} OR u.public_id ILIKE $${idx++} OR sc.transaction_id ILIKE $${idx++})`;
    const searchPattern = `%${filters.search}%`;
    values.push(searchPattern, searchPattern, searchPattern);
  }

  // Count query
  const countSql = `
    SELECT COUNT(*)::int as total
    FROM transactions t
    JOIN survey_clicks sc ON t.reference_id = sc.id
    JOIN users u ON t.user_id = u.id
    ${whereClause}
  `;

  // Data query with referral info
  const dataSql = `
    SELECT
      t.id as transaction_id,
      t.user_id,
      t.amount as survey_amount,
      t.status as transaction_status,
      t.created_at as survey_completed_at,
      t.metadata as survey_metadata,
      t.commission_earned,
      t.commission_rate_at_time,
      sc.id as survey_click_id,
      sc.transaction_id as click_transaction_id,
      sc.external_transaction_id,
      sc.survey_name,
      sc.country as survey_country,
      u.username,
      u.public_id,
      u.email,
      ow.id as offer_wall_id,
      ow.name as offer_wall_name,
      ow.internal_id as offer_wall_internal_id,
      ref_t.id as referral_transaction_id,
      ref_t.user_id as referrer_id,
      ref_t.amount as referral_amount,
      ref_t.status as referral_status,
      ref_u.username as referrer_username,
      ref_u.public_id as referrer_public_id,
      rev_t.id as reversal_transaction_id,
      rev_t.status as reversal_status
    FROM transactions t
    JOIN survey_clicks sc ON t.reference_id = sc.id
    JOIN users u ON t.user_id = u.id
    LEFT JOIN offer_walls ow ON t.offer_wall_id = ow.id
    LEFT JOIN transactions ref_t ON ref_t.type = 'referral'
      AND (ref_t.metadata->>'from_survey_click')::int = sc.id
    LEFT JOIN users ref_u ON ref_t.user_id = ref_u.id
    LEFT JOIN transactions rev_t ON rev_t.type = 'reversal'
      AND rev_t.reference_id = sc.id
      AND rev_t.reference_type = 'survey_click'
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, values),
    pool.query(dataSql, [...values, limit, offset])
  ]);

  const total = countRes.rows[0].total;

  // Parse decimals
  const data = dataRes.rows.map(row => ({
    ...row,
    survey_amount: parseFloat(row.survey_amount),
    commission_earned: parseFloat(row.commission_earned),
    referral_amount: row.referral_amount ? parseFloat(row.referral_amount) : null
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Get a single locked survey with full details for unlock/reverse
 */
const getLockedSurveyById = async (transactionId) => {
  const res = await pool.query(
    `SELECT
      t.id as transaction_id,
      t.user_id,
      t.amount as survey_amount,
      t.status as transaction_status,
      t.metadata as survey_metadata,
      t.referrer_id,
      t.referrer_earned,
      sc.id as survey_click_id,
      sc.transaction_id as click_transaction_id,
      sc.status as click_status,
      u.username,
      u.balance_locked,
      u.balance_available,
      ref_t.id as referral_transaction_id,
      ref_t.user_id as referrer_user_id,
      ref_t.amount as referral_amount,
      ref_t.status as referral_status,
      ref_t.metadata as referral_metadata,
      ref_u.username as referrer_username,
      ref_u.balance_locked as referrer_balance_locked,
      ref_u.balance_available as referrer_balance_available
    FROM transactions t
    JOIN survey_clicks sc ON t.reference_id = sc.id
    JOIN users u ON t.user_id = u.id
    LEFT JOIN transactions ref_t ON ref_t.type = 'referral'
      AND (ref_t.metadata->>'from_survey_click')::int = sc.id
    LEFT JOIN users ref_u ON ref_t.user_id = ref_u.id
    WHERE t.id = $1 AND t.type = 'survey' AND t.status = 'locked'`,
    [transactionId]
  );

  if (!res.rows[0]) return null;

  const row = res.rows[0];
  return {
    ...row,
    survey_amount: parseFloat(row.survey_amount),
    referrer_earned: parseFloat(row.referrer_earned),
    referral_amount: row.referral_amount ? parseFloat(row.referral_amount) : null
  };
};

/**
 * Get all survey transactions (completed + locked) for admin history
 */
const getAllSurveysForAdmin = async (filters = {}, pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  let whereClause = "WHERE t.type = 'survey'";
  const values = [];
  let idx = 1;

  if (filters.status) {
    whereClause += ` AND t.status = $${idx++}`;
    values.push(filters.status);
  }

  if (filters.user_id) {
    whereClause += ` AND t.user_id = $${idx++}`;
    values.push(filters.user_id);
  }

  if (filters.date_from && filters.date_to) {
    whereClause += ` AND t.created_at BETWEEN $${idx++} AND $${idx++}`;
    values.push(filters.date_from, filters.date_to);
  }

  if (filters.search) {
    whereClause += ` AND (u.username ILIKE $${idx++} OR u.public_id ILIKE $${idx++} OR sc.transaction_id ILIKE $${idx++})`;
    const searchPattern = `%${filters.search}%`;
    values.push(searchPattern, searchPattern, searchPattern);
  }

  const countSql = `
    SELECT COUNT(*)::int as total
    FROM transactions t
    JOIN survey_clicks sc ON t.reference_id = sc.id
    JOIN users u ON t.user_id = u.id
    ${whereClause}
  `;

  const dataSql = `
    SELECT
      t.id as transaction_id,
      t.user_id,
      t.amount as survey_amount,
      t.status as transaction_status,
      t.created_at,
      t.metadata as survey_metadata,
      sc.id as survey_click_id,
      sc.transaction_id as click_transaction_id,
      sc.status as click_status,
      u.username,
      u.public_id,
      ow.name as offer_wall_name,
      ref_t.id as referral_transaction_id,
      ref_t.user_id as referrer_id,
      ref_t.amount as referral_amount,
      ref_t.status as referral_status,
      ref_u.username as referrer_username,
      rev_t.id as reversal_transaction_id,
      rev_t.status as reversal_status,
      undo_t.id as undo_reversal_transaction_id
    FROM transactions t
    JOIN survey_clicks sc ON t.reference_id = sc.id
    JOIN users u ON t.user_id = u.id
    LEFT JOIN offer_walls ow ON t.offer_wall_id = ow.id
    LEFT JOIN transactions ref_t ON ref_t.type = 'referral'
      AND (ref_t.metadata->>'from_survey_click')::int = sc.id
    LEFT JOIN users ref_u ON ref_t.user_id = ref_u.id
    LEFT JOIN transactions rev_t ON rev_t.type = 'reversal'
      AND rev_t.reference_id = sc.id
      AND rev_t.reference_type = 'survey_click'
    LEFT JOIN transactions undo_t ON undo_t.type = 'undo_reversal'
      AND undo_t.reference_id = sc.id
      AND undo_t.reference_type = 'survey_click'
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, values),
    pool.query(dataSql, [...values, limit, offset])
  ]);

  const total = countRes.rows[0].total;

  const data = dataRes.rows.map(row => ({
    ...row,
    survey_amount: parseFloat(row.survey_amount),
    referral_amount: row.referral_amount ? parseFloat(row.referral_amount) : null
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = { getLockedSurveys, getLockedSurveyById, getAllSurveysForAdmin };