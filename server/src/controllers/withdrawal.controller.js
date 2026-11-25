const { requestWithdrawal, getMyWithdrawals } = require('../services/withdrawal.service');
const { logger } = require('../utils/logger');
const { recordWithdrawal } = require('../utils/metrics');

const createWithdrawal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await requestWithdrawal(userId, req.body);

    (req.log || logger).info({ event: 'withdrawal_requested', username: result.username ?? null, user_id: userId, withdrawal_id: result.withdrawal?.id ?? null, amount: result.withdrawal?.amount ?? null }, 'Withdrawal requested');
    recordWithdrawal();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: result.withdrawal
    });
  } catch (err) {
    next(err);
  }
};

const listMyWithdrawals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getMyWithdrawals(userId, page, limit);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createWithdrawal, listMyWithdrawals };