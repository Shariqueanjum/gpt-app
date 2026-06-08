const { z } = require('zod');

const requestWithdrawalSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .refine((val) => {
      const decimal = val.toString().split('.')[1];
      return !decimal || decimal.length <= 2;
    }, 'Amount can have at most 2 decimal places'),

  method_code: z
    .string()
    .trim()
    .min(1, 'Payment method is required')
    .max(20, 'Method code too long'),

  method_details: z
    .record(z.string().min(1))
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Method details cannot be empty'
    })
});

module.exports = {
  requestWithdrawalSchema
};