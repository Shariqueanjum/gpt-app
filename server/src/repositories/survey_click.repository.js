const pool = require('../config/db');

const createSurveyClick = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const {
    user_id, offer_wall_id, transaction_id, integration_type,
    survey_id, survey_name, loi, country, cpa_original, cpa_user,
    commission_rate, status, expires_at
  } = data;

  const res = await executor.query(
    `INSERT INTO survey_clicks 
    (user_id, offer_wall_id, transaction_id, integration_type, survey_id, survey_name, loi, country, cpa_original, cpa_user, commission_rate, status, expires_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [user_id, offer_wall_id, transaction_id, integration_type, survey_id, survey_name, loi, country, cpa_original, cpa_user, commission_rate, status, expires_at]
  );
  return res.rows[0];
};

const findByTransactionId = async (transactionId) => {
  const res = await pool.query(
    `SELECT * FROM survey_clicks WHERE transaction_id = $1`,
    [transactionId]
  );
  return res.rows[0];
};

const findByExternalTransactionId = async (externalId) => {
  const res = await pool.query(
    `SELECT * FROM survey_clicks WHERE external_transaction_id = $1`,
    [externalId]
  );
  return res.rows[0];
};

const externalTransactionIdExists = async (externalId) => {
  const res = await pool.query(
    `SELECT id FROM survey_clicks WHERE external_transaction_id = $1 LIMIT 1`,
    [externalId]
  );
  return res.rows.length > 0;
};

const updateExternalTransactionId = async (clientOrPool, clickId, externalId) => {
  const executor = clientOrPool || pool;
  const exists = await externalTransactionIdExists(externalId);
  if (exists) {
    const error = new Error('External transaction ID already exists');
    error.status = 409;
    throw error;
  }

  const res = await executor.query(
    `UPDATE survey_clicks 
     SET external_transaction_id = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [externalId, clickId]
  );
  return res.rows[0];
};

const lockSurveyClickById = async (client, clickId) => {
  const res = await client.query(
    `SELECT * FROM survey_clicks WHERE id = $1 FOR UPDATE`,
    [clickId]
  );
  return res.rows[0];
};

const lockSurveyClickByTransactionId = async (client, transactionId) => {
  const res = await client.query(
    `SELECT * FROM survey_clicks WHERE transaction_id = $1 FOR UPDATE`,
    [transactionId]
  );
  return res.rows[0];
};

const lockSurveyClickByExternalId = async (client, externalId) => {
  const res = await client.query(
    `SELECT * FROM survey_clicks WHERE external_transaction_id = $1 FOR UPDATE`,
    [externalId]
  );
  return res.rows[0];
};



module.exports = { createSurveyClick, findByTransactionId ,findByExternalTransactionId, externalTransactionIdExists, updateExternalTransactionId, lockSurveyClickById, lockSurveyClickByTransactionId, lockSurveyClickByExternalId };