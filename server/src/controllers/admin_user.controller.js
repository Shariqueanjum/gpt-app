const { getUsersList, getUserDetails, banUser, unbanUser, manualAdjustBalance } = require('../services/admin_user.service');

const listUsers = async (req, res, next) => {
  try {
    const result = await getUsersList(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getUserDetails(parseInt(id));

    res.json({
      success: true,
      data: result.user
    });
  } catch (err) {
    next(err);
  }
};

const ban = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip;

    const result = await banUser(parseInt(id), reason, adminId, adminIp);

    res.json({
      success: true,
      message: 'User banned successfully',
      data: result.user
    });
  } catch (err) {
    next(err);
  }
};

const unban = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const adminIp = req.ip;

    const result = await unbanUser(parseInt(id), adminId, adminIp);

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: result.user
    });
  } catch (err) {
    next(err);
  }
};

const adjustBalance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip;

    const result = await manualAdjustBalance(parseInt(id), amount, reason, adminId, adminIp);

    res.json({
      success: true,
      message: `Balance adjusted by ${amount > 0 ? '+' : ''}${amount} points`,
      data: result.transaction
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUser,
  ban,
  unban,
  adjustBalance
};