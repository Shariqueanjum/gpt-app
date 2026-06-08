const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 chars').max(20, 'Username cannot exceed 20 chars')
    .regex( /^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscore'),

  email: z.string().trim().toLowerCase().email('Invalid email'),

  password: z.string().min(8, 'Password must be at least 8 chars').max(50, 'Password cannot exceed 50 chars')
    .regex( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, 'Password must contain uppercase, lowercase, number and special character'),
    
  referred_by_code: z.string().trim().max(50, 'Referral code too long').optional()
});

const loginSchema = z.object({
  email_or_username: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email_or_username: z.string().trim().min(1,'Email or username is required')
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  new_password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, 'Password must contain uppercase, lowercase, number and special character')
});

const forgotUsernameSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email')
});


module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, forgotUsernameSchema };