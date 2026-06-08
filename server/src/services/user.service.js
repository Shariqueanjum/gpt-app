const bcrypt = require('bcryptjs');
const {findUserById, updateUserProfile, updatePassword} = require('../repositories/user.repository');

const getProfile = async (userId) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Remove sensitive fields
  const { password_hash, ...safeUser } = user;
  
  return { user: safeUser };
};

const updateProfile = async (userId, data) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const merged = {
    full_name: data.full_name !== undefined ? data.full_name : user.full_name,
    phone: data.phone !== undefined ? data.phone : user.phone,
    dob: data.dob !== undefined ? data.dob : user.dob,
    gender: data.gender !== undefined ? data.gender : user.gender,
    address: data.address !== undefined ? data.address : user.address,
    country: data.country !== undefined ? data.country : user.country,
    upi_id: data.upi_id !== undefined ? data.upi_id : user.upi_id
  };

  // Calculate profile completion (base 20 for registration)
  let completion = 20;
  if (merged.full_name) completion += 15;
  if (merged.phone) completion += 15;
  if (merged.dob) completion += 15;
  if (merged.gender) completion += 10;
  if (merged.address) completion += 10;
  if (merged.country) completion += 5;
  if (merged.upi_id) completion += 10;

  const updated = await updateUserProfile(null, userId, {
    ...data,
    profile_completion: completion
  });

  const { password_hash, ...safeUser } = updated;
  
  return { profile: safeUser };
};

const changePassword = async (userId, current_password, new_password) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Verify current password
  const isMatch = await bcrypt.compare(current_password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.status = 400;
    throw error;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(new_password, salt);
  console.log(newHash,"Newly hashed paaword");
  await updatePassword(userId, newHash);
  
  return { message: 'Password changed successfully' };
};

module.exports = {getProfile, updateProfile, changePassword};