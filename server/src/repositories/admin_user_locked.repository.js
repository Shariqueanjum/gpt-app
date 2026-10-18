const pool = require('../config/db');
const { surveyIsReversed, referralIsReversed, safeInt } = require('../utils/adminUserSql');

const num = (v) => parseFloat(v) || 0;
const MAX_ITEMS = 300;

// Locked money that is genuinely still locked: status = locked AND not reversed
const LOCKED_ITEM_WHERE = `
  t.user_id = $1
  AND t.type IN ('survey', 'referral')
  AND t.status = 'locked'
  AND t.amount > 0
  AND NOT (CASE WHEN t.type = 'survey' THEN ${surveyIsReversed('t')} ELSE ${referralIsReversed('t')} END)`;

const getLockedBalance = async (userId) => {
  const res = await pool.query('SELECT balance_locked, balance_available FROM users WHERE id = $1', [userId]);
  return res.rows[0] || null;
};

// Every locked survey / referral commission the user has right now
const findLockedItems = async (userId) => {
  const res = await pool.query(
    `SELECT t.id, t.type, t.amount, t.created_at,
            sc.survey_name, ow.name AS provider,
            t.metadata->>'referred_username' AS referred_username
     FROM transactions t
     LEFT JOIN survey_clicks sc ON t.type = 'survey' AND t.reference_type = 'survey_click' AND sc.id = t.reference_id
     LEFT JOIN offer_walls ow ON ow.id = t.offer_wall_id
     WHERE ${LOCKED_ITEM_WHERE}
     ORDER BY t.created_at DESC
     LIMIT ${MAX_ITEMS}`,
    [userId]
  );
  return res.rows.map((r) => ({ ...r, amount: num(r.amount) }));
};

// Recent unlocks that can still be undone (not undone yet, item still "completed")
const findUndoableUnlocks = async (userId) => {
  const res = await pool.query(
    `WITH u AS (
       SELECT ut.id, ut.amount, ut.created_at,
              COALESCE(ut.metadata->>'original_transaction_id',
                       ut.metadata->>'original_survey_transaction_id',
                       ut.metadata->>'original_referral_transaction_id') AS orig_text
       FROM transactions ut
       WHERE ut.user_id = $1 AND ut.type = 'unlock' AND (ut.metadata->>'undone_at') IS NULL
       ORDER BY ut.created_at DESC
       LIMIT 50
     )
     SELECT u.id, u.amount, u.created_at, o.id AS original_id, o.type AS original_type,
            sc.survey_name, ow.name AS provider,
            o.metadata->>'referred_username' AS referred_username
     FROM u
     JOIN transactions o
       ON o.id = (CASE WHEN u.orig_text ~ '^[0-9]{1,9}$' THEN u.orig_text::int END)
      AND o.user_id = $1 AND o.status = 'completed'
     LEFT JOIN survey_clicks sc ON o.type = 'survey' AND o.reference_type = 'survey_click' AND sc.id = o.reference_id
     LEFT JOIN offer_walls ow ON ow.id = o.offer_wall_id
     WHERE o.type IN ('survey', 'referral')
       AND NOT (CASE WHEN o.type = 'survey' THEN ${surveyIsReversed('o')} ELSE ${referralIsReversed('o')} END)
     ORDER BY u.created_at DESC
     LIMIT 20`,
    [userId]
  );
  return res.rows.map((r) => ({ ...r, amount: num(r.amount) }));
};

// ---- used INSIDE a DB transaction (client = pooled connection with BEGIN) ----

const lockUserRow = async (client, userId) => {
  const res = await client.query(
    'SELECT id, username, balance_available, balance_locked FROM users WHERE id = $1 FOR UPDATE',
    [userId]
  );
  return res.rows[0] || null;
};

// Locks the candidate rows so two admins cannot unlock the same item twice
const lockLockedItems = async (client, userId, ids) => {
  const idFilter = ids ? 'AND t.id = ANY($2::int[])' : '';
  const params = ids ? [userId, ids] : [userId];
  const res = await client.query(
    `SELECT t.id, t.type, t.amount, t.reference_type, t.reference_id, t.offer_wall_id
     FROM transactions t
     WHERE ${LOCKED_ITEM_WHERE} ${idFilter}
     ORDER BY t.id
     FOR UPDATE OF t`,
    params
  );
  return res.rows.map((r) => ({ ...r, amount: num(r.amount) }));
};

const moveLockedToAvailable = async (client, userId, amount) => {
  const res = await client.query(
    `UPDATE users
     SET balance_locked = balance_locked - $1, balance_available = balance_available + $1
     WHERE id = $2
     RETURNING balance_available, balance_locked`,
    [amount, userId]
  );
  return res.rows[0];
};

const moveAvailableToLocked = async (client, userId, amount) => {
  const res = await client.query(
    `UPDATE users
     SET balance_available = balance_available - $1, balance_locked = balance_locked + $1
     WHERE id = $2
     RETURNING balance_available, balance_locked`,
    [amount, userId]
  );
  return res.rows[0];
};

const setTransactionStatus = async (client, txId, status) => {
  await client.query(
    'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [status, txId]
  );
};

const lockUnlockTransaction = async (client, userId, unlockTxId) => {
  const res = await client.query(
    `SELECT id, amount, metadata FROM transactions
     WHERE id = $1 AND user_id = $2 AND type = 'unlock'
     FOR UPDATE`,
    [unlockTxId, userId]
  );
  const row = res.rows[0];
  return row ? { ...row, amount: num(row.amount) } : null;
};

const lockOriginalItem = async (client, userId, originalId) => {
  const res = await client.query(
    `SELECT t.id, t.type, t.status, t.amount, t.reference_type, t.reference_id, t.offer_wall_id,
            (CASE WHEN t.type = 'survey' THEN ${surveyIsReversed('t')} ELSE ${referralIsReversed('t')} END) AS is_reversed
     FROM transactions t
     WHERE t.id = $1 AND t.user_id = $2 AND t.type IN ('survey', 'referral')
     FOR UPDATE OF t`,
    [originalId, userId]
  );
  const row = res.rows[0];
  return row ? { ...row, amount: num(row.amount) } : null;
};

const markUnlockUndone = async (client, unlockTxId, adminId, undoTxId) => {
  await client.query(
    `UPDATE transactions
     SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
           'undone_at', to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
           'undone_by_admin_id', $2::int,
           'undo_transaction_id', $3::int),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [unlockTxId, adminId, undoTxId]
  );
};

const insertAuditLog = async (client, adminId, action, userId, details, ip) => {
  await client.query(
    `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
     VALUES ($1, $2, 'user', $3, $4, $5)`,
    [adminId, action, userId, JSON.stringify(details), String(ip || 'unknown').slice(0, 45)]
  );
};

module.exports = {
  getLockedBalance, findLockedItems, findUndoableUnlocks,
  lockUserRow, lockLockedItems, moveLockedToAvailable, moveAvailableToLocked,
  setTransactionStatus, lockUnlockTransaction, lockOriginalItem, markUnlockUndone, insertAuditLog
};
