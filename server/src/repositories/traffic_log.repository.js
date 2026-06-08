const pool = require('../config/db');

const ALLOWED_SORT_COLUMNS = ['created_at', 'id'];
const MAX_LIMIT = 200;

const createTrafficLog = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  
  const {
    direction,
    type,
    user_id,
    user_public_id,
    user_username,
    offer_wall_id,
    offer_wall_name,
    offer_wall_internal_id,
    survey_click_id,
    internal_transaction_id,
    external_transaction_id,
    url,
    method,
    headers,
    query_params,
    request_body,
    response_status,
    response_headers,
    response_body,
    ip_address,
    user_agent,
    processing_time_ms,
    error_message,
    error_stack,
    processing_result
  } = data;

  const res = await executor.query(
    `INSERT INTO traffic_logs 
    (direction, type, user_id, user_public_id, user_username,
     offer_wall_id, offer_wall_name, offer_wall_internal_id,
     survey_click_id, internal_transaction_id, external_transaction_id,
     url, method, headers, query_params, request_body,
     response_status, response_headers, response_body,
     ip_address, user_agent, processing_time_ms,
     error_message, error_stack, processing_result)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
    RETURNING *`,
    [
      direction,
      type,
      user_id || null,
      user_public_id || null,
      user_username || null,
      offer_wall_id || null,
      offer_wall_name || null,
      offer_wall_internal_id || null,
      survey_click_id || null,
      internal_transaction_id || null,
      external_transaction_id || null,
      url || null,
      method || null,
      headers ? JSON.stringify(headers) : null,
      query_params ? JSON.stringify(query_params) : null,
      request_body ? JSON.stringify(request_body) : null,
      response_status || null,
      response_headers ? JSON.stringify(response_headers) : null,
      response_body || null,
      ip_address || null,
      user_agent || null,
      processing_time_ms || null,
      error_message || null,
      error_stack || null,
      processing_result ? JSON.stringify(processing_result) : null
    ]
  );
  
  return res.rows[0];
};

const getTrafficLogsForAdmin = async (filters = {}, pagination = {}, sort = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 50, 1), MAX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_SORT_COLUMNS.includes(sort.column) ? sort.column : 'created_at';
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let whereClause = 'WHERE 1=1';
  const values = [];
  let idx = 1;

  if (filters.direction) {
    whereClause += ` AND tl.direction = $${idx++}`;
    values.push(filters.direction);
  }

  if (filters.type) {
    whereClause += ` AND tl.type = $${idx++}`;
    values.push(filters.type);
  }

  if (filters.user_id) {
    whereClause += ` AND tl.user_id = $${idx++}`;
    values.push(filters.user_id);
  }

  if (filters.offer_wall_id) {
    whereClause += ` AND tl.offer_wall_id = $${idx++}`;
    values.push(filters.offer_wall_id);
  }

  if (filters.internal_transaction_id) {
    whereClause += ` AND tl.internal_transaction_id = $${idx++}`;
    values.push(filters.internal_transaction_id);
  }

  if (filters.external_transaction_id) {
    whereClause += ` AND tl.external_transaction_id = $${idx++}`;
    values.push(filters.external_transaction_id);
  }

  if (filters.status_code) {
    whereClause += ` AND tl.response_status = $${idx++}`;
    values.push(filters.status_code);
  }

  if (filters.date_from && filters.date_to) {
    whereClause += ` AND tl.created_at BETWEEN $${idx++} AND $${idx++}`;
    values.push(filters.date_from, filters.date_to);
  }

  // Count
  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total FROM traffic_logs tl ${whereClause}`,
    values
  );

  // Data with all joins
  const dataRes = await pool.query(
    `SELECT 
      tl.*,
      u.public_id as user_public_id_joined,
      u.username as user_username_joined,
      u.email as user_email,
      ow.name as offer_wall_name_joined,
      ow.internal_id as offer_wall_internal_id_joined,
      sc.transaction_id as click_transaction_id,
      sc.status as click_status
    FROM traffic_logs tl
    LEFT JOIN users u ON tl.user_id = u.id
    LEFT JOIN offer_walls ow ON tl.offer_wall_id = ow.id
    LEFT JOIN survey_clicks sc ON tl.survey_click_id = sc.id
    ${whereClause}
    ORDER BY tl.${sortColumn} ${sortOrder}
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

// Auto-delete logs older than 7 days
const deleteOldTrafficLogs = async () => {
  const res = await pool.query(
    `DELETE FROM traffic_logs WHERE created_at < NOW() - INTERVAL '7 days'`
  );
  return res.rowCount;
};

// Get log statistics for admin dashboard
const getTrafficLogStats = async () => {
  const res = await pool.query(`
    SELECT 
      direction,
      type,
      COUNT(*) as count,
      COUNT(CASE WHEN response_status >= 400 OR error_message IS NOT NULL THEN 1 END) as error_count,
      AVG(processing_time_ms) as avg_processing_time
    FROM traffic_logs
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY direction, type
    ORDER BY count DESC
  `);
  
  return res.rows;
};

module.exports = {
  createTrafficLog,
  getTrafficLogsForAdmin,
  deleteOldTrafficLogs,
  getTrafficLogStats
};