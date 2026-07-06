const { z } = require('zod');

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').max(50, 'Field name too long'),
  label: z.string().min(1, 'Field label is required').max(100, 'Field label too long'),
  placeholder: z.string().max(200, 'Placeholder too long').optional().default('')
});

const createPaymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  code: z.string().min(1, 'Code is required').max(50, 'Code too long')
    .regex(/^[a-z0-9_]+$/, 'Code must be lowercase letters, numbers, and underscores only'),
  min_amount: z.number().min(0, 'Min amount must be 0 or more').optional().default(0),
  max_amount: z.number().min(1, 'Max amount must be at least 1').optional().default(999999),
  processing_fee: z.number().min(0, 'Fee cannot be negative').optional().default(0),
  instructions: z.string().max(500, 'Instructions too long').optional().default(''),
  display_order: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
  required_fields: z.array(fieldSchema).optional().default([])
});

const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(1).optional(),
  processing_fee: z.number().min(0).optional(),
  instructions: z.string().max(500).optional(),
  display_order: z.number().int().min(0).optional(),
  required_fields: z.array(fieldSchema).optional()
});

const toggleStatusSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform((v) => parseInt(v, 10))
});

module.exports = {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  toggleStatusSchema
};