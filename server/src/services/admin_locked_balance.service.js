const pool = require('../config/db');
const { getLockedSurveys, getLockedSurveyById, getAllSurveysForAdmin } = require('../repositories/admin_locked_balance.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

/**
 * List all locked surveys with referral info for admin
 */
const listLockedSurveys = async (query = {}) => {
  const filters = {};
  if (query.user_id) filters.user_id = query.user_id;
  if (query.offer_wall_id) filters.offer_wall_id = query.offer_wall_id;
  if (query.date_from && query.date_to) {
    filters.date_from = query.date_from;
    filters.date_to = query.date_to;
  }
  if (query.search) filters.search = query.search;

  const pagination = {
    page: query.page,
    limit: query.limit
  };

  return await getLockedSurveys(filters, pagination);
};

/**
 * List all surveys (completed + locked) for admin history
 */
const listAllSurveys = async (query = {}) => {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.user_id) filters.user_id = query.user_id;
  if (query.date_from && query.date_to) {
    filters.date_from = query.date_from;
    filters.date_to = query.date_to;
  }
  if (query.search) filters.search = query.search;

  const pagination = {
    page: query.page,
    limit: query.limit
  };

  return await getAllSurveysForAdmin(filters, pagination);
};

/**
 * Unlock a locked survey — moves from locked balance to available balance
 * Also unlocks the referral commission if present
 */
