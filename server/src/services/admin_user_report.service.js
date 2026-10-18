const repo = require('../repositories/admin_user_report.repository');

const num = (v) => parseFloat(v) || 0;

const notFound = () => {
  const err = new Error('User not found');
  err.status = 404;
  return err;
};

// Treat '' as "not set" so hand-typed URLs behave like the UI
const clean = (query = {}) => {
  const out = {};
  Object.keys(query).forEach((k) => {
    const v = query[k];
    if (typeof v === 'string' && v.trim() !== '') out[k] = v.trim();
  });
  return out;
};

/**
 * One call that powers the whole top part of the drawer:
 * identity, balances, earnings, reversals, net, provider table, withdrawals, reconciliation.
 * All amounts are in POINTS (100 points = $1; the UI converts for display).
 */
const getUserOverview = async (userId) => {
  const identity = await repo.getUserIdentity(userId);
  if (!identity) throw notFound();

  const [earn, rev, wd, providers, referredCount, providerOptions, methodOptions] = await Promise.all([
    repo.getEarningTotals(userId),
    repo.getReversalTotals(userId),
    repo.getWithdrawalTotals(userId),
    repo.getProviderBreakdown(userId),
    repo.getReferredCount(userId),
    repo.getProviderOptions(),
    repo.getWithdrawalMethodOptions(userId)
  ]);

  const surveyEarned = num(earn.survey_earned);
  const referralEarned = num(earn.referral_earned);
  const bonusEarned = num(earn.bonus_earned);
  const totalEarning = surveyEarned + referralEarned + bonusEarned;

  const surveyReversed = num(rev.survey_points);
  const referralReversed = num(rev.referral_points);
  const totalReversed = surveyReversed + referralReversed;

  const netAmount = totalEarning - totalReversed;
  const adjustments = num(earn.adjustments_net);

  const available = num(identity.balance_available);
  const locked = num(identity.balance_locked);
  const denied = num(identity.balance_denied);
  const pendingWithdrawal = wd.pending.points + wd.processing.points;
  const paid = wd.paid.points;

  // Accounting check: everything the user ever got must equal what he holds + what he took out
  const expectedTotal = netAmount + adjustments;
  const actualTotal = available + locked + pendingWithdrawal + paid;
  const difference = parseFloat((actualTotal - expectedTotal).toFixed(2));

  return {
    user: {
      id: identity.id,
      public_id: identity.public_id,
      username: identity.username,
      email: identity.email,
      full_name: identity.full_name,
      country: identity.country,
      level: identity.level || 1,
      current_streak: identity.current_streak || 0,
      is_active: identity.is_active,
      is_verified: identity.is_verified,
      ban_reason: identity.ban_reason,
      banned_at: identity.banned_at,
      referral_code: identity.referral_code,
      created_at: identity.created_at,
      last_login_at: identity.last_login_at,
      referred_by: identity.referrer_id
        ? { id: identity.referrer_id, username: identity.referrer_username, public_id: identity.referrer_public_id }
        : null
    },
    balances: {
      available,
      locked,
      denied,
      pending_withdrawal: pendingWithdrawal
    },
    earnings: {
      surveys: surveyEarned,
      referrals: referralEarned,
      bonuses: bonusEarned,
      total: totalEarning,
      admin_adjustments: adjustments
    },
    reversals: {
      survey_points: surveyReversed,
      survey_count: rev.survey_count,
      referral_points: referralReversed,
      referral_count: rev.referral_count,
      total: totalReversed
    },
    net_amount: netAmount,
    surveys: {
      completed_count: earn.surveys_credited,
      reversed_count: rev.survey_count,
      by_provider: providers
    },
    referrals: {
      referred_count: referredCount,
      commission_earned: referralEarned,
      commission_reversed: referralReversed
    },
    withdrawals: {
      pending: wd.pending,
      processing: wd.processing,
      paid: wd.paid,
      rejected: wd.rejected,
      total_paid: paid,
      total_pending: pendingWithdrawal
    },
    check: { expected_total: expectedTotal, actual_total: actualTotal, difference },
    filter_options: { providers: providerOptions, withdrawal_methods: methodOptions }
  };
};

const assertUserExists = async (userId) => {
  const identity = await repo.getUserIdentity(userId);
  if (!identity) throw notFound();
};

const listSurveyHistory = async (userId, query) => { await assertUserExists(userId); return repo.getSurveyHistory(userId, clean(query)); };
const listBonusHistory = async (userId, query) => { await assertUserExists(userId); return repo.getBonusHistory(userId, clean(query)); };
const listReversalHistory = async (userId, query) => { await assertUserExists(userId); return repo.getReversalHistory(userId, clean(query)); };
const listWithdrawalHistory = async (userId, query) => { await assertUserExists(userId); return repo.getWithdrawalHistory(userId, clean(query)); };
const listReferredUsers = async (userId, query) => { await assertUserExists(userId); return repo.getReferredUsers(userId, clean(query)); };

module.exports = {
  getUserOverview, listSurveyHistory, listBonusHistory, listReversalHistory,
  listWithdrawalHistory, listReferredUsers, clean
};
