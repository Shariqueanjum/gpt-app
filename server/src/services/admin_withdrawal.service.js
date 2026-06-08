const pool = require('../config/db');
const { findWithdrawalById, updateWithdrawalStatus, findPendingWithdrawals } = require('../repositories/withdrawal.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

const getPendingWithdrawals = async (query = {}) => {
  const filters = {};
  if (query.method) filters.method = query.method;
  if (query.date_from && query.date_to) {
    filters.dateFrom = query.date_from;
    filters.dateTo = query.date_to;
  }

  const pagination = {
    page: query.page,
    limit: query.limit
  };

  const result = await findPendingWithdrawals(filters, pagination);

  // Parse decimals
  result.data = result.data.map(w => ({
    ...w,
    amount: parseFloat(w.amount),
    balance_available: parseFloat(w.balance_available)
  }));

  return result;
};

const approveWithdrawal = async (withdrawalId, bankTransactionId, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find withdrawal
    const withdrawal = await findWithdrawalById(withdrawalId);
    
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error(`Withdrawal already ${withdrawal.status}`);
    }

    // 2. Update withdrawal to paid
    const updated = await updateWithdrawalStatus(client, withdrawalId, 'paid', {
      bank_transaction_id: bankTransactionId
    });

    // 3. Update transaction to completed
    await client.query(
      `UPDATE transactions 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE reference_type = 'withdrawal' AND reference_id = $2`,
      [TRANSACTION_STATUS.COMPLETED, withdrawalId]
    );

    // 4. Log admin action
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, 'approve_withdrawal', 'withdrawal', withdrawalId, 
       JSON.stringify({ amount: withdrawal.amount, method: withdrawal.method, utr: bankTransactionId }),
       adminIp] 
    );

    await client.query('COMMIT');

    return {
      withdrawal: {
        id: updated.id,
        amount: parseFloat(updated.amount),
        status: updated.status,
        bank_transaction_id: updated.bank_transaction_id,
        updated_at: updated.updated_at
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const rejectWithdrawal = async (withdrawalId, reason, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find withdrawal
    const withdrawal = await findWithdrawalById(withdrawalId);
    
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error(`Withdrawal already ${withdrawal.status}`);
    }

    // 2. Return balance to user
    await client.query(
      'UPDATE users SET balance_available = balance_available + $1 WHERE id = $2',
      [withdrawal.amount, withdrawal.user_id]
    );

    // 3. Update withdrawal to rejected
    const updated = await updateWithdrawalStatus(client, withdrawalId, 'rejected', {
      rejection_reason: reason
    });

    // 4. Update transaction to cancelled
    await client.query(
      `UPDATE transactions 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE reference_type = 'withdrawal' AND reference_id = $2`,
      [TRANSACTION_STATUS.CANCELLED, withdrawalId]
    );

    // 5. Create refund transaction
    await createTransaction(client, {
      user_id: withdrawal.user_id,
      type: TRANSACTION_TYPES.REFUND,
      offer_wall_id: null,
      reference_type: 'withdrawal',
      reference_id: withdrawalId,
      amount: parseFloat(withdrawal.amount),
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: null,
      referrer_earned: 0,
      status: TRANSACTION_STATUS.COMPLETED,
      metadata: {
        original_withdrawal_id: withdrawalId,
        rejection_reason: reason,
        admin_id: adminId
      }
    });

    // 6. Log admin action
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, 'reject_withdrawal', 'withdrawal', withdrawalId,
       JSON.stringify({ amount: withdrawal.amount, reason }),
       adminIp]
    );

    await client.query('COMMIT');

    return {
      withdrawal: {
        id: updated.id,
        amount: parseFloat(updated.amount),
        status: updated.status,
        rejection_reason: updated.rejection_reason,
        updated_at: updated.updated_at
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal };