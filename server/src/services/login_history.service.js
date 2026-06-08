const { executeQuery, executeCount } = require('../repositories/login_history.repository');
const { buildSelectQuery, buildCountQuery } = require('../utils/queryBuilder');

const getMyLoginHistory = async (userId, validatedQuery) => {
  // User can ONLY see their own data — enforced here
  const filters = {
    userId,
    status: validatedQuery.status,
    ipAddress: validatedQuery.ip_address,
    dateFrom: validatedQuery.date_from,
    dateTo: validatedQuery.date_to
  };

  const pagination = {
    page: validatedQuery.page,
    limit: validatedQuery.limit
  };

  const sort = {
    column: validatedQuery.sort_by,
    order: validatedQuery.sort_order
  };

  const selectQuery = buildSelectQuery(filters, pagination, sort);
  const countQuery = buildCountQuery(filters);

  const [data, total] = await Promise.all([
    executeQuery(selectQuery.sql, selectQuery.values),
    executeCount(countQuery.sql, countQuery.values)
  ]);

  const { page, limit } = selectQuery.pagination;

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

module.exports = { getMyLoginHistory };