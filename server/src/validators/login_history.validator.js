const { z } = require('zod');

const ALLOWED_SORT_COLUMNS = ['created_at', 'id', 'status', 'ip_address', 'user_id'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_LIMIT = 100;

const loginHistoryQuerySchema = z.object({
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
      if (!val) return 20;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) return 20;
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
  status: z
    .string()
    .trim()
    .max(20)
    .optional(),

  ip_address: z
    .string()
    .trim()
    .max(45)
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
  // If both dates provided, date_from must be <= date_to
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to);
  }
  return true;
}, {
  message: 'date_from must be before or equal to date_to',
  path: ['date_to']
});

module.exports = { loginHistoryQuerySchema };