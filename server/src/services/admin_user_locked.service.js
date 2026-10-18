const pool = require('../config/db');
const repo = require('../repositories/admin_user_locked.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const round2 = (n) => parseFloat(Number(n).toFixed(2));

/**
 * What the "Locked balance" dialog shows:
 *  - items that are locked right now (can be unlocked)
 *  - recent unlocks that can still be undone
 */
const getLockedOverview = async (userId) => {
  const balances = await repo.getLockedBalance(userId);
  if (!balances) throw fail(404, 'User not found');

  const [items, undoable] = await Promise.all([
    repo.findLockedItems(userId),
    repo.findUndoableUnlocks(userId)
  ]);

  const itemsTotal = round2(items.reduce((sum, i) => sum + i.amount, 0));
  const balanceLocked = parseFloat(balances.balance_locked) || 0;

  return {
    balance_locked: balanceLocked,
    balance_available: parseFloat(balances.balance_available) || 0,
    items,
    items_total: itemsTotal,
    // Locked balance that has no matching item (old data / manual edits). Shown so nothing is hidden.
    unmatched_locked: round2(balanceLocked - itemsTotal),
    undoable_unlocks: undoable
  };
};

/**
 * Move locked items to the main (withdrawable) balance.
 * Either `all` or an explicit list of transaction ids. One DB transaction: all or nothing.
 */
const unlockUserLocked = async (userId, { all, transaction_ids }, adminId, adminIp) => {
  const ids = all ? null : [...new Set(transaction_ids)];
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const user = await repo.lockUserRow(client, userId);
    if (!user) throw fail(404, 'User not found');

    const items = await repo.lockLockedItems(client, userId, ids);
    if (ids && items.length !== ids.length) {
      throw fail(409, 'Some selected items are no longer locked. Refresh and try again.');
    }
    if (items.length === 0) throw fail(400, 'Nothing is locked to unlock');

    const total = round2(items.reduce((sum, i) => sum + i.amount, 0));
    const balances = await repo.moveLockedToAvailable(client, userId, total);

    const unlockTxIds = [];
    for (const item of items) {
      await repo.setTransactionStatus(client, item.id, TRANSACTION_STATUS.COMPLETED);

      const unlockTx = await createTransaction(client, {
        user_id: userId,
        type: TRANSACTION_TYPES.UNLOCK,
        offer_wall_id: item.offer_wall_id || null,
        reference_type: item.type === 'survey' ? 'survey_click' : 'referral',
        reference_id: item.type === 'survey' ? item.reference_id : item.id,
        amount: item.amount,
        commission_earned: 0,
        commission_rate_at_time: null,
        referrer_id: null,
        referrer_earned: 0,
        status: TRANSACTION_STATUS.COMPLETED,
        metadata: {
          original_transaction_id: item.id,
          original_type: item.type,
          original_amount: item.amount,
          reason: 'Admin moved locked balance to main balance',
          admin_id: adminId,
          moved_from: 'balance_locked',
          moved_to: 'balance_available',
          source: 'admin_user_detail'
        }
      });
      unlockTxIds.push(unlockTx.id);
    }

    await repo.insertAuditLog(client, adminId, 'unlock_user_balance', userId, {
      total_points: total,
      item_count: items.length,
      transaction_ids: items.map((i) => i.id),
      unlock_transaction_ids: unlockTxIds
    }, adminIp);

    await client.query('COMMIT');

    return {
      unlocked_points: total,
      unlocked_count: items.length,
      balance_available: parseFloat(balances.balance_available),
      balance_locked: parseFloat(balances.balance_locked)
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Undo ONE unlock: money goes back from the main balance to locked.
 * Refused if the user has already spent/withdrawn it, or the item was reversed since.
 */
const undoUserUnlock = async (userId, unlockTransactionId, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const user = await repo.lockUserRow(client, userId);
    if (!user) throw fail(404, 'User not found');

    const unlockTx = await repo.lockUnlockTransaction(client, userId, unlockTransactionId);
    if (!unlockTx) throw fail(404, 'Unlock record not found');

    const meta = unlockTx.metadata || {};
    if (meta.undone_at) throw fail(400, 'This unlock was already undone');

    const originalId = parseInt(
      meta.original_transaction_id || meta.original_survey_transaction_id || meta.original_referral_transaction_id,
      10
    );
    if (!originalId) throw fail(400, 'This old unlock record cannot be undone automatically');

    const original = await repo.lockOriginalItem(client, userId, originalId);
    if (!original) throw fail(404, 'Original item not found');
    if (original.status !== TRANSACTION_STATUS.COMPLETED || original.is_reversed) {
      throw fail(400, 'This item changed after it was unlocked (for example it was reversed), so it cannot be undone');
    }

    const amount = unlockTx.amount;
    const available = parseFloat(user.balance_available) || 0;
    if (available < amount) {
      throw fail(400, `User has only ${available} points in main balance (needs ${amount}). He may have withdrawn it already.`);
    }

    const balances = await repo.moveAvailableToLocked(client, userId, amount);
    await repo.setTransactionStatus(client, original.id, TRANSACTION_STATUS.LOCKED);

    const undoTx = await createTransaction(client, {
      user_id: userId,
      type: TRANSACTION_TYPES.UNLOCK_UNDO,
      offer_wall_id: original.offer_wall_id || null,
      reference_type: original.type === 'survey' ? 'survey_click' : 'referral',
      reference_id: original.type === 'survey' ? original.reference_id : original.id,
      amount,
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: null,
      referrer_earned: 0,
      status: TRANSACTION_STATUS.COMPLETED,
      metadata: {
        undo_of_unlock_transaction_id: unlockTx.id,
        original_transaction_id: original.id,
        reason: 'Admin undid unlock (balance moved back to locked)',
        admin_id: adminId,
        moved_from: 'balance_available',
        moved_to: 'balance_locked'
      }
    });

    await repo.markUnlockUndone(client, unlockTx.id, adminId, undoTx.id);

    await repo.insertAuditLog(client, adminId, 'undo_unlock_user_balance', userId, {
      unlock_transaction_id: unlockTx.id,
      original_transaction_id: original.id,
      points: amount,
      undo_transaction_id: undoTx.id
    }, adminIp);

    await client.query('COMMIT');

    return {
      undone_points: amount,
      balance_available: parseFloat(balances.balance_available),
      balance_locked: parseFloat(balances.balance_locked)
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getLockedOverview, unlockUserLocked, undoUserUnlock };
