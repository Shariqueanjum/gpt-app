const {
  getSurveyActivity,
  getSurveyActivityStatsSummary,
  getSurveyActivityDetail,
  getSurveyActivityFilterOptions,
  reverseSurveyClick,
  undoSurveyClickReversal
} = require('../services/survey_activity.service');

const getAdminIp = (req) => req.ip || req.connection?.remoteAddress || 'unknown';

const listSurveyActivity = async (req, res, next) => {
  try {
    const result = await getSurveyActivity(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await getSurveyActivityStatsSummary(req.query);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getFilterOptions = async (req, res, next) => {
  try {
    const result = await getSurveyActivityFilterOptions();

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getClickDetail = async (req, res, next) => {
  try {
    const result = await getSurveyActivityDetail(parseInt(req.params.id, 10));

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const reverseClick = async (req, res, next) => {
  try {
    const result = await reverseSurveyClick(
      parseInt(req.params.id, 10),
      req.body?.reason,
      req.admin.id,
      getAdminIp(req)
    );

    res.json({
      success: true,
      message: 'Reversal processed successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const undoClick = async (req, res, next) => {
  try {
    const result = await undoSurveyClickReversal(
      parseInt(req.params.id, 10),
      req.admin.id,
      getAdminIp(req)
    );

    res.json({
      success: true,
      message: 'Reversal undone successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listSurveyActivity,
  getStats,
  getFilterOptions,
  getClickDetail,
  reverseClick,
  undoClick
};
