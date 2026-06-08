const { processDailyStreak, getStreakStatus } = require('../services/streak.service');

const checkIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await processDailyStreak(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        streak: result.streak,
        reward: result.reward,
        already_checked_in: result.already_checked_in
      }
    });
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getStreakStatus(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkIn, getStatus };