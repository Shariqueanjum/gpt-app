const pool = require('../config/db');

const createWithdrawal = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const { user_id, amount, method, method_details } = data;

  const res = await executor.query(
    `INSERT INTO withdrawals (user_id, amount, method, method_details, status)
     VALUES ($1,$2,$3,$4,'pending')
     RETURNING *`,
    [user_id, amount, method, JSON.stringify(method_details)]
  );
  return res.rows[0];
};

const findWithdrawalById = async (id) => {
  const res = await pool.query(
    `SELECT w.*, u.username, u.public_id, u.email
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     WHERE w.id = $1`,
    [id]
  );
  return res.rows[0];
};

const findWithdrawalsByUserId = async (userId, limit = 20, offset = 0) => {
  const res = await pool.query(
    `SELECT id, amount, method, method_details, status, rejection_reason, 
            bank_transaction_id, created_at, updated_at
     FROM withdrawals 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return res.rows;
};

const countWithdrawalsByUserId = async (userId) => {
  const res = await pool.query(
    'SELECT COUNT(*)::int as total FROM withdrawals WHERE user_id = $1',
    [userId]
  );
  return res.rows[0].total;
};

const updateWithdrawalStatus = async (clientOrPool, id, status, data = {}) => {
  const executor = clientOrPool || pool;
  const { rejection_reason, bank_transaction_id } = data;

  const res = await executor.query(
    `UPDATE withdrawals 
     SET status = $1,
         rejection_reason = COALESCE($2, rejection_reason),
         bank_transaction_id = COALESCE($3, bank_transaction_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [status, rejection_reason, bank_transaction_id, id]
  );
  return res.rows[0];
};

// Admin queries
const findPendingWithdrawals = async (filters = {}, pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  let whereClause = "WHERE w.status = 'pending'";
  const values = [];
  let idx = 1;

  if (filters.method) {
    whereClause += ` AND w.method = $${idx++}`;
    values.push(filters.method);
  }

  if (filters.dateFrom && filters.dateTo) {
    whereClause += ` AND w.created_at BETWEEN $${idx++} AND $${idx++}`;
    values.push(filters.dateFrom, filters.dateTo);
  }

  // Count
  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total FROM withdrawals w ${whereClause}`,
    values
  );

  // Data with user info
  const dataRes = await pool.query(
    `SELECT w.*, u.username, u.public_id, u.email, u.balance_available
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     ${whereClause}
     ORDER BY w.created_at ASC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  return {
    data: dataRes.rows,
    meta: {
      page,
      limit,
      total: countRes.rows[0].total,
      totalPages: Math.ceil(countRes.rows[0].total / limit),
      hasNext: page * limit < countRes.rows[0].total,
      hasPrev: page > 1
    }
  };
};

module.exports = { createWithdrawal, findWithdrawalById, findWithdrawalsByUserId, countWithdrawalsByUserId, updateWithdrawalStatus, findPendingWithdrawals };