const { getTransactionsByUserId } = require('../repositories/transaction.repository');

const getMyTransactions = async (userId, query = {}) => {
  const filters = {};

  if (query.type) filters.type = query.type;
  if (query.status) filters.status = query.status;
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

  return await getTransactionsByUserId(userId, filters, pagination, sort);
};

module.exports = { getMyTransactions };