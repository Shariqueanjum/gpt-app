const { getAdminTrafficLogs, getTrafficLogDashboardStats } = require('../services/traffic_log.service');

const listTrafficLogs = async (req, res, next) => {
  try {
    const result = await getAdminTrafficLogs(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const result = await getTrafficLogDashboardStats();

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTrafficLogs, getDashboardStats };