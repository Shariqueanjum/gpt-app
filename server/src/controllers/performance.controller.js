const { getUserPerformance } = require('../services/performance.service');

const getPerformance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getUserPerformance(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPerformance };