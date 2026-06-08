const { z } = require('zod');

const TICKET_CATEGORIES = [
  'payment_issue',
  'account_problem',
  'survey_problem',
  'withdrawal_issue',
  'referral_issue',
  'bug_report',
  'feature_request',
  'other'
];

const ALLOWED_SORT_COLUMNS = ['created_at', 'id', 'status'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_LIMIT = 100;

const createTicketSchema = z.object({
  category: z.enum(TICKET_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${TICKET_CATEGORIES.join(', ')}` })
  }),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long')
});

const ticketQuerySchema = z.object({
  // Pagination
  page: z.string().optional().transform((val) => {
      if (!val) return 1;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),

  limit: z.string().optional().transform((val) => {
      if (!val) return 20;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) return 20;
      return parsed > MAX_LIMIT ? MAX_LIMIT : parsed;
    }),

  // Sorting
  sort_by: z.string().trim().toLowerCase().refine((val) => ALLOWED_SORT_COLUMNS.includes(val), {
      message: `sort_by must be one of: ${ALLOWED_SORT_COLUMNS.join(', ')}`
    }).optional() .default('created_at'),

  sort_order: z.string().trim().toLowerCase()
    .refine((val) => ALLOWED_SORT_ORDERS.includes(val), {
      message: `sort_order must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}`
    })
    .optional()
    .default('desc'),

  // Filters
  status: z.string().trim().max(20).optional(),

  id: z.string().optional().transform((val) => {
      if (!val) return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? null : parsed;
    })
    .optional(),

  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be YYYY-MM-DD').optional(),

  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be YYYY-MM-DD').optional()
}).refine((data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to);
  }
  return true;
}, {
  message: 'date_from must be before or equal to date_to',
  path: ['date_to']
});

const adminTicketQuerySchema = z.object({
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

  category: z
    .string()
    .trim()
    .max(50)
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

  search: z
    .string()
    .trim()
    .max(100)
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

const respondTicketSchema = z.object({
  admin_response: z.string().trim().min(1, 'Response is required').max(2000, 'Response too long'),
  status: z.enum(['open', 'closed']).optional()
});

module.exports = { createTicketSchema, ticketQuerySchema, adminTicketQuerySchema, respondTicketSchema };