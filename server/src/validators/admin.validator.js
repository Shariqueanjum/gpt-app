const { z } = require('zod');

const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

const approveWithdrawalSchema = z.object({
  bank_transaction_id: z.string().trim().min(1, 'Bank transaction ID is required').max(100, 'Bank transaction ID too long')
});

const rejectWithdrawalSchema = z.object({
  reason: z.string().trim().min(1, 'Rejection reason is required').max(500, 'Reason too long')
});

const banUserSchema = z.object({
  reason: z.string().trim().max(500, 'Reason too long').optional().default('No reason provided')
});

const adjustBalanceSchema = z.object({
  amount: z.number().refine((val) => val !== 0, 'Amount cannot be zero'),
  reason: z.string().trim().min(1, 'Reason is required').max(500, 'Reason too long')
});


module.exports = { adminLoginSchema, approveWithdrawalSchema, rejectWithdrawalSchema, banUserSchema, adjustBalanceSchema };