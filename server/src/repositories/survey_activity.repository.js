const pool = require('../config/db');

const ALLOWED_SORT_COLUMNS = ['created_at', 'updated_at', 'cpa_user', 'id'];
const MAX_LIMIT = 100;

// Clicks created by the credit flow itself when a postback arrives with no
// matching click (iframe walls) get this prefix — see credit.service.js
const AUTO_CREATED_PREFIX = 'TXN-AUTO-';

// Escape LIKE wildcards so an admin typing "50%" or "A_B" searches literally
const likeContains = (value) => `%${String(value).replace(/[\\%_]/g, '\\$&')}%`;

/**
 * Builds the WHERE clause shared by the list, count and stats queries.
 * Expects the query to alias: survey_clicks sc, users u, offer_walls ow.
 * skipStatus is used by stats so the status chips can show the spread of
 * every status for the *other* active filters.
 */
const buildClickWhere = (filters = {}, { skipStatus = false } = {}) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  const push = (value) => {
    values.push(value);
    return `$${idx++}`;
  };

  if (filters.transactionId) {
    // Matches the click's own id, OR the id its postbacks arrived under (CPX sends
    // the first click's id as sub_id for later conversions, so searching it finds all)
    const p = push(likeContains(filters.transactionId));
    conditions.push(
      `(sc.transaction_id ILIKE ${p} OR EXISTS (
         SELECT 1 FROM traffic_logs tl
         WHERE tl.survey_click_id = sc.id AND tl.internal_transaction_id ILIKE ${p}
       ))`
    );
  }

  if (filters.externalTransactionId) {
    conditions.push(`sc.external_transaction_id ILIKE ${push(likeContains(filters.externalTransactionId))}`);
  }

  if (filters.user) {
    const p = push(likeContains(filters.user));
    conditions.push(`(u.username ILIKE ${p} OR u.email ILIKE ${p} OR u.public_id ILIKE ${p})`);
  }

  if (filters.userId) {
    conditions.push(`sc.user_id = ${push(filters.userId)}`);
  }

  if (!skipStatus && filters.status) {
    if (filters.status === 'not_completed') {
      conditions.push(`sc.status NOT IN ('pending', 'completed', 'reversed')`);
    } else {
      conditions.push(`sc.status = ${push(filters.status)}`);
    }
  }

  if (filters.wallType) {
    conditions.push(`sc.integration_type = ${push(filters.wallType)}`);
  }

  if (filters.offerWallId) {
    conditions.push(`sc.offer_wall_id = ${push(filters.offerWallId)}`);
  }

  if (filters.origin === 'auto_created') {
    conditions.push(`sc.transaction_id LIKE '${AUTO_CREATED_PREFIX}%'`);
  } else if (filters.origin === 'direct') {
    conditions.push(`sc.transaction_id NOT LIKE '${AUTO_CREATED_PREFIX}%'`);
  }

  if (filters.postback === 'received') {
    conditions.push(
      `EXISTS (SELECT 1 FROM traffic_logs tl WHERE tl.survey_click_id = sc.id AND tl.direction = 'incoming')`
    );
  } else if (filters.postback === 'none') {
    conditions.push(
      `NOT EXISTS (SELECT 1 FROM traffic_logs tl WHERE tl.survey_click_id = sc.id AND tl.direction = 'incoming')`
    );
  }

  if (filters.funds) {
    // 'locked' = payout is held in the user's locked balance; 'available' = spendable
    const txStatus = filters.funds === 'locked' ? 'locked' : 'completed';
    conditions.push(
      `EXISTS (
         SELECT 1 FROM transactions t
         WHERE t.reference_type = 'survey_click' AND t.reference_id = sc.id
           AND t.type = 'survey' AND t.status = '${txStatus}'
       )`
    );
  }

  if (filters.minPoints !== undefined && filters.minPoints !== null) {
    conditions.push(`sc.cpa_user >= ${push(filters.minPoints)}`);
  }
  if (filters.maxPoints !== undefined && filters.maxPoints !== null) {
    conditions.push(`sc.cpa_user <= ${push(filters.maxPoints)}`);
  }

  // Whole-day range, inclusive of date_to
  if (filters.dateFrom) {
    conditions.push(`sc.created_at >= ${push(filters.dateFrom)}::date`);
  }
  if (filters.dateTo) {
    conditions.push(`sc.created_at < (${push(filters.dateTo)}::date + INTERVAL '1 day')`);
  }

  if (filters.hideStalePending) {
    conditions.push(`NOT (sc.status = 'pending' AND sc.created_at < NOW() - INTERVAL '24 hours')`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
    nextIndex: idx
  };
};

