const pool = require('../config/db');

const findActivePaymentMethods = async () => {
  const res = await pool.query(
    `SELECT id, name, code, min_amount, max_amount, processing_fee, instructions, display_order, required_fields
     FROM payment_methods 
     WHERE is_active = true 
     ORDER BY display_order ASC, id ASC`
  );
  return res.rows;
};

const findByCode = async (code) => {
  const res = await pool.query(
    `SELECT id, name, code, min_amount, max_amount, processing_fee, instructions, is_active, required_fields
     FROM payment_methods 
     WHERE code = $1 AND is_active = true`,
    [code]
  );
  return res.rows[0];
};

const seedPaymentMethods = async () => {
  const methods = [
    {
      name: 'UPI',
      code: 'upi',
      min_amount: 500,
      max_amount: 50000,
      processing_fee: 0,
      instructions: 'Enter your UPI ID (e.g., name@upi)',
      display_order: 1
    },
    {
      name: 'Bank Transfer',
      code: 'bank',
      min_amount: 1000,
      max_amount: 100000,
      processing_fee: 25,
      instructions: 'Enter your account number, IFSC code, and bank name',
      display_order: 2
    },
    {
      name: 'PayPal',
      code: 'paypal',
      min_amount: 1000,
      max_amount: 50000,
      processing_fee: 50,
      instructions: 'Enter your PayPal email address',
      display_order: 3
    },
    {
      name: 'Paytm',
      code: 'paytm',
      min_amount: 500,
      max_amount: 25000,
      processing_fee: 0,
      instructions: 'Enter your Paytm-registered mobile number',
      display_order: 4
    },
    {
      name: 'Amazon Pay',
      code: 'amazon_pay',
      min_amount: 500,
      max_amount: 25000,
      processing_fee: 0,
      instructions: 'Enter your Amazon Pay-registered mobile number',
      display_order: 5
    }
  ];

  for (const method of methods) {
    await pool.query(
      `INSERT INTO payment_methods (name, code, min_amount, max_amount, processing_fee, instructions, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (code) DO NOTHING`,
      [method.name, method.code, method.min_amount, method.max_amount, method.processing_fee, method.instructions, method.display_order]
    );
  }
};

// Admin functions (add these)
const findAllPaymentMethods = async () => {
  const res = await pool.query(
    `SELECT id, name, code, min_amount, max_amount, processing_fee, instructions, display_order, is_active, required_fields, created_at, updated_at
     FROM payment_methods
     ORDER BY display_order ASC, id ASC`
  );
  return res.rows;
};

const insertPaymentMethod = async (data) => {
  const res = await pool.query(
    `INSERT INTO payment_methods (name, code, min_amount, max_amount, processing_fee, instructions, display_order, is_active, required_fields)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.name,
      data.code,
      data.min_amount || 0,
      data.max_amount || 999999,
      data.processing_fee || 0,
      data.instructions || '',
      data.display_order || 0,
      data.is_active !== false,
      JSON.stringify(data.required_fields || [])
    ]
  );
  return res.rows[0];
};

const updatePaymentMethodById = async (id, data) => {
  const res = await pool.query(
    `UPDATE payment_methods 
     SET name = $1, min_amount = $2, max_amount = $3, processing_fee = $4, 
         instructions = $5, display_order = $6, required_fields = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING *`,
    [
      data.name,
      data.min_amount,
      data.max_amount,
      data.processing_fee,
      data.instructions,
      data.display_order,
      JSON.stringify(data.required_fields || []),
      id
    ]
  );
  return res.rows[0];
};

const toggleMethodStatus = async (id) => {
  const res = await pool.query(
    `UPDATE payment_methods 
     SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return res.rows[0];
};

const deleteMethodById = async (id) => {
  await pool.query('DELETE FROM payment_methods WHERE id = $1', [id]);
};

module.exports = { findActivePaymentMethods, findByCode, seedPaymentMethods, findAllPaymentMethods, insertPaymentMethod, updatePaymentMethodById, toggleMethodStatus, deleteMethodById };