const { z, string } = require('zod');

const createPaymentProofSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be greater than 0')
    .refine((val) => {
      const decimal = val.toString().split('.')[1];
      return !decimal || decimal.length <= 2;
    }, 'Amount can have at most 2 decimal places'),

  method: z
    .string()
    .trim()
    .min(1, 'Payment method is required')
    .max(50, 'Method name too long')
});

const approvePaymentProofSchema = z.object({
  reward_points: z
    .number()
    .int()
    .positive('Reward points must be a positive integer')
    .max(10000, 'Reward points too high')
    .optional()
});

const rejectPaymentProofSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Rejection reason is required')
    .max(500, 'Reason too long')
});

module.exports = { createPaymentProofSchema, approvePaymentProofSchema, rejectPaymentProofSchema };