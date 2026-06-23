const pool = require('../config/db');
const {
  findSurveyClickByTransactionId,
  findOriginalTransaction,
  findReferralTransaction,
  createReversalTransaction,
  updateSurveyClickReversed,
  findReversalByReference,
  findUndoReversalByReference,
  lockUserForUpdate,
  lockSurveyClickForUpdate,
  lockReversalTransaction,
  lockUndoReversalTransaction
} = require('../repositories/reversal.repository');
const { findByExternalTransactionId } = require('../repositories/survey_click.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { parseReversalCSV } = require('../utils/csvParser');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, SURVEY_CLICK_STATUS } = require('../constants/transactionTypes');

/**
 * Core reversal logic — single transaction, all reads use client
 */


/**
 * Unified click finder for reversals — tries internal ID first, then external
 */

const findClickForReversal = async (client, transactionId) => {
  // Priority 1: internal transaction_id
  let click = await findSurveyClickByTransactionId(client, transactionId);
  if (click) {
    return { click, foundBy: 'transaction_id' };
  }

  // Priority 2: external_transaction_id (intermediary reversals)
  click = await findByExternalTransactionId(transactionId);
  if (click) {
    return { click, foundBy: 'external_transaction_id' };
  }

  return { click: null, foundBy: null };
};


const processSingleReversal = async (transactionId, reason, source, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

        // FIX: Use unified finder
    const { click, foundBy } = await findClickForReversal(client, transactionId);
    
    if (!click) {
      const err = new Error(`Survey click not found: ${transactionId}`);
      err.status = 404;
      throw err;
    }

    console.log(`[Reversal] Found click by: ${foundBy}, click_id: ${click.id}`);

    // 2. LOCK survey click row
    const lockedClick = await lockSurveyClickForUpdate(client, click.id);
    
    if (lockedClick.status === SURVEY_CLICK_STATUS.REVERSED) {
      const err = new Error(`Already reversed: ${transactionId}`);
      err.status = 400;
      throw err;
    }

    // Allow reversal for completed OR locked surveys
    if (![SURVEY_CLICK_STATUS.COMPLETED, 'locked'].includes(lockedClick.status)) {
      const err = new Error(`Cannot reverse survey with status: ${lockedClick.status}`);
      err.status = 400;
      throw err;
    }

    // 3. Find original transaction (inside transaction)
    const originalTx = await findOriginalTransaction(client, click.id);
    
    if (!originalTx) {
      const err = new Error(`Original transaction not found for: ${transactionId}`);
      err.status = 404;
      throw err;
    }

    // 4. Check if reversal already exists (inside transaction)
    const existingReversal = await findReversalByReference(client, 'survey_click', click.id);
    if (existingReversal) {
      const err = new Error(`Reversal transaction already exists for: ${transactionId}`);
      err.status = 400;
      throw err;
    }

    // 5. LOCK user row
    await lockUserForUpdate(client, click.user_id);

    // 6. Determine which balance field to deduct from
    const wasLocked = originalTx.status === 'locked';
    const balanceField = wasLocked ? 'balance_locked' : 'balance_available';
    const cpaUser = parseFloat(originalTx.amount);

    // 7. Deduct from user's balance (can go negative)
    await client.query(
      `UPDATE users SET ${balanceField} = ${balanceField} + $1 WHERE id = $2`,
      [-cpaUser, click.user_id]
    );

    // 8. Create reversal transaction for user
    const reversalTx = await createReversalTransaction(client, {
      user_id: click.user_id,
      offer_wall_id: click.offer_wall_id,
      reference_type: 'survey_click',
      reference_id: click.id,
      amount: -cpaUser,
      referrer_id: originalTx.referrer_id,
      referrer_earned: -originalTx.referrer_earned,
      metadata: {
        original_transaction_id: originalTx.id,
        original_amount: cpaUser,
        reason: reason,
        source: source,
        admin_id: adminId,
        was_locked: wasLocked,
        deducted_from: balanceField,
        found_by: foundBy
      }
    });

    // 9. Reverse referrer's commission if applicable
    if (originalTx.referrer_id && originalTx.referrer_earned > 0) {
      const refTx = await findReferralTransaction(client, click.id, click.user_id);
      
      if (refTx) {
        // Lock referrer row
        await lockUserForUpdate(client, originalTx.referrer_id);

        // Deduct from referrer's balance
        await client.query(
          'UPDATE users SET balance_available = balance_available + $1 WHERE id = $2',
          [-originalTx.referrer_earned, originalTx.referrer_id]
        );

        // Create reversal transaction for referrer
        await createTransaction(client, {
          user_id: originalTx.referrer_id,
          type: TRANSACTION_TYPES.REVERSAL,
          offer_wall_id: null,
          reference_type: 'referral',
          reference_id: refTx.id,
          amount: -originalTx.referrer_earned,
          commission_earned: 0,
          commission_rate_at_time: null,
          referrer_id: null,
          referrer_earned: 0,
          status: TRANSACTION_STATUS.REVERSED,
          metadata: {
            original_referral_transaction_id: refTx.id,
            original_amount: originalTx.referrer_earned,
            reason: `Referral reversal: ${reason}`,
            source: source,
            admin_id: adminId,
            from_user_id: click.user_id,
            from_username: click.username
          }
        });
      }
    }

    // 10. Update survey click status
    await updateSurveyClickReversed(client, click.id);

    // 11. Log audit with real IP
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, 'reverse_survey', 'survey_click', click.id,
       JSON.stringify({ transaction_id: transactionId, amount: cpaUser, reason, source }), adminIp]
    );

    await client.query('COMMIT');

    return {
      reversed: true,
      transaction_id: transactionId,
      amount: cpaUser,
      deducted_from: balanceField,
      user_id: click.user_id,
      username: click.username,
      found_by: foundBy
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Undo a reversal — idempotent, uses same transaction client
 */
const undoReversal = async (surveyClickId, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find the reversal transaction (inside transaction)
   // const reversalTx = await findReversalByReference(client, 'survey_click', surveyClickId);

   const reversalTx = await lockReversalTransaction(client, 'survey_click', surveyClickId);
    
    if (!reversalTx) {
      const err = new Error('Reversal not found for this survey click');
      err.status = 404;
      throw err;
    }

    // 2. CHECK: Already undone?
   // const existingUndo = await findUndoReversalByReference(client, 'survey_click', surveyClickId);
   const existingUndo = await lockUndoReversalTransaction(client, 'survey_click', surveyClickId);

    if (existingUndo) {
      const err = new Error('This reversal has already been undone');
      err.status = 400;
      throw err;
    }

    // 3. Find original transaction
    const originalTx = await findOriginalTransaction(client, surveyClickId);
    
    if (!originalTx) {
      const err = new Error('Original transaction not found');
      err.status = 404;
      throw err;
    }

    const wasLocked = reversalTx.metadata?.was_locked || false;
    const balanceField = wasLocked ? 'balance_locked' : 'balance_available';
    const cpaUser = Math.abs(parseFloat(reversalTx.amount));

    // 4. LOCK user row and restore balance
    await lockUserForUpdate(client, reversalTx.user_id);
    
    await client.query(
      `UPDATE users SET ${balanceField} = ${balanceField} + $1 WHERE id = $2`,
      [cpaUser, reversalTx.user_id]
    );

    // 5. Create undo reversal transaction
    await createTransaction(client, {
      user_id: reversalTx.user_id,
      type: TRANSACTION_TYPES.UNDO_REVERSAL,
      offer_wall_id: reversalTx.offer_wall_id,
      reference_type: 'survey_click',
      reference_id: surveyClickId,
      amount: cpaUser,
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: null,
      referrer_earned: 0,
      status: TRANSACTION_STATUS.COMPLETED,
      metadata: {
        original_reversal_id: reversalTx.id,
        reason: 'Admin undo reversal',
        admin_id: adminId
      }
    });

    // 6. Restore referrer's commission if applicable
    if (reversalTx.referrer_id && reversalTx.referrer_earned) {
      const refEarned = Math.abs(parseFloat(reversalTx.referrer_earned));
      
      // Lock referrer row
      await lockUserForUpdate(client, reversalTx.referrer_id);
      
      await client.query(
        'UPDATE users SET balance_available = balance_available + $1 WHERE id = $2',
        [refEarned, reversalTx.referrer_id]
      );

      await createTransaction(client, {
        user_id: reversalTx.referrer_id,
        type: TRANSACTION_TYPES.UNDO_REVERSAL,
        offer_wall_id: null,
        reference_type: 'referral',
        reference_id: surveyClickId,
        amount: refEarned,
        commission_earned: 0,
        commission_rate_at_time: null,
        referrer_id: null,
        referrer_earned: 0,
        status: TRANSACTION_STATUS.COMPLETED,
        metadata: {
          reason: 'Admin undo referral reversal',
          admin_id: adminId
        }
      });
    }

    // 7. Restore survey click status
    const originalStatus = wasLocked ? 'locked' : 'completed';
    await client.query(
      `UPDATE survey_clicks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [originalStatus, surveyClickId]
    );

    // 8. Log audit with real IP
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, 'undo_reversal', 'survey_click', surveyClickId,
       JSON.stringify({ original_reversal_id: reversalTx.id, amount: cpaUser }), adminIp]
    );

    await client.query('COMMIT');

    return {
      undone: true,
      survey_click_id: surveyClickId,
      amount_restored: cpaUser
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Process CSV bulk upload — each row is independent transaction
 */
const processBulkReversal = async (filePath, adminId, adminIp) => {
  const rows = await parseReversalCSV(filePath);
  
  const results = {
    processed: 0,
    skipped: 0,
    errors: [],
    details: []
  };

  for (const row of rows) {
    try {
      await processSingleReversal(
        row.transaction_id,
        row.reason,
        'csv',
        adminId,
        adminIp
      );
      
      results.processed++;
      results.details.push({
        transaction_id: row.transaction_id,
        status: 'reversed'
      });
      
    } catch (err) {
      results.skipped++;
      results.errors.push({
        transaction_id: row.transaction_id,
        error: err.message
      });
    }
  }

  return results;
};

module.exports = {
  processSingleReversal,
  undoReversal,
  processBulkReversal
};