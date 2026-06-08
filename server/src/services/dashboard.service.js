const { getUserBalances, getTransactionStats,  getTotalWithdrawn, getTotalSurveysCompleted, getTotalReferrals } = require('../repositories/dashboard.repository');

const getDashboardStats = async (userId) => {
  // Parallel fetch — no dependencies between queries
  const [
    user,
    txStats,
    totalWithdrawn,
    totalSurveys,
    totalReferrals
  ] = await Promise.all([
    getUserBalances(userId),
    getTransactionStats(userId),
    getTotalWithdrawn(userId),
    getTotalSurveysCompleted(userId),
    getTotalReferrals(userId)
  ]);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return {
    user: {
      public_id: user.public_id,
      username: user.username,
      email: user.email,
      country: user.country,
      referral_code: user.referral_code,
      profile_completion: user.profile_completion
    },
    balance: {
      available: parseFloat(user.balance_available),
      locked: parseFloat(user.balance_locked),
      denied: parseFloat(user.balance_denied)
    },
    lifetime: {
      total_earned: parseFloat(txStats.total_earned),
      total_reversed: parseFloat(txStats.total_reversed),
      total_withdrawn: parseFloat(totalWithdrawn),
      total_surveys_completed: totalSurveys,
      total_referrals: totalReferrals,
      referral_earnings: parseFloat(txStats.referral_earnings)
    }
  };
};

module.exports = { getDashboardStats };