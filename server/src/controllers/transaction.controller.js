const { getMyTransactions } = require('../services/transaction.service');

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getMyTransactions(userId, req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions };