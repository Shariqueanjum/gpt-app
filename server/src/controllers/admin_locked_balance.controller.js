const { listLockedSurveys, listAllSurveys, unlockLockedSurvey, reverseLockedSurvey} = require('../services/admin_locked_balance.service');

/**
 * GET /api/admin/locked-balance
 * List all locked surveys with referral info
 */
const getLockedSurveys = async (req, res, next) => {
  try {
    const result = await listLockedSurveys(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/locked-balance/history
 * List all surveys (completed + locked) for admin history
 */
const getSurveyHistory = async (req, res, next) => {
  try {
    const result = await listAllSurveys(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/locked-balance/:id/unlock
 * Unlock a locked survey — moves from locked to available balance
 * Also unlocks referral commission automatically
 */
const unlockSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection.remoteAddress || 'unknown';

    const result = await unlockLockedSurvey(parseInt(id), adminId, adminIp);

    res.json({
      success: true,
      message: `Survey unlocked successfully. ${result.referral_amount > 0 ? `Referral commission of ${result.referral_amount} pts also unlocked for ${result.referrer_username}.` : ''}`,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/locked-balance/:id/reverse
 * Reverse a locked survey — deducts from locked balance
 * Also reverses referral commission from locked balance
 */
const reverseSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection.remoteAddress || 'unknown';

    const result = await reverseLockedSurvey(parseInt(id), reason, adminId, adminIp);

    res.json({
      success: true,
      message: `Survey reversed successfully. ${result.referral_amount > 0 ? `Referral commission of ${result.referral_amount} pts also reversed from ${result.referrer_username}'s locked balance.` : ''}`,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLockedSurveys, getSurveyHistory, unlockSurvey, reverseSurvey };