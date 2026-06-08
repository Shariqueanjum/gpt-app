const pool = require('../config/db');

const createPaymentProof = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const { user_id, image_url, amount, method } = data;

  const res = await executor.query(
    `INSERT INTO payment_proofs (user_id, image_url, amount, method, status, reward_given)
     VALUES ($1, $2, $3, $4, 'pending', false)
     RETURNING *`,
    [user_id, image_url, amount, method]
  );
  return res.rows[0];
};

const findPaymentProofByUserId = async (userId) => {
  const res = await pool.query(
    `SELECT id, image_url, amount, method, status, reward_given, admin_note, created_at, updated_at
     FROM payment_proofs
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows;
};

const findPendingProofsForAdmin = async (pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total FROM payment_proofs WHERE status = 'pending'`
  );

  const dataRes = await pool.query(
    `SELECT pp.*, u.public_id, u.username, u.email, u.country
     FROM payment_proofs pp
     JOIN users u ON pp.user_id = u.id
     WHERE pp.status = 'pending'
     ORDER BY pp.created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
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

const findPaymentProofById = async (id) => {
  const res = await pool.query(
    `SELECT pp.*, u.public_id, u.username, u.email, u.balance_available
     FROM payment_proofs pp
     JOIN users u ON pp.user_id = u.id
     WHERE pp.id = $1`,
    [id]
  );
  return res.rows[0];
};

const updatePaymentProofStatus = async (clientOrPool, id, status, data = {}) => {
  const executor = clientOrPool || pool;
  const { reward_given, admin_note } = data;

  const res = await executor.query(
    `UPDATE payment_proofs 
     SET status = COALESCE($1, status),
         reward_given = COALESCE($2, reward_given),
         admin_note = COALESCE($3, admin_note),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [status, reward_given, admin_note, id]
  );
  return res.rows[0];
};

const hasExistingProof = async (userId) => {
  const res = await pool.query(
    `SELECT COUNT(*)::int as count FROM payment_proofs WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0].count > 0;
};

const lockPaymentProofById = async (client, id) => {
  const res = await client.query(
    `SELECT pp.*, u.public_id, u.username, u.email, u.balance_available
     FROM payment_proofs pp
     JOIN users u ON pp.user_id = u.id
     WHERE pp.id = $1
     FOR UPDATE`,
    [id]
  );
  return res.rows[0];
};

module.exports = { createPaymentProof, findPaymentProofByUserId, findPendingProofsForAdmin, findPaymentProofById, updatePaymentProofStatus, hasExistingProof, lockPaymentProofById };