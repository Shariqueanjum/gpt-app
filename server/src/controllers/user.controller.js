const {getProfile, updateProfile, changePassword} = require('../services/user.service');

const getUser = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const result = await getProfile(userId);
    
    res.json({
      success: true,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const result = await updateProfile(req.user.id, req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: result.profile
    });
  } catch (err) {
    next(err);
  }
};

const changeUserPassword = async (req, res, next) => {
  try {
    console.log(req.body);
    const { current_password, new_password } = req.body;
    const result = await changePassword(req.user.id, current_password, new_password);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {getUser, updateUser, changeUserPassword };