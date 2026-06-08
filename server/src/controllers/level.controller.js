const { checkAndUpgradeLevel, getLevelProgress } = require('../services/level.service');

const upgradeLevel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await checkAndUpgradeLevel(userId);

    if (result.upgraded) {
      res.json({
        success: true,
        message: `Congratulations! You reached Level ${result.new_level}`,
        data: result
      });
    } else {
      res.json({
        success: true,
        message: `No level upgrade available. Current level: ${result.current_level}`,
        data: result
      });
    }
  } catch (err) {
    next(err);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getLevelProgress(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { upgradeLevel, getProgress };