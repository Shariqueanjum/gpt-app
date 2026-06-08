const { z } = require('zod');

const ALLOWED_SETTINGS_KEYS = [
  'site_name',
  'lock_threshold_points',
  'referral_commission_percent',
  'daily_bonus_points',
  'min_withdrawal_points',
  'points_to_dollar_rate'
];

const updateSettingsSchema = z.object({
  settings: z.record(
    z.string().min(1, 'Value cannot be empty').max(500, 'Value too long')
  ).refine((obj) => {
    const keys = Object.keys(obj);
    return keys.every(k => ALLOWED_SETTINGS_KEYS.includes(k));
  }, {
    message: `Only these keys are allowed: ${ALLOWED_SETTINGS_KEYS.join(', ')}`
  })
});

module.exports = { updateSettingsSchema, ALLOWED_SETTINGS_KEYS };