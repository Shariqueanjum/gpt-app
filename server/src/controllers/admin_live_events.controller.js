const pool = require('../config/db')
const { emitter } = require('../services/activityEmitter.service')
const { verifyAdminToken } = require('../utils/jwt')

const getRecentCallbackReversals = async (limit = 20) => {
  const res = await pool.query(
    `SELECT t.amount, t.created_at, u.username, u.id AS user_id,
            ow.name AS offer_wall_name,
            t.metadata->>'source' AS source, t.metadata->>'reason' AS reason
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     JOIN offer_walls ow ON ow.id = t.offer_wall_id
     WHERE t.type = 'reversal' AND t.metadata->>'source' = 'callback'
     ORDER BY t.created_at DESC LIMIT $1`,
    [limit]
  )
  return res.rows.map(r => ({
    type: 'reversal_processed', source: 'callback',
    amount: Math.abs(parseFloat(r.amount)),
    username: r.username, user_id: r.user_id,
    offer_wall: r.offer_wall_name, reason: r.reason,
    time: new Date(r.created_at).toISOString(),
  }))
}

const stream = async (req, res) => {
  try {
    req.admin = verifyAdminToken(req.query.token)
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (event, data) => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`) } catch (_) {}
  }

  // DB history — lives forever
  try {
    const seed = await getRecentCallbackReversals(20)
    seed.reverse().forEach(row => send('admin_event', row))
  } catch (_) {}

  // Live events — instant push
  const onAdmin = (event) => send('admin_event', event)
  emitter.on('admin', onAdmin)

  const heartbeat = setInterval(() => send('heartbeat', { ts: Date.now() }), 25000)

  req.on('close', () => {
    emitter.off('admin', onAdmin)
    clearInterval(heartbeat)
  })
}

module.exports = { stream }