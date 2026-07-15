const pool = require('../config/db');
const { updateSurveyClickStatus, createTransaction, findTransactionByReference } = require('../repositories/transaction.repository');
const { findByTransactionId, findByExternalTransactionId, externalTransactionIdExists, updateExternalTransactionId, lockSurveyClickById, lockSurveyClickByTransactionId, lockSurveyClickByExternalId } = require('../repositories/survey_click.repository');
const { findUserById } = require('../repositories/user.repository');
const { getNumericSetting } = require('./settings.service');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, SURVEY_CLICK_STATUS } = require('../constants/transactionTypes');
const { checkAndUpgradeLevel } = require('./level.service');
const { emitActivity } = require('./activityEmitter.service');

const assertClickBelongsToOfferWall = (click, offerWall) => {
  if (Number(click.offer_wall_id) !== Number(offerWall.id)) {
    const err = new Error('Transaction does not belong to this offer wall');
    err.status = 400;
    throw err;
  }
};

// Find click for callback WITH row locking (prevents race conditions)
const findAndLockClickForCallback = async (client, parsedCallback, offerWall) => {
  let click = null;
  let foundBy = null;

  // Priority 1: sub_id — intermediary echoing our internal transaction_id
  if (parsedCallback.subId) {
    click = await lockSurveyClickByTransactionId(client, parsedCallback.subId);
    if (click) {
      foundBy = 'sub_id';
      // Store external transaction ID if provided and not already stored
      if (parsedCallback.externalTransactionId && !click.external_transaction_id) {
        // Check for duplicate external ID
        const exists = await externalTransactionIdExists(parsedCallback.externalTransactionId);
        if (exists) {
          const err = new Error('External transaction ID already exists on another click');
          err.status = 409;
          throw err;
        }
        await updateExternalTransactionId(client, click.id, parsedCallback.externalTransactionId);
        click.external_transaction_id = parsedCallback.externalTransactionId;
      }
      return { click, foundBy, user_id: click.user_id, username: click.username };
    }
  }

  // Priority 2: direct match — our transaction_id (direct client)
  click = await lockSurveyClickByTransactionId(client, parsedCallback.transactionId);
  if (click) {
    foundBy = 'transaction_id';
    if (parsedCallback.externalTransactionId && !click.external_transaction_id) {
      const exists = await externalTransactionIdExists(parsedCallback.externalTransactionId);
      if (exists) {
        const err = new Error('External transaction ID already exists on another click');
        err.status = 409;
        throw err;
      }
      await updateExternalTransactionId(client, click.id, parsedCallback.externalTransactionId);
      click.external_transaction_id = parsedCallback.externalTransactionId;
    }
    return { click, foundBy, user_id: click.user_id, username: click.username };
  }

  // Priority 3: external_transaction_id — previously stored or reversal callback
  if (parsedCallback.externalTransactionId) {
    click = await lockSurveyClickByExternalId(client, parsedCallback.externalTransactionId);
    if (click) {
      foundBy = 'external_transaction_id';
      return { click, foundBy, user_id: click.user_id, username: click.username };
    }
  }

  // Priority 4: try transactionId as external ID (some intermediaries send their ID without sub_id)
  click = await lockSurveyClickByExternalId(client, parsedCallback.transactionId);
  if (click) {
    foundBy = 'external_transaction_id_fallback';
    return { click, foundBy, user_id: click.user_id, username: click.username };
  }

  // ============================================
  // NEW: Priority 5 — IFRAME FALLBACK
  // For iframe-type offer walls where 3rd party does NOT echo back our transaction_id
  // We fallback to looking up by username or user_public_id
  // ONLY applies to iframe type walls
  // ============================================
  if (!click && offerWall && offerWall.type === 'iframe') {
    const identifier = parsedCallback.username || parsedCallback.userPublicId;
    const identifierField = parsedCallback.username ? 'u.username' : 'u.public_id';

    if (identifier) {
      const userRes = await client.query(
        `SELECT sc.*, u.username, u.public_id
         FROM survey_clicks sc
         JOIN users u ON sc.user_id = u.id
         WHERE ${identifierField} = $1
         AND sc.offer_wall_id = $2
         AND sc.status = 'pending'
         AND sc.expires_at > NOW()
         ORDER BY sc.created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [identifier, offerWall.id]
      );

      if (userRes.rows.length > 0) {
        click = userRes.rows[0];
        foundBy = 'iframe_user_fallback';

        // Store their transaction_id as external_transaction_id for future lookups (reversals)
        const theirId = parsedCallback.externalTransactionId || parsedCallback.transactionId;
        if (theirId && !click.external_transaction_id) {
          try {
            // Check if this external ID already exists on another click
            const exists = await externalTransactionIdExists(theirId);
            if (!exists) {
              await updateExternalTransactionId(client, click.id, theirId);
              click.external_transaction_id = theirId;
            }
          } catch (e) {
            // If duplicate, just log and continue — might be a retry callback
            console.log(`[Credit] External ID ${theirId} already exists on another click, skipping storage`);
          }
        }

        // ============================================================
        // Priority 6 — IFRAME AUTO-CREATE
        // No pending click found at all (already consumed, or user never
        // triggered an entry). For iframe walls, the callback itself carries
        // everything we need (username + payout), so build the click record
        // now instead of failing the callback.
        // ============================================================
        if (!click && offerWall && offerWall.type === 'iframe') {
          const identifier = parsedCallback.username || parsedCallback.userPublicId;

          if (identifier && parsedCallback.payout !== null && parsedCallback.payout > 0) {
            const userField = parsedCallback.username ? 'username' : 'public_id';
            const userRes = await client.query(
              `SELECT id, username, public_id FROM users WHERE ${userField} = $1`,
              [identifier]
            );

            if (userRes.rows.length > 0) {
              const user = userRes.rows[0];
              const theirId = parsedCallback.externalTransactionId || parsedCallback.transactionId;

              // Don't create a duplicate if this external ID was already credited
              if (theirId) {
                const exists = await externalTransactionIdExists(theirId);
                if (exists) {
                  return { click: null, foundBy: 'iframe_auto_create_duplicate', user_id: null, username: null };
                }
              }

              const internalTxnId = `TXN-AUTO-${offerWall.internal_id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

              const insertRes = await client.query(
                `INSERT INTO survey_clicks
             (user_id, offer_wall_id, transaction_id, integration_type, commission_rate, status, external_transaction_id, created_at)
           VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
           RETURNING *`,
                [user.id, offerWall.id, internalTxnId, offerWall.type, offerWall.commission_rate, theirId || null]
              );

              click = insertRes.rows[0];
              click.username = user.username;
              foundBy = 'iframe_auto_create';
              return { click, foundBy, user_id: user.id, username: user.username };
            }
          }
        }

        return { click, foundBy, user_id: click.user_id, username: click.username };
      }
    }
  }

  return { click: null, foundBy: null, user_id: null, username: null };
};