const unlockLockedSurvey = async (transactionId, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get the locked survey with full details
    const lockedSurvey = await getLockedSurveyById(transactionId);

    if (!lockedSurvey) {
      const err = new Error('Locked survey not found');
      err.status = 404;
      throw err;
    }

    // 2. Verify it's still locked
    if (lockedSurvey.transaction_status !== 'locked') {
      const err = new Error(`Survey is not locked. Current status: ${lockedSurvey.transaction_status}`);
      err.status = 400;
      throw err;
    }

    // 3. Check if already unlocked (shouldn't happen if status is locked, but safety check)
    const existingUnlock = await client.query(
      `SELECT id FROM transactions 
       WHERE type = 'unlock' AND reference_id = $1 AND reference_type = 'survey_click'
       LIMIT 1`,
      [lockedSurvey.survey_click_id]
    );

    if (existingUnlock.rows.length > 0) {
      const err = new Error('This survey has already been unlocked');
      err.status = 400;
      throw err;
    }

    const surveyAmount = parseFloat(lockedSurvey.survey_amount);
    const referralAmount = lockedSurvey.referral_amount ? parseFloat(lockedSurvey.referral_amount) : 0;

    // 4. LOCK user row and move from locked to available
    await client.query(
      `SELECT balance_locked, balance_available FROM users WHERE id = $1 FOR UPDATE`,
      [lockedSurvey.user_id]
    );

    await client.query(
      `UPDATE users 
       SET balance_locked = balance_locked - $1,
           balance_available = balance_available + $1
       WHERE id = $2`,
      [surveyAmount, lockedSurvey.user_id]
    );

    // 5. Update survey transaction status to completed
    await client.query(
      `UPDATE transactions 
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [transactionId]
    );

    // 6. Create unlock audit transaction for user
    const userUnlockTx = await createTransaction(client, {
      user_id: lockedSurvey.user_id,
      type: TRANSACTION_TYPES.UNLOCK,
      offer_wall_id: lockedSurvey.survey_metadata?.offer_wall_id || null,
      reference_type: 'survey_click',
      reference_id: lockedSurvey.survey_click_id,
      amount: surveyAmount,
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: null,
      referrer_earned: 0,
      status: TRANSACTION_STATUS.COMPLETED,
      metadata: {
        original_survey_transaction_id: transactionId,
        original_amount: surveyAmount,
        reason: 'Admin unlocked locked survey balance',
        admin_id: adminId,
        moved_from: 'balance_locked',
        moved_to: 'balance_available'
      }
    });

    // 7. Handle referral unlock if exists
    let referralUnlockTx = null;
    if (lockedSurvey.referral_transaction_id && referralAmount > 0) {
      // LOCK referrer row
      await client.query(
        `SELECT balance_locked, balance_available FROM users WHERE id = $1 FOR UPDATE`,
        [lockedSurvey.referrer_user_id]
      );

      // Move referrer's locked commission to available
      await client.query(
        `UPDATE users 
         SET balance_locked = balance_locked - $1,
             balance_available = balance_available + $1
         WHERE id = $2`,
        [referralAmount, lockedSurvey.referrer_user_id]
      );

      // Update referral transaction status to completed
      await client.query(
        `UPDATE transactions 
         SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [lockedSurvey.referral_transaction_id]
      );

      // Create unlock audit transaction for referrer
      referralUnlockTx = await createTransaction(client, {
        user_id: lockedSurvey.referrer_user_id,
        type: TRANSACTION_TYPES.UNLOCK,
        offer_wall_id: null,
        reference_type: 'referral',
        reference_id: lockedSurvey.referral_transaction_id,
        amount: referralAmount,
        commission_earned: 0,
        commission_rate_at_time: null,
        referrer_id: null,
        referrer_earned: 0,
        status: TRANSACTION_STATUS.COMPLETED,
        metadata: {
          original_referral_transaction_id: lockedSurvey.referral_transaction_id,
          original_survey_transaction_id: transactionId,
          original_amount: referralAmount,
          reason: 'Admin unlocked locked referral commission',
          admin_id: adminId,
          moved_from: 'balance_locked',
          moved_to: 'balance_available',
          referred_user_id: lockedSurvey.user_id,
          referred_username: lockedSurvey.username
        }
      });
    }

    // 8. Log admin action
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'unlock_locked_survey',
        'survey_click',
        lockedSurvey.survey_click_id,
        JSON.stringify({
          transaction_id: transactionId,
          survey_amount: surveyAmount,
          referral_amount: referralAmount,
          user_id: lockedSurvey.user_id,
          referrer_id: lockedSurvey.referrer_user_id,
          user_unlock_transaction_id: userUnlockTx.id,
          referral_unlock_transaction_id: referralUnlockTx?.id || null
        }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      unlocked: true,
      transaction_id: transactionId,
      survey_click_id: lockedSurvey.survey_click_id,
      user_id: lockedSurvey.user_id,
      username: lockedSurvey.username,
      survey_amount: surveyAmount,
      referral_amount: referralAmount,
      referrer_id: lockedSurvey.referrer_user_id,
      referrer_username: lockedSurvey.referrer_username,
      user_unlock_transaction_id: userUnlockTx.id,
      referral_unlock_transaction_id: referralUnlockTx?.id || null
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Reverse a locked survey — deducts from locked balance (not available)
 * Also reverses the referral commission from locked balance
 */
const reverseLockedSurvey = async (transactionId, reason, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get the locked survey
    const lockedSurvey = await getLockedSurveyById(transactionId);

    if (!lockedSurvey) {
      const err = new Error('Locked survey not found');
      err.status = 404;
      throw err;
    }

    if (lockedSurvey.transaction_status !== 'locked') {
      const err = new Error(`Survey is not locked. Current status: ${lockedSurvey.transaction_status}`);
      err.status = 400;
      throw err;
    }

    // 2. Check if already reversed
    const existingReversal = await client.query(
      `SELECT id FROM transactions 
       WHERE type = 'reversal' AND reference_id = $1 AND reference_type = 'survey_click'
       LIMIT 1`,
      [lockedSurvey.survey_click_id]
    );

    if (existingReversal.rows.length > 0) {
      const err = new Error('This survey has already been reversed');
      err.status = 400;
      throw err;
    }

    const surveyAmount = parseFloat(lockedSurvey.survey_amount);
    const referralAmount = lockedSurvey.referral_amount ? parseFloat(lockedSurvey.referral_amount) : 0;

    // 3. LOCK user row and deduct from locked balance
    await client.query(
      `SELECT balance_locked, balance_available FROM users WHERE id = $1 FOR UPDATE`,
      [lockedSurvey.user_id]
    );

    await client.query(
      `UPDATE users 
       SET balance_locked = balance_locked - $1
       WHERE id = $2`,
      [surveyAmount, lockedSurvey.user_id]
    );

    // 4. Update survey transaction status to reversed
    await client.query(
      `UPDATE transactions 
       SET status = 'reversed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [transactionId]
    );

    // 5. Create reversal transaction for user
    const userReversalTx = await createTransaction(client, {
      user_id: lockedSurvey.user_id,
      type: TRANSACTION_TYPES.REVERSAL,
      offer_wall_id: lockedSurvey.survey_metadata?.offer_wall_id || null,
      reference_type: 'survey_click',
      reference_id: lockedSurvey.survey_click_id,
      amount: -surveyAmount,
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: lockedSurvey.referrer_id || null,
      referrer_earned: -referralAmount,
      status: TRANSACTION_STATUS.REVERSED,
      metadata: {
        original_survey_transaction_id: transactionId,
        original_amount: surveyAmount,
        reason: reason || 'Admin reversed locked survey',
        admin_id: adminId,
        deducted_from: 'balance_locked',
        was_locked: true
      }
    });

    // 6. Update survey click status to reversed
    await client.query(
      `UPDATE survey_clicks 
       SET status = 'reversed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [lockedSurvey.survey_click_id]
    );

    // 7. Handle referral reversal if exists
    let referralReversalTx = null;
    if (lockedSurvey.referral_transaction_id && referralAmount > 0) {
      // LOCK referrer row
      await client.query(
        `SELECT balance_locked, balance_available FROM users WHERE id = $1 FOR UPDATE`,
        [lockedSurvey.referrer_user_id]
      );

      // Deduct from referrer's locked balance
      await client.query(
        `UPDATE users 
         SET balance_locked = balance_locked - $1
         WHERE id = $2`,
        [referralAmount, lockedSurvey.referrer_user_id]
      );

      // Update referral transaction status to reversed
      await client.query(
        `UPDATE transactions 
         SET status = 'reversed', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [lockedSurvey.referral_transaction_id]
      );

      // Create reversal transaction for referrer
      referralReversalTx = await createTransaction(client, {
        user_id: lockedSurvey.referrer_user_id,
        type: TRANSACTION_TYPES.REVERSAL,
        offer_wall_id: null,
        reference_type: 'referral',
        reference_id: lockedSurvey.referral_transaction_id,
        amount: -referralAmount,
        commission_earned: 0,
        commission_rate_at_time: null,
        referrer_id: null,
        referrer_earned: 0,
        status: TRANSACTION_STATUS.REVERSED,
        metadata: {
          original_referral_transaction_id: lockedSurvey.referral_transaction_id,
          original_survey_transaction_id: transactionId,
          original_amount: referralAmount,
          reason: `Referral reversal: ${reason || 'Admin reversed locked survey'}`,
          admin_id: adminId,
          deducted_from: 'balance_locked',
          was_locked: true,
          from_user_id: lockedSurvey.user_id,
          from_username: lockedSurvey.username
        }
      });
    }

    // 8. Log admin action
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'reverse_locked_survey',
        'survey_click',
        lockedSurvey.survey_click_id,
        JSON.stringify({
          transaction_id: transactionId,
          survey_amount: surveyAmount,
          referral_amount: referralAmount,
          user_id: lockedSurvey.user_id,
          referrer_id: lockedSurvey.referrer_user_id,
          reason: reason,
          user_reversal_transaction_id: userReversalTx.id,
          referral_reversal_transaction_id: referralReversalTx?.id || null
        }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      reversed: true,
      transaction_id: transactionId,
      survey_click_id: lockedSurvey.survey_click_id,
      user_id: lockedSurvey.user_id,
      username: lockedSurvey.username,
      survey_amount: surveyAmount,
      referral_amount: referralAmount,
      referrer_id: lockedSurvey.referrer_user_id,
      referrer_username: lockedSurvey.referrer_username,
      user_reversal_transaction_id: userReversalTx.id,
      referral_reversal_transaction_id: referralReversalTx?.id || null
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { listLockedSurveys, listAllSurveys, unlockLockedSurvey, reverseLockedSurvey };