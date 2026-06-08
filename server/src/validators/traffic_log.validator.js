const { z } = require('zod');

const ALLOWED_SORT_COLUMNS = ['created_at', 'id'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_LIMIT = 200;

const trafficLogQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 50;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) return 50;
      return parsed > MAX_LIMIT ? MAX_LIMIT : parsed;
    }),

  // Sorting
  sort_by: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ALLOWED_SORT_COLUMNS.includes(val), {
      message: `sort_by must be one of: ${ALLOWED_SORT_COLUMNS.join(', ')}`
    })
    .optional()
    .default('created_at'),

  sort_order: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ALLOWED_SORT_ORDERS.includes(val), {
      message: `sort_order must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}`
    })
    .optional()
    .default('desc'),

  // Filters
  direction: z
    .enum(['outgoing', 'incoming'])
    .optional(),

  type: z
    .enum(['survey_click', 's2s_callback', 'browser_callback', 'api_request', 'redirect'])
    .optional(),

  user_id: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? null : parsed;
    })
    .optional(),

  offer_wall_id: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? null : parsed;
    })
    .optional(),

  internal_transaction_id: z
    .string()
    .trim()
    .max(100)
    .optional(),

  external_transaction_id: z
    .string()
    .trim()
    .max(100)
    .optional(),

  status_code: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    })
    .optional(),

  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be YYYY-MM-DD')
    .optional(),

  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be YYYY-MM-DD')
    .optional()
}).refine((data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to);
  }
  return true;
}, {
  message: 'date_from must be before or equal to date_to',
  path: ['date_to']
});

module.exports = { trafficLogQuerySchema };