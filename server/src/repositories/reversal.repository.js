const pool = require('../config/db');

const findSurveyClickByTransactionId = async (clientOrPool, transactionId) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `SELECT sc.*, u.balance_available, u.balance_locked, u.id as user_id, u.username
     FROM survey_clicks sc
     JOIN users u ON sc.user_id = u.id
     WHERE sc.transaction_id = $1`,
    [transactionId]
  );
  return res.rows[0];
};

const findOriginalTransaction = async (clientOrPool, surveyClickId) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `SELECT * FROM transactions 
     WHERE reference_type = 'survey_click' 
       AND reference_id = $1 
       AND type = 'survey'
     ORDER BY created_at DESC LIMIT 1`,
    [surveyClickId]
  );
  return res.rows[0];
};

const findReferralTransaction = async (clientOrPool, surveyClickId, userId) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `SELECT * FROM transactions 
     WHERE type = 'referral' 
       AND reference_id = $1
       AND metadata->>'from_survey_click' = $2
     LIMIT 1`,
    [userId, surveyClickId.toString()]
  );
  return res.rows[0];
};

const createReversalTransaction = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const {
    user_id, offer_wall_id, reference_type, reference_id,
    amount, referrer_id, referrer_earned, metadata
  } = data;

  const res = await executor.query(
    `INSERT INTO transactions 
    (user_id, type, offer_wall_id, reference_type, reference_id, amount, 
     commission_earned, commission_rate_at_time, referrer_id, referrer_earned, status, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [user_id, 'reversal', offer_wall_id, reference_type, reference_id, amount,
     0, null, referrer_id, referrer_earned, 'reversed', JSON.stringify(metadata)]
  );
  return res.rows[0];
};

const updateSurveyClickReversed = async (clientOrPool, clickId) => {
  const executor = clientOrPool || pool;
  
  await executor.query(
    `UPDATE survey_clicks 
     SET status = 'reversed', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [clickId]
  );
};

const findReversalByReference = async (clientOrPool, referenceType, referenceId) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `SELECT * FROM transactions 
     WHERE reference_type = $1 AND reference_id = $2 AND type = 'reversal'
     LIMIT 1`,
    [referenceType, referenceId]
  );
  return res.rows[0];
};

const findUndoReversalByReference = async (clientOrPool, referenceType, referenceId) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `SELECT * FROM transactions 
     WHERE reference_type = $1 AND reference_id = $2 AND type = 'undo_reversal'
     LIMIT 1`,
    [referenceType, referenceId]
  );
  return res.rows[0];
};

const lockUserForUpdate = async (client, userId) => {
  const res = await client.query(
    `SELECT balance_available, balance_locked FROM users WHERE id = $1 FOR UPDATE`,
    [userId]
  );
  return res.rows[0];
};

const lockSurveyClickForUpdate = async (client, clickId) => {
  const res = await client.query(
    `SELECT status, transaction_id FROM survey_clicks WHERE id = $1 FOR UPDATE`,
    [clickId]
  );
  return res.rows[0];
};

const lockReversalTransaction = async (client, referenceType, referenceId) => {
  const res = await client.query(
    `SELECT * FROM transactions 
     WHERE reference_type = $1 AND reference_id = $2 AND type = 'reversal'
     FOR UPDATE`,
    [referenceType, referenceId]
  );
  return res.rows[0];
};

const lockUndoReversalTransaction = async (client, referenceType, referenceId) => {
  const res = await client.query(
    `SELECT * FROM transactions 
     WHERE reference_type = $1 AND reference_id = $2 AND type = 'undo_reversal'
     FOR UPDATE`,
    [referenceType, referenceId]
  );
  return res.rows[0];
};

module.exports = {
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
};