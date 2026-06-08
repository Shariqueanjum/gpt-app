const ALLOWED_COLUMNS = ['created_at', 'id', 'status', 'ip_address', 'user_id'];
const DEFAULT_SORT = { column: 'created_at', order: 'DESC' };
const MAX_LIMIT = 100;

const buildWhereClause = (filters, startIndex = 1) => {
  const conditions = [];
  const values = [];
  let idx = startIndex;

  const exactMatches = {
    userId: 'user_id',
    status: 'status',
    ipAddress: 'ip_address'
  };

  for (const [filterKey, columnName] of Object.entries(exactMatches)) {
    if (filters[filterKey] !== undefined && filters[filterKey] !== null && filters[filterKey] !== '') {
      conditions.push(`${columnName} = $${idx++}`);
      values.push(filters[filterKey]);
    }
  }

  if (filters.dateFrom) {
    conditions.push(`created_at >= $${idx++}`);
    values.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`created_at <= $${idx++}`);
    values.push(filters.dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return { whereClause, values, nextIndex: idx };
};

const buildSelectQuery = (filters, pagination, sort) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), MAX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_COLUMNS.includes(sort.column) ? sort.column : DEFAULT_SORT.column;
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : DEFAULT_SORT.order;

  const { whereClause, values, nextIndex } = buildWhereClause(filters);

  const sql = `
    SELECT id, user_id, ip_address, user_agent, device_fingerprint, location, status, created_at
    FROM login_history
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
  `;

  return {
    sql,
    values: [...values, limit, offset],
    pagination: { page, limit }
  };
};

const buildCountQuery = (filters) => {
  const { whereClause, values } = buildWhereClause(filters);
  
  const sql = `SELECT COUNT(*)::int as total FROM login_history ${whereClause}`;
  
  return { sql, values };
};

module.exports = { buildSelectQuery, buildCountQuery, ALLOWED_COLUMNS, MAX_LIMIT };