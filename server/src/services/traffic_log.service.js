const { createTrafficLog, getTrafficLogsForAdmin, deleteOldTrafficLogs, getTrafficLogStats } = require('../repositories/traffic_log.repository');

/**
 * Log outgoing traffic — when YOUR server sends request to offer wall
 * Called from: survey_click.controller.js (when user clicks survey)
 */
const logOutgoingTraffic = async (data) => {
  try {
    return await createTrafficLog(null, {
      direction: 'outgoing',
      type: data.type || 'survey_click',
      user_id: data.user_id,
      user_public_id: data.user_public_id,
      user_username: data.user_username,
      offer_wall_id: data.offer_wall_id,
      offer_wall_name: data.offer_wall_name,
      offer_wall_internal_id: data.offer_wall_internal_id,
      survey_click_id: data.survey_click_id,
      internal_transaction_id: data.internal_transaction_id,
      external_transaction_id: data.external_transaction_id,
      url: data.url,
      method: data.method || 'GET',
      headers: data.headers,
      query_params: data.query_params,
      request_body: data.request_body,
      response_status: data.response_status,
      response_headers: data.response_headers,
      response_body: data.response_body,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      processing_time_ms: data.processing_time_ms,
      error_message: data.error_message,
      error_stack: data.error_stack,
      processing_result: data.processing_result
    });
  } catch (err) {
    console.error('[TrafficLog] Failed to log outgoing traffic:', err.message);
    // Non-blocking — don't throw
    return null;
  }
};

/**
 * Log incoming traffic — when offer wall sends callback to YOUR server
 * Called from: callback.controller.js (S2S and browser callbacks)
 */
const logIncomingTraffic = async (data) => {
  try {
    return await createTrafficLog(null, {
      direction: 'incoming',
      type: data.type || 's2s_callback',
      user_id: data.user_id,
      user_public_id: data.user_public_id,
      user_username: data.user_username,
      offer_wall_id: data.offer_wall_id,
      offer_wall_name: data.offer_wall_name,
      offer_wall_internal_id: data.offer_wall_internal_id,
      survey_click_id: data.survey_click_id,
      internal_transaction_id: data.internal_transaction_id,
      external_transaction_id: data.external_transaction_id,
      url: data.url,
      method: data.method || 'POST',
      headers: data.headers,
      query_params: data.query_params,
      request_body: data.request_body,
      response_status: data.response_status,
      response_headers: data.response_headers,
      response_body: data.response_body,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      processing_time_ms: data.processing_time_ms,
      error_message: data.error_message,
      error_stack: data.error_stack,
      processing_result: data.processing_result
    });
  } catch (err) {
    console.error('[TrafficLog] Failed to log incoming traffic:', err.message);
    // Non-blocking — don't throw
    return null;
  }
};

/**
 * Get traffic logs for admin panel
 */
const getAdminTrafficLogs = async (query = {}) => {
  const filters = {};
  
  if (query.direction) filters.direction = query.direction;
  if (query.type) filters.type = query.type;
  if (query.user_id) filters.user_id = parseInt(query.user_id);
  if (query.offer_wall_id) filters.offer_wall_id = parseInt(query.offer_wall_id);
  if (query.internal_transaction_id) filters.internal_transaction_id = query.internal_transaction_id;
  if (query.external_transaction_id) filters.external_transaction_id = query.external_transaction_id;
  if (query.status_code) filters.status_code = parseInt(query.status_code);
  if (query.date_from && query.date_to) {
    filters.date_from = query.date_from;
    filters.date_to = query.date_to;
  }

  const pagination = {
    page: query.page,
    limit: query.limit
  };

  const sort = {
    column: query.sort_by,
    order: query.sort_order
  };

  const result = await getTrafficLogsForAdmin(filters, pagination, sort);
  
  // Auto-cleanup old logs (1% chance per request)
  if (Math.random() < 0.01) {
    deleteOldTrafficLogs().catch(() => {});
  }

  return result;
};

/**
 * Get traffic log statistics for admin dashboard
 */
const getTrafficLogDashboardStats = async () => {
  return await getTrafficLogStats();
};

module.exports = {
  logOutgoingTraffic,
  logIncomingTraffic,
  getAdminTrafficLogs,
  getTrafficLogDashboardStats
};