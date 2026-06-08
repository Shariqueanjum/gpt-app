const { getMyReferralStats } = require('../services/referral.service');

const getReferrals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getMyReferralStats(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReferrals };