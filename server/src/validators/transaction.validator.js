const { z } = require('zod');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

const ALLOWED_SORT_COLUMNS = ['created_at', 'id', 'amount'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_LIMIT = 100;

const ALLOWED_TYPES = Object.values(TRANSACTION_TYPES);
const ALLOWED_STATUSES = Object.values(TRANSACTION_STATUS);

const transactionQuerySchema = z.object({
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

  type: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ALLOWED_TYPES.includes(val), {
      message: `type must be one of: ${ALLOWED_TYPES.join(', ')}`
    })
    .optional(),

  status: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ALLOWED_STATUSES.includes(val), {
      message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`
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

module.exports = {
  transactionQuerySchema
};