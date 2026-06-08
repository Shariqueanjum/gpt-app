const pool = require('../config/db');

const ALLOWED_SORT_COLUMNS = ['created_at', 'id'];
const MAX_LIMIT = 100;

const findAuditLogs = async (filters = {}, pagination = {}, sort = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), MAX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_SORT_COLUMNS.includes(sort.column) ? sort.column : 'created_at';
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let whereClause = 'WHERE 1=1';
  const values = [];
  let idx = 1;

  if (filters.adminId) {
    whereClause += ` AND al.admin_id = $${idx++}`;
    values.push(filters.adminId);
  }

  if (filters.action) {
    whereClause += ` AND al.action = $${idx++}`;
    values.push(filters.action);
  }

  if (filters.targetType) {
    whereClause += ` AND al.target_type = $${idx++}`;
    values.push(filters.targetType);
  }

  if (filters.targetId) {
    whereClause += ` AND al.target_id = $${idx++}`;
    values.push(filters.targetId);
  }

  if (filters.dateFrom && filters.dateTo) {
    whereClause += ` AND al.created_at BETWEEN $${idx++} AND $${idx++}`;
    values.push(filters.dateFrom, filters.dateTo);
  }

  // Count
  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total FROM audit_logs al ${whereClause}`,
    values
  );

  // Data with admin info
  const dataRes = await pool.query(
    `SELECT al.*, au.username as admin_username, au.email as admin_email
     FROM audit_logs al
     LEFT JOIN admin_users au ON al.admin_id = au.id
     ${whereClause}
     ORDER BY al.${sortColumn} ${sortOrder}
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

module.exports = { findAuditLogs };