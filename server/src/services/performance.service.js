const { getSurveyClickStats, getEarningsByOfferWall, getMonthlyStats } = require('../repositories/performance.repository');
const { getUserBalances } = require('../repositories/dashboard.repository');
const { getTransactionStats, getTotalWithdrawn } = require('../repositories/dashboard.repository');

const getUserPerformance = async (userId) => {
  const [
    clickStats,
    earningsByWall,
    monthlyStats,
    balances,
    txStats,
    totalWithdrawn
  ] = await Promise.all([
    getSurveyClickStats(userId),
    getEarningsByOfferWall(userId),
    getMonthlyStats(userId),
    getUserBalances(userId),
    getTransactionStats(userId),
    getTotalWithdrawn(userId)
  ]);

  const totalClicks = parseInt(clickStats.total_clicks) || 0;
  const completed = parseInt(clickStats.completed) || 0;
  const reversed = parseInt(clickStats.reversed) || 0;

  const completionRate = totalClicks > 0 ? ((completed / totalClicks) * 100).toFixed(2) : 0;
  const reversalRate = completed > 0 ? ((reversed / completed) * 100).toFixed(2) : 0;

  const totalEarned = parseFloat(txStats.total_earned) || 0;
  const totalReversed = parseFloat(txStats.total_reversed) || 0;
  const referralEarnings = parseFloat(txStats.referral_earnings) || 0;
  const withdrawn = parseFloat(totalWithdrawn) || 0;

  return {
    user: {
      public_id: balances.public_id,
      username: balances.username,
      country: balances.country
    },
    surveys: {
      total_clicks: totalClicks,
      completed: completed,
      failed: parseInt(clickStats.failed) || 0,
      quota_full: parseInt(clickStats.quota_full) || 0,
      security_terminated: parseInt(clickStats.security_terminated) || 0,
      reversed: reversed,
      completion_rate: parseFloat(completionRate),
      reversal_rate: parseFloat(reversalRate)
    },
    earnings: {
      total_earned: totalEarned,
      total_reversed: totalReversed,
      net_earned: (totalEarned - totalReversed).toFixed(2),
      referral_earnings: referralEarnings,
      total_withdrawn: withdrawn,
      balance_available: parseFloat(balances.balance_available),
      balance_locked: parseFloat(balances.balance_locked),
      balance_denied: parseFloat(balances.balance_denied)
    },
    offer_walls: earningsByWall,
    monthly_breakdown: monthlyStats
  };
};

module.exports = { getUserPerformance };