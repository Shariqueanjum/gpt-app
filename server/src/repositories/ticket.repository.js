const pool = require('../config/db');

const ALLOWED_SORT_COLUMNS = ['created_at', 'id', 'status'];
const MAX_LIMIT = 100;

const ALLOWED_ADMIN_SORT_COLUMNS = ['created_at', 'id', 'status', 'category'];
const MAX_ADMIN_LIMIT = 100;


const createTicket = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const { user_id, category, subject, message, image_url } = data;

  const res = await executor.query(
    `INSERT INTO tickets (user_id, category, subject, message, image_url, status)
     VALUES ($1, $2, $3, $4, $5, 'open')
     RETURNING *`,
    [user_id, category, subject, message, image_url || null]
  );
  return res.rows[0];
};

const countTicketsWithImagesLast30Days = async (userId) => {
  const res = await pool.query(
    `SELECT COUNT(*)::int as count
     FROM tickets
     WHERE user_id = $1
       AND image_url IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'`,
    [userId]
  );
  return res.rows[0].count;
};

const getTicketsByUserId = async (userId, filters = {}, pagination = {}, sort = {}) => {
  // Safe parsing — defense in depth even after Zod validation
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), MAX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_SORT_COLUMNS.includes(sort.column) ? sort.column : 'created_at';
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Build WHERE conditions safely
  const conditions = ['t.user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (filters.status) {
    conditions.push(`t.status = $${idx++}`);
    values.push(filters.status);
  }

  if (filters.id) {
    conditions.push(`t.id = $${idx++}`);
    values.push(filters.id);
  }

  if (filters.dateFrom && filters.dateTo) {
    conditions.push(`t.created_at BETWEEN $${idx++} AND $${idx++}`);
    values.push(filters.dateFrom, filters.dateTo);
  }

  const whereClause = conditions.join(' AND ');

  // Count query
  const countSql = `
    SELECT COUNT(*)::int as total 
    FROM tickets t 
    WHERE ${whereClause}
  `;

  // Data query
  const dataSql = `
    SELECT 
      t.id, t.category, t.subject, t.message, t.status, 
      t.admin_response, t.image_url, t.created_at, t.updated_at
    FROM tickets t
    WHERE ${whereClause}
    ORDER BY t.${sortColumn} ${sortOrder}
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, values),
    pool.query(dataSql, [...values, limit, offset])
  ]);

  const total = countRes.rows[0].total;

  return {
    data: dataRes.rows,
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

const getAllTicketsForAdmin = async (filters = {}, pagination = {}, sort = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), MAX_ADMIN_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_ADMIN_SORT_COLUMNS.includes(sort.column) ? sort.column : 'created_at';
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Build WHERE safely
  const conditions = ['1=1'];
  const values = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`t.status = $${idx++}`);
    values.push(filters.status);
  }

  if (filters.category) {
    conditions.push(`t.category = $${idx++}`);
    values.push(filters.category);
  }

  if (filters.userId) {
    conditions.push(`t.user_id = $${idx++}`);
    values.push(filters.userId);
  }

  if (filters.search) {
    conditions.push(`(u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.public_id ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  if (filters.dateFrom && filters.dateTo) {
    conditions.push(`t.created_at BETWEEN $${idx++} AND $${idx++}`);
    values.push(filters.dateFrom, filters.dateTo);
  }

  const whereClause = conditions.join(' AND ');

  // Count
  const countSql = `
    SELECT COUNT(*)::int as total 
    FROM tickets t
    JOIN users u ON t.user_id = u.id
    WHERE ${whereClause}
  `;

  // Data with user info
  const dataSql = `
    SELECT 
      t.id, t.category, t.subject, t.message, t.status, 
      t.admin_response, t.image_url, t.created_at, t.updated_at,
      t.user_id,
      u.public_id as user_public_id, u.username as user_username, 
      u.email as user_email, u.country as user_country
    FROM tickets t
    JOIN users u ON t.user_id = u.id
    WHERE ${whereClause}
    ORDER BY t.${sortColumn} ${sortOrder}
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, values),
    pool.query(dataSql, [...values, limit, offset])
  ]);

  const total = countRes.rows[0].total;

  return {
    data: dataRes.rows,
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

const findTicketById = async (id) => {
  const res = await pool.query(
    `SELECT t.*, u.public_id as user_public_id, u.username as user_username, u.email as user_email
     FROM tickets t
     JOIN users u ON t.user_id = u.id
     WHERE t.id = $1`,
    [id]
  );
  return res.rows[0];
};

const updateTicketResponse = async (clientOrPool, id, adminResponse, status) => {
  const executor = clientOrPool || pool;

  const res = await executor.query(
    `UPDATE tickets 
     SET admin_response = $1,
         status = COALESCE($2, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [adminResponse, status || null, id]
  );
  return res.rows[0];
};


module.exports = { createTicket, countTicketsWithImagesLast30Days, getTicketsByUserId, getAllTicketsForAdmin, findTicketById,updateTicketResponse};