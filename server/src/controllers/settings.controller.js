const { getPublicSettings, updateSettings} = require('../services/settings.service');

const getSettings = async (req, res, next) => {
  try {
    const settings = await getPublicSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

const updateAdminSettings = async (req, res, next) => {
  try {
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection?.remoteAddress || 'unknown';

    const result = await updateSettings(req.body.settings, adminId, adminIp);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: result.updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateAdminSettings};