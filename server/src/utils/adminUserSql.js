// ============================================================
// adminUserSql.js — reusable SQL fragments for the admin
// "single user money report". Kept in one place so the report
// repository and the locked-balance repository always agree on
// what "reversed" and "earning" mean.
//
// IMPORTANT: every fragment is a constant string built only from
// hard-coded SQL — no user input is ever concatenated into SQL.
// User values are always passed as $n parameters by callers.
// ============================================================

// Transaction types that count as money the user EARNED
const SURVEY_TYPES = ['survey'];
const REFERRAL_TYPES = ['referral'];
const BONUS_TYPES = ['daily_bonus', 'bonus', 'level_up_bonus', 'promo', 'payment_proof_reward'];

// Types shown in the "Bonuses & Adjustments" history.
// payment_proof_reward is intentionally NOT listed (feature unused by users).
const BONUS_HISTORY_TYPES = ['daily_bonus', 'bonus', 'level_up_bonus', 'promo', 'adjustment', 'fraud_deduction', 'refund'];

// Admin corrections (can be + or -)
const ADJUSTMENT_TYPES = ['adjustment', 'fraud_deduction'];

// Safe integer cast of a JSON text field (returns NULL instead of throwing)
const safeInt = (expr) => `(CASE WHEN ${expr} ~ '^[0-9]{1,9}$' THEN (${expr})::int END)`;

// The survey-click id a referral transaction came from
const referralClickId = (alias) => safeInt(`${alias}.metadata->>'from_survey_click'`);

/**
 * TRUE when reversal transaction `rt` is still in force (not undone).
 *  - survey reversal : undo row has same survey_click reference
 *  - referral reversal: reference_id is the referral tx; its undo row
 *    carries the survey click id (see reversal.service undoReversal)
 */
const reversalIsActive = (rt) => `NOT EXISTS (
  SELECT 1 FROM transactions ut
  WHERE ut.type = 'undo_reversal'
    AND ut.user_id = ${rt}.user_id
    AND (
      (${rt}.reference_type = 'survey_click'
        AND ut.reference_type = 'survey_click'
        AND ut.reference_id = ${rt}.reference_id)
      OR
      (${rt}.reference_type = 'referral'
        AND ut.reference_type = 'referral'
        AND ut.reference_id = (
          SELECT ${referralClickId('src')} FROM transactions src WHERE src.id = ${rt}.reference_id
        ))
    )
)`;

// TRUE when survey transaction `t` has an active (not undone) reversal
const surveyIsReversed = (t) => `EXISTS (
  SELECT 1 FROM transactions rv
  WHERE rv.type = 'reversal'
    AND rv.user_id = ${t}.user_id
    AND rv.reference_type = 'survey_click'
    AND rv.reference_id = ${t}.reference_id
    AND ${reversalIsActive('rv')}
)`;

// TRUE when referral-commission transaction `t` has an active reversal
const referralIsReversed = (t) => `EXISTS (
  SELECT 1 FROM transactions rv
  WHERE rv.type = 'reversal'
    AND rv.user_id = ${t}.user_id
    AND rv.reference_type = 'referral'
    AND rv.reference_id = ${t}.id
    AND ${reversalIsActive('rv')}
)`;

// Escape LIKE wildcards so a search for "50%" does not match everything
const escapeLike = (value) => String(value).replace(/[\\%_]/g, (m) => `\\${m}`);

module.exports = {
  SURVEY_TYPES, REFERRAL_TYPES, BONUS_TYPES, BONUS_HISTORY_TYPES, ADJUSTMENT_TYPES,
  safeInt, referralClickId, reversalIsActive, surveyIsReversed, referralIsReversed, escapeLike
};
