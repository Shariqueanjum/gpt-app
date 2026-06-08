const pool = require('../config/db');

const findByEmailOrUsername = async (email, username) => {
  const res = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return res.rows[0];
};

const findByReferralCode = async (code) => {
  const res = await pool.query(
    'SELECT id FROM users WHERE referral_code = $1',
    [code]
  );
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const res = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return res.rows[0];
};

const createUser = async (client, data) => {
  const {public_id,username,email,password_hash,full_name,country,referral_code,referred_by,is_verified} = data;

  const res = await client.query(
    `INSERT INTO users 
    (public_id, username, email, password_hash, full_name, country, referral_code, referred_by, is_verified)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [public_id, username, email, password_hash, full_name, country, referral_code, referred_by, is_verified]
  );
  return res.rows[0];
};

const findUserById = async (id) => {
  const res = await pool.query(
    `SELECT id, public_id, username, email, password_hash, full_name, country, phone, dob, gender, address, upi_id,
            referral_code, referred_by, balance_available, balance_locked, balance_denied,
            profile_completion, is_active, is_verified, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return res.rows[0];
};

const updateUserProfile = async (clientOrPool, id, data) => {
  const executor = clientOrPool || pool;
  
  const { full_name, phone, dob, gender, address, country, upi_id, profile_completion } = data;
  
  const res = await executor.query(
    `UPDATE users 
     SET full_name = COALESCE($1, full_name),
         phone = COALESCE($2, phone),
         dob = COALESCE($3, dob),
         gender = COALESCE($4, gender),
         address = COALESCE($5, address),
         country = COALESCE($6, country),
         upi_id = COALESCE($7, upi_id),
         profile_completion = COALESCE($8, profile_completion),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING id, public_id, username, email, full_name, phone, dob, gender, address, country, upi_id, profile_completion`,
    [full_name, phone, dob, gender, address, country, upi_id, profile_completion, id]
  );
  
  return res.rows[0];
};

const updatePassword = async (id, password_hash) => {
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [password_hash, id]
  );
};

const findUserByUsername = async (username) => {
  const res = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return res.rows[0];
};

  // Admin methods

const findUsersForAdmin = async (filters = {}, pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const values = [];
  let idx = 1;

  if (filters.search) {
    whereClause += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.public_id ILIKE $${idx})`;
    values.push(`%${filters.search}%`);
    idx++;
  }

  if (filters.is_active !== undefined) {
    whereClause += ` AND u.is_active = $${idx++}`;
    values.push(filters.is_active);
  }

  if (filters.is_verified !== undefined) {
    whereClause += ` AND u.is_verified = $${idx++}`;
    values.push(filters.is_verified);
  }

  if (filters.dateFrom && filters.dateTo) {
    whereClause += ` AND u.created_at BETWEEN $${idx++} AND $${idx++}`;
    values.push(filters.dateFrom, filters.dateTo);
    idx += 2;
  }

  // Count
  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total FROM users u ${whereClause}`,
    values
  );

  // // Data with calculated totals
  // const dataRes = await pool.query(
  //   `SELECT 
  //     u.id, u.public_id, u.username, u.email, u.full_name, u.country,
  //     u.balance_available, u.balance_locked, u.balance_denied,
  //     u.profile_completion, u.is_active, u.is_verified, u.level,
  //     u.referral_code, u.referred_by, u.created_at,
  //     COALESCE(SUM(CASE WHEN t.amount > 0 AND t.status IN ('completed', 'locked') AND t.type != 'withdrawal' THEN t.amount ELSE 0 END), 0) as total_earned,
  //     COALESCE(SUM(CASE WHEN w.status = 'paid' THEN w.amount ELSE 0 END), 0) as total_withdrawn
  //    FROM users u
  //    LEFT JOIN transactions t ON u.id = t.user_id
  //    LEFT JOIN withdrawals w ON u.id = w.user_id AND w.status = 'paid'
  //    ${whereClause}
  //    GROUP BY u.id
  //    ORDER BY u.created_at DESC
  //    LIMIT $${idx++} OFFSET $${idx++}`,
  //   [...values, limit, offset]
  // );

   // Data with CORRECT totals using subqueries (no Cartesian product)
  const dataRes = await pool.query(
    `SELECT 
      u.id, u.public_id, u.username, u.email, u.full_name, u.country,
      u.balance_available, u.balance_locked, u.balance_denied,
      u.profile_completion, u.is_active, u.is_verified, u.level,
      u.referral_code, u.referred_by, u.created_at,
      COALESCE((
        SELECT SUM(t.amount)
        FROM transactions t
        WHERE t.user_id = u.id
          AND t.amount > 0
          AND t.status IN ('completed', 'locked')
          AND t.type != 'withdrawal'
      ), 0) as total_earned,
      COALESCE((
        SELECT SUM(w.amount)
        FROM withdrawals w
        WHERE w.user_id = u.id AND w.status = 'paid'
      ), 0) as total_withdrawn
     FROM users u
     ${whereClause}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  return {
    data: dataRes.rows.map(u => ({
      ...u,
      balance_available: parseFloat(u.balance_available),
      balance_locked: parseFloat(u.balance_locked),
      balance_denied: parseFloat(u.balance_denied),
      total_earned: parseFloat(u.total_earned),
      total_withdrawn: parseFloat(u.total_withdrawn)
    })),
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

const updateUserBanStatus = async (id, isActive, banReason = null) => {
  const res = await pool.query(
    `UPDATE users 
     SET is_active = $1,
         ban_reason = CASE WHEN $1 = false THEN $2 ELSE NULL END,
         banned_at = CASE WHEN $1 = false THEN CURRENT_TIMESTAMP ELSE NULL END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, username, is_active, ban_reason, banned_at`,
    [isActive, banReason, id]
  );
  return res.rows[0];
};

const adjustUserBalance = async (clientOrPool, userId, amount, type, metadata) => {
  const executor = clientOrPool || pool;
  
  const balanceField = amount >= 0 ? 'balance_available' : 'balance_available';
  const absAmount = Math.abs(amount);

  // Update balance
  await executor.query(
    `UPDATE users SET ${balanceField} = ${balanceField} + $1 WHERE id = $2`,
    [amount, userId]
  );

  // Create adjustment transaction
  const res = await executor.query(
    `INSERT INTO transactions 
    (user_id, type, offer_wall_id, reference_type, reference_id, amount, commission_earned, commission_rate_at_time, referrer_id, referrer_earned, status, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [userId, type, null, 'manual_adjustment', 0, amount, 0, null, null, 0, 'completed', JSON.stringify(metadata)]
  );

  return res.rows[0];
};

const lockUserById = async (client, id) => {
  const res = await client.query(
    `SELECT id, public_id, username, email, password_hash, full_name, country, phone, dob, gender, address, upi_id,
            referral_code, referred_by, balance_available, balance_locked, balance_denied,
            profile_completion, is_active, is_verified, created_at
     FROM users WHERE id = $1 FOR UPDATE`,
    [id]
  );
  return res.rows[0];
};

module.exports = { findByEmailOrUsername, findByReferralCode, createUser, findUserByEmail, findUserById, updateUserProfile, updatePassword, findUserByUsername, findUsersForAdmin, updateUserBanStatus, adjustUserBalance, lockUserById };