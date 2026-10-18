const { z } = require('zod');

const MAX_LIMIT = 100;
const MAX_INT = 2147483647;

// Admin UI omits empty filters, but a hand-typed URL may send "" — treat as "not set"
const blankOr = (schema) => z.union([z.literal(''), schema]).optional();

const intText = (label) =>
  z.string().regex(/^\d{1,10}$/, `${label} must be a whole number`)
    .refine((v) => Number(v) <= MAX_INT, `${label} is too large`);

const textFilter = blankOr(z.string().trim().max(100, 'Search text too long'));
const intFilter = (label) => blankOr(intText(label));
const pointsFilter = (label) => blankOr(z.string().regex(/^\d{1,9}(\.\d{1,2})?$/, `${label} must be a number`));
const dateFilter = (label) => blankOr(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be YYYY-MM-DD`));
const slug = (label) => blankOr(z.string().trim().regex(/^[a-z_]{1,30}$/, `Invalid ${label}`));

const pagingShape = {
  page: intFilter('page'),
  limit: blankOr(intText('limit').refine((v) => Number(v) >= 1 && Number(v) <= MAX_LIMIT, `limit must be 1-${MAX_LIMIT}`)),
  sort_order: blankOr(z.enum(['asc', 'desc']))
};

const dateShape = { date_from: dateFilter('date_from'), date_to: dateFilter('date_to') };
const pointsShape = { min_points: pointsFilter('min_points'), max_points: pointsFilter('max_points') };

const dateOrderRule = (d) => !(d.date_from && d.date_to) || new Date(d.date_from) <= new Date(d.date_to);
const pointsOrderRule = (d) => !(d.min_points && d.max_points) || Number(d.min_points) <= Number(d.max_points);
const dateIssue = { message: 'date_from must be before or equal to date_to', path: ['date_to'] };
const pointsIssue = { message: 'min_points must be less than or equal to max_points', path: ['max_points'] };

const withRules = (shape) =>
  z.object(shape).refine(dateOrderRule, dateIssue).refine(pointsOrderRule, pointsIssue);

const userIdParamSchema = z.object({ id: intText('user id') });

const surveyHistoryQuerySchema = withRules({
  ...pagingShape, ...dateShape, ...pointsShape,
  sort_by: blankOr(z.enum(['created_at', 'amount'])),
  status: blankOr(z.enum(['completed', 'locked', 'reversed'])),
  offer_wall_id: intFilter('offer_wall_id'),
  search: textFilter
});

const bonusHistoryQuerySchema = withRules({
  ...pagingShape, ...dateShape, ...pointsShape,
  sort_by: blankOr(z.enum(['created_at', 'amount'])),
  type: blankOr(z.enum(['daily_bonus', 'bonus', 'level_up_bonus', 'promo', 'adjustment', 'fraud_deduction', 'refund'])),
  direction: blankOr(z.enum(['credit', 'debit']))
});

const reversalHistoryQuerySchema = withRules({
  ...pagingShape, ...dateShape, ...pointsShape,
  sort_by: blankOr(z.enum(['created_at', 'amount'])),
  kind: blankOr(z.enum(['survey', 'referral'])),
  state: blankOr(z.enum(['active', 'undone'])),
  source: blankOr(z.enum(['callback', 'manual', 'csv'])),
  offer_wall_id: intFilter('offer_wall_id'),
  search: textFilter
});

const withdrawalHistoryQuerySchema = withRules({
  ...pagingShape, ...dateShape, ...pointsShape,
  sort_by: blankOr(z.enum(['created_at', 'amount'])),
  status: blankOr(z.enum(['pending', 'processing', 'paid', 'rejected'])),
  method: slug('method'),
  search: textFilter
});

const referredUsersQuerySchema = withRules({
  ...pagingShape, ...dateShape,
  sort_by: blankOr(z.enum(['joined', 'earned'])),
  search: textFilter
});

const allActivityQuerySchema = z.object({
  ...pagingShape, ...dateShape,
  sort_by: blankOr(z.enum(['created_at', 'amount'])),
  type: slug('type'),
  status: blankOr(z.enum(['pending', 'completed', 'locked', 'reversed', 'cancelled']))
}).refine(dateOrderRule, dateIssue);

const unlockLockedSchema = z.object({
  // Either unlock every locked item (all: true) or an explicit list of transaction ids
  all: z.boolean().optional(),
  transaction_ids: z.array(z.number().int().positive().max(MAX_INT)).min(1).max(200).optional()
}).refine((d) => d.all === true || (d.transaction_ids && d.transaction_ids.length > 0), {
  message: 'Choose "all" or at least one locked item', path: ['transaction_ids']
});

const undoUnlockSchema = z.object({
  unlock_transaction_id: z.number().int().positive().max(MAX_INT)
});

module.exports = {
  userIdParamSchema, surveyHistoryQuerySchema, bonusHistoryQuerySchema, reversalHistoryQuerySchema,
  withdrawalHistoryQuerySchema, referredUsersQuerySchema, allActivityQuerySchema,
  unlockLockedSchema, undoUnlockSchema, MAX_LIMIT
};
