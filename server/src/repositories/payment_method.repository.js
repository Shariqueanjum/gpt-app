const pool = require('../config/db');

const findActivePaymentMethods = async () => {
  const res = await pool.query(
    `SELECT id, name, code, min_amount, max_amount, processing_fee, instructions, display_order
     FROM payment_methods 
     WHERE is_active = true 
     ORDER BY display_order ASC, id ASC`
  );
  return res.rows;
};

const findByCode = async (code) => {
  const res = await pool.query(
    `SELECT id, name, code, min_amount, max_amount, processing_fee, instructions, is_active
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

module.exports = { findActivePaymentMethods, findByCode, seedPaymentMethods };