const { findAuditLogs } = require('../repositories/audit_log.repository');

const getAuditLogs = async (query = {}) => {
  const filters = {};

  if (query.admin_id) filters.adminId = parseInt(query.admin_id);
  if (query.action) filters.action = query.action;
  if (query.target_type) filters.targetType = query.target_type;
  if (query.target_id) filters.targetId = parseInt(query.target_id);
  if (query.date_from && query.date_to) {
    filters.dateFrom = query.date_from;
    filters.dateTo = query.date_to;
  }

  const pagination = {
    page: query.page,
    limit: query.limit
  };

  const sort = {
    column: query.sort_by,
    order: query.sort_order
  };

  return await findAuditLogs(filters, pagination, sort);
};

module.exports = { getAuditLogs };