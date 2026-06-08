const TRANSACTION_TYPES = Object.freeze({
  SURVEY: 'survey',
  REFERRAL: 'referral',
  BONUS: 'bonus',
  DAILY_BONUS: 'daily_bonus',
  REVERSAL: 'reversal',
  ADJUSTMENT: 'adjustment',
  PROMO: 'promo',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
  PAYMENT_PROOF_REWARD: 'payment_proof_reward',
  LEVEL_UP_BONUS: 'level_up_bonus',
  FRAUD_DEDUCTION: 'fraud_deduction',
  UNDO_REVERSAL: 'undo_reversal'
});

const TRANSACTION_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  LOCKED: 'locked',
  REVERSED: 'reversed',
  CANCELLED: 'cancelled'
});

const SURVEY_CLICK_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  QUOTA_FULL: 'quota_full',
  SECURITY_TERMINATED: 'security_terminated',
  REVERSED: 'reversed'
});

const WITHDRAWAL_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  REJECTED: 'rejected'
});

module.exports = { TRANSACTION_TYPES, TRANSACTION_STATUS, SURVEY_CLICK_STATUS, WITHDRAWAL_STATUS };