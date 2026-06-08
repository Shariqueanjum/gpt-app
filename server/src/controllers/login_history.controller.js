const { getMyLoginHistory } = require('../services/login_history.service');

const getUserLoginHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getMyLoginHistory(userId, req.query); // validated by middleware

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserLoginHistory };