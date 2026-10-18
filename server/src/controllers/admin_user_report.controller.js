const service = require('../services/admin_user_report.service');

// All handlers: params are validated by zod in the route, so parseInt is safe here
const uid = (req) => parseInt(req.params.id, 10);

const wrapList = (fn) => async (req, res, next) => {
  try {
    const result = await fn(uid(req), req.query);
    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/users/:id/overview */
const getOverview = async (req, res, next) => {
  try {
    const data = await service.getUserOverview(uid(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getSurveyHistory = wrapList(service.listSurveyHistory);
const getBonusHistory = wrapList(service.listBonusHistory);
const getReversalHistory = wrapList(service.listReversalHistory);
const getWithdrawalHistory = wrapList(service.listWithdrawalHistory);
const getReferredUsers = wrapList(service.listReferredUsers);

module.exports = {
  getOverview, getSurveyHistory, getBonusHistory, getReversalHistory,
  getWithdrawalHistory, getReferredUsers
};
