const { z } = require('zod');

// No body validation needed for GET, but keeping file for future validators
const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 chars').max(100).optional(),
  phone: z.string().trim().min(10, 'Invalid phone number').max(15).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().trim().max(255).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  upi_id: z.string().trim().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/, 'Invalid UPI ID').optional()
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 chars').max(50)
});

module.exports = { updateProfileSchema, changePasswordSchema };