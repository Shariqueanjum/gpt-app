const pool = require('../config/db');
const { createWithdrawal, findWithdrawalsByUserId, countWithdrawalsByUserId } = require('../repositories/withdrawal.repository');
const { findByCode } = require('../repositories/payment_method.repository');
const { findUserById } = require('../repositories/user.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

const { emitActivity } = require('./activityEmitter.service');

const requestWithdrawal = async (userId, payload) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get user with lock to prevent race conditions
    const userRes = await client.query(
      `SELECT id, username, country, balance_available, is_active, upi_id, bank_account, bank_ifsc, bank_name, paypal_email
       FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    const user = userRes.rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('Account is disabled. Contact support.');
    }

    // 2. Validate payment method exists and is active
    const method = await findByCode(payload.method_code);
    if (!method) {
      throw new Error('Invalid or inactive payment method');
    }

    // 3. Validate amount against method limits
    const amount = parseFloat(payload.amount);

    if (amount < parseFloat(method.min_amount)) {
      const error = new Error(`Minimum withdrawal amount is $${(method.min_amount / 100).toFixed(2)}`);
      error.status = 400;
      throw error;
    }

    if (amount > parseFloat(method.max_amount)) {
      const error = new Error(`Maximum withdrawal amount is $${(method.max_amount / 100).toFixed(2)}`);
      error.status = 400;
      throw error;
    }

    // 4. Validate user has sufficient balance
    if (amount > parseFloat(user.balance_available)) {
      const error = new Error('Insufficient available balance');
      error.status = 400;
      throw error;
    }

    // 5. Validate method_details match the method's required fields
    const methodDetails = payload.method_details;

    // Basic validation: ensure required fields are present based on method
    const requiredFields = getRequiredFieldsForMethod(payload.method_code);
    for (const field of requiredFields) {
      if (!methodDetails[field]) {
        throw new Error(`${field} is required for ${method.name}`);
      }
    }

    // 6. Deduct balance
    await client.query(
      'UPDATE users SET balance_available = balance_available - $1 WHERE id = $2',
      [amount, userId]
    );

    // 7. Create withdrawal record
    const withdrawal = await createWithdrawal(client, {
      user_id: userId,
      amount: amount,
      method: payload.method_code,
      method_details: methodDetails
    });

    // 8. Create pending transaction record
    await createTransaction(client, {
      user_id: userId,
      type: TRANSACTION_TYPES.WITHDRAWAL,
      offer_wall_id: null,
      reference_type: 'withdrawal',
      reference_id: withdrawal.id,
      amount: -amount,
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: null,
      referrer_earned: 0,
      status: TRANSACTION_STATUS.PENDING,
      metadata: {
        method: payload.method_code,
        method_details: methodDetails,
        processing_fee: parseFloat(method.processing_fee)
      }
    });

    await client.query('COMMIT');

    // Emit real-time live activity
    try {
      emitActivity({
        type: 'withdrawal_requested',
        username: user.username,
        country: user.country || 'Unknown',
        amount: amount,
        offer_wall: method.name
      });
    } catch (_) {}

    return {
      withdrawal: {
        id: withdrawal.id,
        amount: parseFloat(withdrawal.amount),
        method: withdrawal.method,
        status: withdrawal.status,
        created_at: withdrawal.created_at ? new Date(withdrawal.created_at).toISOString() : new Date().toISOString()
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getMyWithdrawals = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    findWithdrawalsByUserId(userId, limit, offset),
    countWithdrawalsByUserId(userId)
  ]);

  const parsedData = data.map(w => ({
    ...w,
    amount: parseFloat(w.amount),
    method_details: w.method_details,
    created_at: w.created_at ? new Date(w.created_at).toISOString() : null,
    updated_at: w.updated_at ? new Date(w.updated_at).toISOString() : null
  }));

  return {
    data: parsedData,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

// Helper: define required fields per method
const getRequiredFieldsForMethod = (code) => {
  const fields = {
    upi: ['upi_id'],
    bank: ['account_number', 'ifsc_code', 'bank_name', 'account_holder_name'],
    paypal: ['paypal_email'],
    paytm: ['paytm_number'],
    amazon_pay: ['amazon_pay_number']
  };
  return fields[code] || [];
};

module.exports = { requestWithdrawal, getMyWithdrawals };