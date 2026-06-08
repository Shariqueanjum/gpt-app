const pool = require('../config/db');

const createTransaction = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const {
    user_id, type, offer_wall_id, reference_type, reference_id,
    amount, commission_earned, commission_rate_at_time,
    referrer_id, referrer_earned, status, metadata
  } = data;

  const res = await executor.query(
    `INSERT INTO transactions 
    (user_id, type, offer_wall_id, reference_type, reference_id, amount, commission_earned, commission_rate_at_time, referrer_id, referrer_earned, status, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [user_id, type, offer_wall_id, reference_type, reference_id, amount, commission_earned, commission_rate_at_time, referrer_id, referrer_earned, status, JSON.stringify(metadata || {})]
  );
  return res.rows[0];
};

const updateSurveyClickStatus = async (clientOrPool, clickId, status, data = {}) => {
  const executor = clientOrPool || pool;
  
  const res = await executor.query(
    `UPDATE survey_clicks 
     SET status = $1,
         cpa_original = COALESCE($2, cpa_original),
         cpa_user = COALESCE($3, cpa_user),
         survey_id = COALESCE($4, survey_id),
         survey_name = COALESCE($5, survey_name),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [status, data.cpa_original, data.cpa_user, data.survey_id, data.survey_name, clickId]
  );
  return res.rows[0];
};

const findTransactionByReference = async (referenceType, referenceId, type) => {
  const res = await pool.query(
    `SELECT * FROM transactions 
     WHERE reference_type = $1 AND reference_id = $2 AND type = $3 
     LIMIT 1`,
    [referenceType, referenceId, type]
  );
  return res.rows[0];
};

const ALLOWED_TX_SORT_COLUMNS = ['created_at', 'id', 'amount'];
const MAX_TX_LIMIT = 100;

const getTransactionsByUserId = async (userId, filters = {}, pagination = {}, sort = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), MAX_TX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_TX_SORT_COLUMNS.includes(sort.column) ? sort.column : 'created_at';
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Build WHERE conditions safely
  const conditions = ['t.user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (filters.type) {
    conditions.push(`t.type = $${idx++}`);
    values.push(filters.type);
  }

  if (filters.status) {
    conditions.push(`t.status = $${idx++}`);
    values.push(filters.status);
  }

  if (filters.dateFrom && filters.dateTo) {
    conditions.push(`t.created_at BETWEEN $${idx++} AND $${idx++}`);
    values.push(filters.dateFrom, filters.dateTo);
  }

  const whereClause = conditions.join(' AND ');

  // Count query
  const countSql = `
    SELECT COUNT(*)::int as total 
    FROM transactions t 
    WHERE ${whereClause}
  `;

  // Data query with offer_wall join
  const dataSql = `
    SELECT 
      t.id, t.type, t.amount, t.status, t.commission_earned,
      t.commission_rate_at_time, t.referrer_earned, t.reference_type,
      t.reference_id, t.created_at, t.updated_at,
      t.metadata,
      ow.name as offer_wall_name,
      ow.internal_id as offer_wall_internal_id
    FROM transactions t
    LEFT JOIN offer_walls ow ON t.offer_wall_id = ow.id
    WHERE ${whereClause}
    ORDER BY t.${sortColumn} ${sortOrder}
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, values),
    pool.query(dataSql, [...values, limit, offset])
  ]);

  const total = countRes.rows[0].total;

  // Parse decimals safely
  const data = dataRes.rows.map(row => ({
    ...row,
    amount: parseFloat(row.amount),
    commission_earned: parseFloat(row.commission_earned),
    referrer_earned: parseFloat(row.referrer_earned)
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
module.exports = { createTransaction, updateSurveyClickStatus, findTransactionByReference, getTransactionsByUserId };