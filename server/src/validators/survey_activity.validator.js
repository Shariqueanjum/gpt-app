const { z } = require('zod');

const MAX_LIMIT = 100;
const SORT_COLUMNS = ['created_at', 'updated_at', 'cpa_user', 'id'];
const SORT_ORDERS = ['asc', 'desc'];
const WALL_TYPES = ['iframe', 'router', 'api'];
const ORIGINS = ['direct', 'auto_created'];
const POSTBACK_STATES = ['received', 'none'];
const FUNDS_STATES = ['locked', 'available'];

// The admin UI omits empty filters, but a hand-typed URL may send "" — treat as "not set"
const blankOr = (schema) => z.union([z.literal(''), schema]).optional();

const textFilter = blankOr(z.string().trim().max(100, 'Search text too long'));
const intFilter = (label) => blankOr(z.string().regex(/^\d+$/, `${label} must be a whole number`));
const pointsFilter = (label) => blankOr(z.string().regex(/^\d+(\.\d{1,2})?$/, `${label} must be a number`));
const dateFilter = (label) => blankOr(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be YYYY-MM-DD`));

// Shape shared by the list and stats endpoints so both always see the same filters
const surveyActivityFilterShape = {
  // The two ID searches the admin uses to find a survey before reversing it
  transaction_id: textFilter,
  external_transaction_id: textFilter,

  // username / email / public id in one box
  user: textFilter,
  user_id: intFilter('user_id'),

  status: blankOr(z.string().trim().regex(/^[a-z_]{1,30}$/, 'Invalid status')),
  wall_type: blankOr(z.enum(WALL_TYPES)),
  offer_wall_id: intFilter('offer_wall_id'),
  origin: blankOr(z.enum(ORIGINS)),
  postback: blankOr(z.enum(POSTBACK_STATES)),
  funds: blankOr(z.enum(FUNDS_STATES)),

  min_points: pointsFilter('min_points'),
  max_points: pointsFilter('max_points'),

  date_from: dateFilter('date_from'),
  date_to: dateFilter('date_to'),

  hide_stale_pending: blankOr(z.enum(['true', 'false']))
};

const dateOrderRule = (data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to);
  }
  return true;
};
const dateOrderIssue = { message: 'date_from must be before or equal to date_to', path: ['date_to'] };

const surveyActivityStatsQuerySchema = z.object(surveyActivityFilterShape).refine(dateOrderRule, dateOrderIssue);

const surveyActivityQuerySchema = z.object({
  page: intFilter('page'),
  limit: blankOr(z.string().regex(/^\d+$/, 'limit must be a whole number')
    .refine((v) => parseInt(v, 10) >= 1 && parseInt(v, 10) <= MAX_LIMIT, `limit must be 1-${MAX_LIMIT}`)),
  sort_by: blankOr(z.enum(SORT_COLUMNS)),
  sort_order: blankOr(z.enum(SORT_ORDERS)),
  ...surveyActivityFilterShape
}).refine(dateOrderRule, dateOrderIssue);

const clickIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid survey click id')
});

const reverseSurveyClickSchema = z.object({
  reason: z.string().trim().max(500, 'Reason too long').optional()
});

module.exports = {
  surveyActivityQuerySchema,
  surveyActivityStatsQuerySchema,
  clickIdParamSchema,
  reverseSurveyClickSchema,
  MAX_LIMIT,
  SORT_COLUMNS
};
