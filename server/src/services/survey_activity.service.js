const {
  findSurveyActivity,
  getSurveyActivityStats,
  findClickDetail,
  findClickTrafficEvents,
  findClickMoneyEvents,
  findFilterOptions
} = require('../repositories/survey_activity.repository');
const { processSingleReversal, undoReversal } = require('./reversal.service');
const { SURVEY_CLICK_STATUS } = require('../constants/transactionTypes');

const DEFAULT_REVERSE_REASON = 'Manual reversal from Survey Activity';

// ---- query -> repository filters -------------------------------------------
// Query values arrive as raw strings (the validate middleware cannot replace
// req.query on Express 5), so every value is parsed here.

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
};

const toNumber = (v) => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = parseFloat(v);
  return Number.isNaN(n) ? undefined : n;
};

const buildFilters = (query = {}) => {
  const filters = {};

  if (query.transaction_id) filters.transactionId = query.transaction_id;
  if (query.external_transaction_id) filters.externalTransactionId = query.external_transaction_id;
  if (query.user) filters.user = query.user;
  if (query.user_id) filters.userId = toInt(query.user_id);
  if (query.status) filters.status = query.status;
  if (query.wall_type) filters.wallType = query.wall_type;
  if (query.offer_wall_id) filters.offerWallId = toInt(query.offer_wall_id);
  if (query.origin) filters.origin = query.origin;
  if (query.postback) filters.postback = query.postback;
  if (query.funds) filters.funds = query.funds;

  const minPoints = toNumber(query.min_points);
  const maxPoints = toNumber(query.max_points);
  if (minPoints !== undefined) filters.minPoints = minPoints;
  if (maxPoints !== undefined) filters.maxPoints = maxPoints;

  if (query.date_from) filters.dateFrom = query.date_from;
  if (query.date_to) filters.dateTo = query.date_to;

  if (query.hide_stale_pending === 'true') filters.hideStalePending = true;

  return filters;
};

// ---- row shaping ------------------------------------------------------------

const toPoints = (v) => (v === null || v === undefined ? null : parseFloat(v));

// What the admin may do with a click. Mirrors the checks in reversal.service.js
// so the buttons only appear when the backend would actually accept the action.
// A click can be reversed once and undone once: after an undo, a second reversal
// is refused ("Reversal transaction already exists"), so no Reverse button then.
const resolveActions = (row) => ({
  can_reverse: (row.status === SURVEY_CLICK_STATUS.COMPLETED || row.status === 'locked') && !row.was_undone,
  can_undo: row.status === SURVEY_CLICK_STATUS.REVERSED && !!row.reversal_transaction_id
});

const shapeClickRow = (row) => ({
  ...row,
  cpa_original: toPoints(row.cpa_original),
  cpa_user: toPoints(row.cpa_user),
  credited_amount: toPoints(row.credited_amount),
  reversed_amount: toPoints(row.reversed_amount),
  postback_count: row.postback_count || 0,
  funds_locked: row.credit_status === 'locked',
  ...resolveActions(row)
});

// ---- reads ------------------------------------------------------------------

const getSurveyActivity = async (query = {}) => {
  const pagination = { page: query.page, limit: query.limit };
  const sort = { column: query.sort_by, order: query.sort_order };

  const result = await findSurveyActivity(buildFilters(query), pagination, sort);

  return {
    data: result.data.map(shapeClickRow),
    meta: result.meta
  };
};

const getSurveyActivityStatsSummary = async (query = {}) => {
  const stats = await getSurveyActivityStats(buildFilters(query));

  return {
    ...stats,
    completed_points: toPoints(stats.completed_points),
    reversed_points: toPoints(stats.reversed_points)
  };
};

// Click + its permanent money trail + every request/response that touched it
const getSurveyActivityDetail = async (clickId) => {
  const click = await findClickDetail(clickId);

  if (!click) {
    const err = new Error('Survey click not found');
    err.status = 404;
    throw err;
  }

  const [traffic, money] = await Promise.all([
    findClickTrafficEvents(click),
    findClickMoneyEvents(click.id)
  ]);

  return {
    click: shapeClickRow(click),
    money: money.map((t) => ({ ...t, amount: toPoints(t.amount) })),
    traffic
  };
};

const getSurveyActivityFilterOptions = async () => {
  return await findFilterOptions();
};

// ---- admin actions (thin wrappers — all money logic stays in reversal.service) ----

const reverseSurveyClick = async (clickId, reason, adminId, adminIp) => {
  return await processSingleReversal(
    { clickId },
    reason || DEFAULT_REVERSE_REASON,
    'manual',
    adminId,
    adminIp
  );
};

const undoSurveyClickReversal = async (clickId, adminId, adminIp) => {
  return await undoReversal(clickId, adminId, adminIp);
};

module.exports = {
  getSurveyActivity,
  getSurveyActivityStatsSummary,
  getSurveyActivityDetail,
  getSurveyActivityFilterOptions,
  reverseSurveyClick,
  undoSurveyClickReversal,
  buildFilters
};
