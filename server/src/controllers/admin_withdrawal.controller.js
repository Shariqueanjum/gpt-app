const { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } = require('../services/admin_withdrawal.service');

const listPendingWithdrawals = async (req, res, next) => {
  try {
    const result = await getPendingWithdrawals(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bank_transaction_id } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip;

    const result = await approveWithdrawal(id, bank_transaction_id, adminId, adminIp);

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: result.withdrawal
    });
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip;

    const result = await rejectWithdrawal(id, reason, adminId, adminIp);

    res.json({
      success: true,
      message: 'Withdrawal rejected successfully',
      data: result.withdrawal
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPendingWithdrawals, approve, reject };