const processSurveyCompletion = async (parsedCallback, offerWall) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // FIX: Use unified finder
    const { click, foundBy, user_id, username } = await findAndLockClickForCallback(client, parsedCallback, offerWall);

    if (!click) {
      const err = new Error('Transaction ID not found');
      err.status = 404;
      throw err;
    }

    console.log(`[Credit] Found click by: ${foundBy}, click_id: ${click.id}`);

    assertClickBelongsToOfferWall(click, offerWall);

    // 2. Prevent double-crediting
    if (click.status !== SURVEY_CLICK_STATUS.PENDING) {
      const err = new Error(`Survey click already processed: ${click.status}`);
      err.status = 400;
      throw err;
    }

    // 3. Check expiry
    if (click.expires_at && new Date() > new Date(click.expires_at)) {
      const err = new Error('Survey click expired');
      err.status = 400;
      throw err;
    }

    // 4. Handle payout based on integration type
    let cpaOriginal = parseFloat(click.cpa_original) || 0;
    let cpaUser = parseFloat(click.cpa_user) || 0;
    let commissionEarned = 0;

    if (click.integration_type === 'api') {
      // API type: We knew CPA upfront. Must match exactly.
      if (parsedCallback.payout !== null && parsedCallback.payout !== cpaOriginal) {
        const err = new Error(`Payout mismatch: expected ${cpaOriginal}, got ${parsedCallback.payout}`);
        err.status = 400;
        throw err;
      }
      commissionEarned = parseFloat((cpaOriginal - cpaUser).toFixed(2));
    }
    else {
      // Router/iFrame type: We didn't know CPA upfront. Accept from callback.
      if (parsedCallback.payout === null || parsedCallback.payout <= 0) {
        const err = new Error('Payout amount required for Router/iFrame callbacks');
        err.status = 400;
        throw err;
      }
      // Some providers send payout already in points (multiplier 1, default).
      // Others (e.g. SurveyDekho) send it in real currency (e.g. $0.50), which
      // must be converted to points (100 points = $1) before crediting.
      const payoutMultiplier = parseFloat(offerWall.callback_config?.payout_multiplier) || 1;

      cpaOriginal = parseFloat((parsedCallback.payout * payoutMultiplier).toFixed(2));
      const commissionRate = parseFloat(click.commission_rate);
      cpaUser = parseFloat((cpaOriginal * (100 - commissionRate) / 100).toFixed(2));
      commissionEarned = parseFloat((cpaOriginal - cpaUser).toFixed(2));
    }

    // 5. Get lock threshold from settings
    const lockThreshold = await getNumericSetting('lock_threshold_points') || 300;

    // 6. Determine available vs locked
    const isLocked = cpaOriginal >= lockThreshold;
    const transactionStatus = isLocked ? TRANSACTION_STATUS.LOCKED : TRANSACTION_STATUS.COMPLETED;
    const balanceField = isLocked ? 'balance_locked' : 'balance_available';

    // 7. Credit the user
    await client.query(
      `UPDATE users SET ${balanceField} = ${balanceField} + $1 WHERE id = $2`,
      [cpaUser, click.user_id]
    );

    // 8. Create main transaction record
    const mainTransaction = await createTransaction(client, {
      user_id: click.user_id,
      type: TRANSACTION_TYPES.SURVEY,
      offer_wall_id: offerWall.id,
      reference_type: 'survey_click',
      reference_id: click.id,
      amount: cpaUser,
      commission_earned: commissionEarned,
      commission_rate_at_time: click.commission_rate,
      referrer_id: null,
      referrer_earned: 0,
      status: transactionStatus,
      metadata: {
        cpa_original: cpaOriginal,
        payout_received: parsedCallback.payout,
        lock_threshold: lockThreshold,
        is_locked: isLocked,
        integration_type: click.integration_type,
        raw_status: parsedCallback.rawStatus || parsedCallback.status,
        found_by: foundBy,
        external_transaction_id: click.external_transaction_id || parsedCallback.externalTransactionId || null
      }
    });

    // 9. Handle referral commission
    const user = await findUserById(click.user_id);
    let referralTransaction = null;

    if (user && user.referred_by) {
      const referralPercent = await getNumericSetting('referral_commission_percent') || 10;
      const referrerEarned = parseFloat(((cpaUser * referralPercent) / 100).toFixed(2));

      if (referrerEarned > 0) {
        // FIX #1: When survey is locked, referral also goes to locked balance

        const refBalanceField = isLocked ? 'balance_locked' : 'balance_available';
        const refTransactionStatus = isLocked ? TRANSACTION_STATUS.LOCKED : TRANSACTION_STATUS.COMPLETED;

        await client.query(
          `UPDATE users SET ${refBalanceField} = ${refBalanceField} + $1 WHERE id = $2`,
          [referrerEarned, user.referred_by]
        );

        referralTransaction = await createTransaction(client, {
          user_id: user.referred_by,
          type: TRANSACTION_TYPES.REFERRAL,
          offer_wall_id: null,
          reference_type: 'user',
          reference_id: user.id,
          amount: referrerEarned,
          commission_earned: 0,
          commission_rate_at_time: null,
          referrer_id: null,
          referrer_earned: 0,
          status: refTransactionStatus,
          metadata: {
            from_survey_click: click.id,
            from_transaction: mainTransaction.id,
            referral_percent: referralPercent,
            survey_earned: cpaUser,
            is_locked: isLocked,  // FIX: track if this referral was locked
            parent_transaction_status: transactionStatus,
            referred_username: user.username,    // ← ADD THIS
            referred_user_id: user.id
          }
        });

        await client.query(
          'UPDATE transactions SET referrer_id = $1, referrer_earned = $2 WHERE id = $3',
          [user.referred_by, referrerEarned, mainTransaction.id]
        );
      }
    }

    // 10. Finalize click status
    await updateSurveyClickStatus(client, click.id, SURVEY_CLICK_STATUS.COMPLETED, {
      cpa_original: cpaOriginal,
      cpa_user: cpaUser
    });

    await client.query('COMMIT');

    checkAndUpgradeLevel(click.user_id).catch(err => {
      console.error(`[AutoLevel] User ${click.user_id}: ${err.message}`);
    });

    // Fire real-time live activity event instantly
    try {
      emitActivity({
        type: 'survey_completed',
        username: username,
        offer_wall: offerWall?.name || 'Survey',
        amount: cpaUser ? cpaUser.toString() : null,
        country: user?.country || 'Unknown',
      });
    } catch (_) { }

    return {
      click_id: click.id,
      user_id: user_id,
      username: username,
      user_credited: cpaUser,
      is_locked: isLocked,
      transaction_id: mainTransaction.id,
      referral_credited: referralTransaction ? {
        referrer_id: user.referred_by,
        amount: referralTransaction.amount,
        is_locked: isLocked
      } : null
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const processNonSuccessCallback = async (parsedCallback, offerWall) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { click, foundBy, user_id, username } = await findAndLockClickForCallback(client, parsedCallback, offerWall);

    if (!click) {
      const err = new Error('Transaction ID not found');
      err.status = 404;
      throw err;
    }

    assertClickBelongsToOfferWall(click, offerWall);

    if (click.status !== SURVEY_CLICK_STATUS.PENDING) {
      await client.query('ROLLBACK');
      return { already_processed: true, click_id: click.id, status: click.status, user_id, username };
    }

    await updateSurveyClickStatus(client, click.id, parsedCallback.status);

    await client.query('COMMIT');

    return { click_id: click.id, status: parsedCallback.status, user_id, username };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
module.exports = { processSurveyCompletion, processNonSuccessCallback };