const { loginAdmin } = require('../services/admin.service');

const adminLogin = async (req, res, next) => {
  try {
    const result = await loginAdmin(req.body);
    res.json({
      success: true,
      message: 'Admin login successful',
      token: result.token,
      admin: result.admin
    });
  } catch (err) {
    next(err);
  }
};

const adminMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      admin: req.admin
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { adminLogin, adminMe };