const pool = require('../config/db');

const createPending = async (data) => {
  const {
    email, username, password_hash, referral_code, referred_by,
    country, verification_token, expires_at
  } = data;

  await pool.query(
    `INSERT INTO pending_registrations 
    (email, username, password_hash, referral_code, referred_by, country, verification_token, expires_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [email, username, password_hash, referral_code, referred_by, country, verification_token, expires_at]
  );
};

const findByToken = async (token) => {
  const res = await pool.query(
    `SELECT * FROM pending_registrations 
     WHERE verification_token = $1 AND expires_at > NOW()`,
    [token]
  );
  return res.rows[0];
};

const findByEmail = async (email) => {
  const res = await pool.query(
    `SELECT * FROM pending_registrations WHERE email = $1`,
    [email]
  );
  return res.rows[0];
};

const deleteByEmail = async (email) => {
  await pool.query(
    `DELETE FROM pending_registrations WHERE email = $1`,
    [email]
  );
};

module.exports = { createPending, findByToken, findByEmail, deleteByEmail };