const CLICK_FROM = `
  FROM survey_clicks sc
  JOIN users u ON u.id = sc.user_id
  LEFT JOIN offer_walls ow ON ow.id = sc.offer_wall_id`;

// Same columns for the list rows and the single-click detail
const CLICK_SELECT = `
  sc.id,
  sc.transaction_id,
  sc.external_transaction_id,
  sc.status,
  sc.integration_type,
  sc.survey_id,
  sc.survey_name,
  sc.loi,
  sc.country,
  sc.cpa_original,
  sc.cpa_user,
  sc.commission_rate,
  sc.created_at,
  sc.updated_at,
  sc.expires_at,
  (sc.transaction_id LIKE '${AUTO_CREATED_PREFIX}%') AS is_auto_created,

  u.id         AS user_id,
  u.username   AS username,
  u.public_id  AS user_public_id,
  u.email      AS user_email,
  u.country    AS user_country,
  u.is_active  AS user_is_active,
  u.balance_available AS user_balance_available,
  u.balance_locked    AS user_balance_locked,

  ow.id          AS offer_wall_id,
  ow.name        AS offer_wall_name,
  ow.internal_id AS offer_wall_internal_id,
  ow.type        AS offer_wall_type,

  st.id     AS credit_transaction_id,
  st.status AS credit_status,
  st.amount AS credited_amount,

  rv.id         AS reversal_transaction_id,
  rv.amount     AS reversed_amount,
  rv.created_at AS reversed_at,
  rv.metadata   AS reversal_metadata,
  EXISTS (
    SELECT 1 FROM transactions ut
    WHERE ut.reference_type = 'survey_click' AND ut.reference_id = sc.id AND ut.type = 'undo_reversal'
  ) AS was_undone,

  pb.postback_count,
  pb.last_postback_at`;

// Per-click aggregates. Applied to an already-limited page, so these run for
// at most one page of rows rather than the whole table.
const CLICK_LATERALS = `
  LEFT JOIN LATERAL (
    SELECT id, status, amount FROM transactions
    WHERE reference_type = 'survey_click' AND reference_id = sc.id AND type = 'survey'
    ORDER BY created_at DESC, id DESC LIMIT 1
  ) st ON true
  LEFT JOIN LATERAL (
    SELECT id, amount, created_at, metadata FROM transactions
    WHERE reference_type = 'survey_click' AND reference_id = sc.id AND type = 'reversal'
      AND NOT EXISTS (
        SELECT 1 FROM transactions ut
        WHERE ut.reference_type = 'survey_click' AND ut.reference_id = sc.id
          AND ut.type = 'undo_reversal' AND ut.created_at > transactions.created_at
      )
    ORDER BY created_at DESC, id DESC LIMIT 1
  ) rv ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS postback_count, MAX(created_at) AS last_postback_at
    FROM traffic_logs
    WHERE survey_click_id = sc.id AND direction = 'incoming'
  ) pb ON true`;

