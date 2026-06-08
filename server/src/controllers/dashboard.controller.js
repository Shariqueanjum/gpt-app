const { getDashboardStats } = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getDashboardStats(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };