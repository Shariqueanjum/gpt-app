const pool = require('../config/db')
const { emitter } = require('../services/activityEmitter.service')

/**
 * GET /api/live-activity/stream
 *
 * Server-Sent Events — truly real-time, zero polling.
 * Events fire the instant they happen anywhere on the server.
 *
 * Events:
 *   "activity"  → survey_completed | user_registered
 *   "heartbeat" → every 25s to keep the connection alive through proxies
 */
const stream = async (req, res) => {
  res.setHeader('Content-Type',      'text/event-stream')
  res.setHeader('Cache-Control',     'no-cache')
  res.setHeader('Connection',        'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  const send = (event, data) => {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    } catch (_) {}
  }

  // 1. Immediately send last 15 events so feed isn't empty on connect
  try {
    const seed = await getRecentActivity(15)
    seed.reverse().forEach(row => send('activity', row))
  } catch (_) {}

  // 2. Subscribe to real-time events — fires instantly, no polling
  const onActivity = (event) => send('activity', event)
  emitter.on('activity', onActivity)

  // 3. Heartbeat every 25s
  const heartbeat = setInterval(() => send('heartbeat', { ts: Date.now() }), 25000)

  // 4. Clean up on disconnect
  req.on('close', () => {
    emitter.off('activity', onActivity)
    clearInterval(heartbeat)
  })
}

/**
 * GET /api/live-activity/recent?limit=20
 * REST fallback — initial load before SSE connects.
 */
const recent = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)
    const rows  = await getRecentActivity(limit)
    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
}

// ── DB helpers ────────────────────────────────────────────────────────────────

const getRecentActivity = async (limit) => {
  // Merge survey completions + registrations, newest first
  const res = await pool.query(
    `(
      SELECT
        tl.id::text AS id,
        'survey_completed' AS type,
         tl.user_username AS username, 
        tl.offer_wall_name                                  AS offer_wall,
        (tl.processing_result->>'user_credited')::text      AS amount_raw,
        COALESCE(
          (SELECT country FROM users WHERE id = tl.user_id LIMIT 1),
          'Unknown'
        )                                                   AS country,
        tl.created_at
      FROM traffic_logs tl
      WHERE tl.direction = 'incoming'
        AND tl.type      = 's2s_callback'
        AND (tl.processing_result->>'success')::boolean = true
        AND tl.user_username IS NOT NULL
    )
    UNION ALL
    (
      SELECT
        id::text                                            AS id,
        'user_registered'                                   AS type,
        username,
        NULL                                               AS offer_wall,
        NULL                                               AS amount_raw,
        COALESCE(country, 'Unknown')                       AS country,
        created_at
      FROM users
      WHERE created_at > NOW() - INTERVAL '7 days'
    )
    ORDER BY created_at DESC
    LIMIT $1`,
    [limit]
  )
  return res.rows.map(formatRow)
}

const formatRow = (row) => ({
  id:         row.id,
  type:       row.type,
  username:   row.username || 'Anonymous',
  offer_wall: row.offer_wall || null,
  amount:    row.amount_raw ? parseFloat(row.amount_raw).toFixed(0) : null,
  country:    row.country || 'Unknown',
  time:       row.created_at,
})

module.exports = { stream, recent }
