const { calculateFraudScore, getFraudDashboard } = require('../services/fraud.service');

const checkUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await calculateFraudScore(parseInt(userId));

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const result = await getFraudDashboard(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkUser, getDashboard };