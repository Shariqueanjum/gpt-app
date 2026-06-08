const pool = require('../config/db');
const { findUsersForAdmin, findUserById, updateUserBanStatus, adjustUserBalance, lockUserById } = require('../repositories/user.repository');
const { TRANSACTION_TYPES } = require('../constants/transactionTypes');

const getUsersList = async (query = {}) => {
  const filters = {};

  if (query.search) filters.search = query.search;
  if (query.is_active !== undefined) filters.is_active = query.is_active === 'true';
  if (query.is_verified !== undefined) filters.is_verified = query.is_verified === 'true';
  if (query.date_from && query.date_to) {
    filters.dateFrom = query.date_from;
    filters.dateTo = query.date_to;
  }

  const pagination = {
    page: query.page,
    limit: query.limit
  };

  return await findUsersForAdmin(filters, pagination);
};

const getUserDetails = async (userId) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Remove sensitive fields
  const { password_hash, ...safeUser } = user;
  
  return {
    user: {
      ...safeUser,
      balance_available: parseFloat(safeUser.balance_available),
      balance_locked: parseFloat(safeUser.balance_locked),
      balance_denied: parseFloat(safeUser.balance_denied)
    }
  };
};

const banUser = async (userId, reason, adminId, adminIp) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (!user.is_active) {
    throw new Error('User is already banned');
  }

  const updated = await updateUserBanStatus(userId, false, reason);

  // Log audit
  await pool.query(
    `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [adminId, 'ban_user', 'user', userId, JSON.stringify({ reason }), adminIp]
  );

  return {
    user: {
      id: updated.id,
      username: updated.username,
      is_active: updated.is_active,
      ban_reason: updated.ban_reason,
      banned_at: updated.banned_at
    }
  };
};

const unbanUser = async (userId, adminId, adminIp) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (user.is_active) {
    throw new Error('User is already active');
  }

  const updated = await updateUserBanStatus(userId, true, null);

  // Log audit
  await pool.query(
    `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [adminId, 'unban_user', 'user', userId, JSON.stringify({ previous_ban_reason: user.ban_reason }), adminIp]
  );

  return {
    user: {
      id: updated.id,
      username: updated.username,
      is_active: updated.is_active,
      ban_reason: updated.ban_reason,
      banned_at: updated.banned_at
    }
  };
};

const manualAdjustBalance = async (userId, amount, reason, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

   // const user = await findUserById(userId);
    const user = await lockUserById(client, userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const newBalance = parseFloat(user.balance_available) + amount;
    const warning = newBalance < 0 ? 'Warning: This will result in negative balance' : null;

    const transaction = await adjustUserBalance(client, userId, amount, TRANSACTION_TYPES.ADJUSTMENT, {
      reason,
      admin_id: adminId,
      previous_balance: parseFloat(user.balance_available),
      new_balance: parseFloat(user.balance_available) + amount
    });

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, 'manual_adjustment', 'user', userId, 
       JSON.stringify({ amount, reason, transaction_id: transaction.id }), adminIp]
    );

    await client.query('COMMIT');

    return {
      transaction: {
        id: transaction.id,
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        status: transaction.status,
        metadata: transaction.metadata
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getUsersList, getUserDetails, banUser, unbanUser, manualAdjustBalance };