const { getReferralStats } = require('../repositories/referral.repository');
const { findUserById } = require('../repositories/user.repository');

const getMyReferralStats = async (userId) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const stats = await getReferralStats(userId);

  return {
    referral_link: `${process.env.FRONTEND_URL}/register?ref=${user.referral_code}`,
    referral_code: user.referral_code,
    total_referrals: stats.total_referrals,
    total_earned: stats.total_earned,
    referrals: stats.referrals
  };
};

module.exports = { getMyReferralStats };