const findSurveyActivity = async (filters = {}, pagination = {}, sort = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), MAX_LIMIT);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_SORT_COLUMNS.includes(sort.column) ? sort.column : 'created_at';
  const sortOrder = sort.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { whereClause, values, nextIndex } = buildClickWhere(filters);

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total ${CLICK_FROM} ${whereClause}`,
    values
  );
  const total = countRes.rows[0].total;

  // Page first (cheap, uses the sort column), then attach the aggregates
  const dataRes = await pool.query(
    `WITH page AS (
       SELECT sc.id
       ${CLICK_FROM}
       ${whereClause}
       ORDER BY sc.${sortColumn} ${sortOrder}, sc.id DESC
       LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
     )
     SELECT ${CLICK_SELECT}
     FROM page
     JOIN survey_clicks sc ON sc.id = page.id
     JOIN users u ON u.id = sc.user_id
     LEFT JOIN offer_walls ow ON ow.id = sc.offer_wall_id
     ${CLICK_LATERALS}
     ORDER BY sc.${sortColumn} ${sortOrder}, sc.id DESC`,
    [...values, limit, offset]
  );

  return {
    data: dataRes.rows,
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

// Counts per status for the active filters (status filter itself ignored)
const getSurveyActivityStats = async (filters = {}) => {
  const { whereClause, values } = buildClickWhere(filters, { skipStatus: true });

  const res = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE sc.status = 'pending')::int AS pending,
       COUNT(*) FILTER (WHERE sc.status = 'completed')::int AS completed,
       COUNT(*) FILTER (WHERE sc.status = 'reversed')::int AS reversed,
       COUNT(*) FILTER (WHERE sc.status NOT IN ('pending', 'completed', 'reversed'))::int AS not_completed,
       COALESCE(SUM(sc.cpa_user) FILTER (WHERE sc.status = 'completed'), 0) AS completed_points,
       COALESCE(SUM(sc.cpa_user) FILTER (WHERE sc.status = 'reversed'), 0) AS reversed_points
     ${CLICK_FROM}
     ${whereClause}`,
    values
  );

  return res.rows[0];
};

const findClickDetail = async (clickId) => {
  const res = await pool.query(
    `SELECT ${CLICK_SELECT}
     ${CLICK_FROM}
     ${CLICK_LATERALS}
     WHERE sc.id = $1`,
    [clickId]
  );
  return res.rows[0];
};

/**
 * Every traffic log row belonging to a click, oldest first.
 *
 * Rows written since click linking was added match on survey_click_id. Older
 * rows have no link, so they are matched by the ids they carry — but only when
 * unlinked, so a linked row is never claimed by a second click:
 *   - outgoing click rows carry our transaction id
 *   - incoming postbacks carry the provider id when the click stored one,
 *     otherwise our id (router / api / direct walls)
 */
const findClickTrafficEvents = async (click) => {
  const res = await pool.query(
    `SELECT
       id, direction, type, method, url,
       headers, query_params, request_body,
       response_status, response_body,
       ip_address, user_agent, processing_time_ms,
       error_message, error_stack, processing_result,
       internal_transaction_id, external_transaction_id,
       survey_click_id, created_at
     FROM traffic_logs
     WHERE survey_click_id = $1
        OR (survey_click_id IS NULL AND (
              (direction = 'outgoing' AND internal_transaction_id = $2)
           OR (direction = 'incoming' AND (
                 ($3::text IS NOT NULL AND external_transaction_id = $3)
              OR ($3::text IS NULL AND internal_transaction_id = $2)
              ))
        ))
     ORDER BY created_at ASC, id ASC
     LIMIT 200`,
    [click.id, click.transaction_id, click.external_transaction_id || null]
  );
  return res.rows;
};

// Permanent money trail for a click: credit, referral commission, reversal, undo
const findClickMoneyEvents = async (clickId) => {
  const res = await pool.query(
    `SELECT
       t.id, t.user_id, u.username, t.type, t.status, t.amount,
       t.reference_type, t.reference_id, t.metadata, t.created_at
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     WHERE (t.reference_type = 'survey_click' AND t.reference_id = $1)
        OR (t.type = 'referral' AND t.metadata->>'from_survey_click' = $1::text)
        OR (t.type = 'reversal' AND t.reference_type = 'referral' AND t.reference_id IN (
              SELECT id FROM transactions
              WHERE type = 'referral' AND metadata->>'from_survey_click' = $1::text
           ))
     ORDER BY t.created_at ASC, t.id ASC`,
    [clickId]
  );
  return res.rows;
};

// Options for the filter dropdowns — only values that actually exist
const findFilterOptions = async () => {
  const [walls, statuses] = await Promise.all([
    pool.query(`SELECT id, name, internal_id, type FROM offer_walls ORDER BY name ASC`),
    pool.query(`SELECT DISTINCT status FROM survey_clicks WHERE status IS NOT NULL ORDER BY status ASC`)
  ]);

  return {
    offer_walls: walls.rows,
    statuses: statuses.rows.map((r) => r.status)
  };
};

module.exports = {
  findSurveyActivity,
  getSurveyActivityStats,
  findClickDetail,
  findClickTrafficEvents,
  findClickMoneyEvents,
  findFilterOptions,
  buildClickWhere,
  AUTO_CREATED_PREFIX
};
