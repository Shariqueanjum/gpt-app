const pool = require('../config/db');
const { getSettingByKey, upsertSetting, getAllSettings } = require('../repositories/settings.repository');

const DEFAULT_SETTINGS = {
  lock_threshold_points: '300',
  referral_commission_percent: '10',
  daily_bonus_points: '1',
  site_name: 'WABCASH',
  min_withdrawal_points: '500',
  points_to_dollar_rate: '100',
  vpn_detection_enabled: 'false' // 100 points = $1.00
};

const seedSettings = async () => {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await getSettingByKey(key);
    if (!existing) {
      await upsertSetting(key, value);
    }
  }
  return { message: 'Settings seeded successfully' };
};

const getNumericSetting = async (key) => {
  const value = await getSettingByKey(key);
  if (value === null) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

const getStringSetting = async (key) => {
  return await getSettingByKey(key);
};

const getPublicSettings = async () => {
  const allSettings = await getAllSettings();
  
  const publicSettings = {};
  
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const found = allSettings.find(s => s.key === key);
    // Use DB value if exists, fallback to default
    const value = found ? found.value : DEFAULT_SETTINGS[key];
    const numeric = parseFloat(value);
    publicSettings[key] = isNaN(numeric) ? value : numeric;
  }

  return publicSettings;
};

const updateSettings = async (settingsObj, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updated = [];

    for (const [key, value] of Object.entries(settingsObj)) {
      await upsertSetting(client, key, value);
      updated.push({ key, value });
    }

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'update_settings',
        'settings',
        0,
        JSON.stringify({ updated_keys: Object.keys(settingsObj), values: settingsObj }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return { updated };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { seedSettings, getNumericSetting, getStringSetting, getAllSettings, getPublicSettings, updateSettings};