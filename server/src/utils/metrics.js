// ---------------------------------------------------------------------------
// Prometheus metrics for the app (numbers only: counts, durations, pool and process figures).
//
// Rules this file follows so it can never hurt the site:
//   * No personal data in any label (no user ids, usernames, emails, IPs, query strings).
//   * Few distinct label values (routes are patterns like /api/auth/login, not real URLs).
//   * Every recording function is wrapped in try/catch: a metrics problem is swallowed, never thrown.
//   * If the prom-client package is missing, everything here turns into harmless no-ops and the app still starts.
//   * The metrics web server is SEPARATE from the website port, only starts when METRICS_PORT is set,
//     and listens only on METRICS_HOST (default 127.0.0.1), so it is not reachable from the internet.
// ---------------------------------------------------------------------------
const http = require('http');
const { logger } = require('./logger');

let client = null;
try {
  client = require('prom-client');
} catch (err) {
  try { logger.warn({ event: 'metrics_disabled', reason: 'prom-client not installed' }, 'Metrics disabled: prom-client is not installed (run npm install)'); } catch (_) {}
}

const noop = () => {};

// ---- fallback when prom-client is not available -----------------------------------------------
if (!client) {
  module.exports = {
    httpMetricsMiddleware: (req, res, next) => next(),
    startMetricsServer: noop,
    recordLogin: noop,
    recordRegister: noop,
    recordWithdrawal: noop,
    recordCallback: noop
  };
  return;
}

const register = new client.Registry();

// Default process figures: CPU, memory, heap, garbage collection and EVENT-LOOP LAG (nodejs_eventloop_lag_*).
client.collectDefaultMetrics({ register });

// ---- database pool (read from the existing pg pool; no extra queries) ---------------------------
const pool = require('../config/db');
new client.Gauge({
  name: 'gptapp_db_pool_connections',
  help: 'Connections of the app database pool by state: total, idle (free), waiting (requests queued for a connection)',
  labelNames: ['state'],
  registers: [register],
  collect() {
    this.set({ state: 'total' }, pool.totalCount || 0);
    this.set({ state: 'idle' }, pool.idleCount || 0);
    this.set({ state: 'waiting' }, pool.waitingCount || 0);
  }
});
new client.Gauge({
  name: 'gptapp_db_pool_max',
  help: 'Configured maximum size of the app database pool',
  registers: [register],
  collect() { this.set(pool.options && pool.options.max ? pool.options.max : 10); }
});

// ---- open live-activity (SSE) streams: each one is a listener on the activity emitter ----------
const { emitter } = require('../services/activityEmitter.service');
new client.Gauge({
  name: 'gptapp_sse_activity_streams',
  help: 'Open live-activity (SSE) streams',
  registers: [register],
  collect() { this.set(emitter.listenerCount('activity')); }
});

// ---- HTTP -------------------------------------------------------------------------------------
const httpDuration = new client.Histogram({
  name: 'gptapp_http_request_duration_seconds',
  help: 'API request duration in seconds by method, route pattern and status',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

// Same quiet paths as the request logger: health checks, root and long-lived SSE streams.
const isQuiet = (path) =>
  path === '/' || path === '/health' || path === '/api' || path === '/api/' || path === '/api/health' || path.endsWith('/stream');

// Route PATTERN (e.g. /api/callback/:internal_id), never the real URL, so labels stay few.
// The pattern is taken from the matched Express route; the mount prefix is the real path minus the route's own segments.
const seenRoutes = new Set();
const MAX_ROUTES = 300;
const routeLabel = (req) => {
  const route = req.route;
  if (!route || typeof route.path !== 'string') return 'unmatched';   // 404s, scanners, rejections before a route matched
  if (route.path.includes('*')) return 'wildcard';
  const full = (req.originalUrl || req.url || '').split('?')[0].replace(/\/+$/, '');
  const parts = full.split('/').filter(Boolean);
  const own = route.path.split('/').filter(Boolean).length;
  const prefix = parts.slice(0, Math.max(0, parts.length - own));
  const tail = route.path === '/' ? '' : route.path.replace(/\/+$/, '');
  const label = ((prefix.length ? '/' + prefix.join('/') : '') + tail).slice(0, 80) || '/';
  if (seenRoutes.has(label)) return label;
  if (seenRoutes.size >= MAX_ROUTES) return 'overflow';
  seenRoutes.add(label);
  return label;
};

const httpMetricsMiddleware = (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') return next();                       // CORS preflights are noise
    const path = (req.originalUrl || req.url || '').split('?')[0];
    if (isQuiet(path)) return next();
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      try {
        const seconds = Number(process.hrtime.bigint() - start) / 1e9;
        httpDuration.observe({ method: req.method, route: routeLabel(req), status: String(res.statusCode) }, seconds);
      } catch (_) { /* never break a request because of metrics */ }
    });
  } catch (_) { /* ignore */ }
  next();
};

// ---- business events (counts only) ------------------------------------------------------------
const durationBuckets = [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5];
const loginTotal = new client.Counter({ name: 'gptapp_login_total', help: 'Login attempts by result and HTTP status', labelNames: ['result', 'status'], registers: [register] });
const loginDuration = new client.Histogram({ name: 'gptapp_login_duration_seconds', help: 'Total login time in seconds', labelNames: ['result'], buckets: durationBuckets, registers: [register] });
const bcryptDuration = new client.Histogram({ name: 'gptapp_login_bcrypt_seconds', help: 'Password check (bcrypt) time during login in seconds', buckets: durationBuckets, registers: [register] });
const vpnDuration = new client.Histogram({ name: 'gptapp_login_vpn_check_seconds', help: 'VPN check (external service) time during login in seconds', buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30], registers: [register] });
const registerTotal = new client.Counter({ name: 'gptapp_register_total', help: 'Registration attempts by result', labelNames: ['result'], registers: [register] });
const withdrawalTotal = new client.Counter({ name: 'gptapp_withdrawal_requests_total', help: 'Withdrawal requests created', registers: [register] });
const callbackTotal = new client.Counter({ name: 'gptapp_callback_total', help: 'Offer-wall callbacks by wall and outcome event', labelNames: ['offer_wall', 'event'], registers: [register] });

const recordLogin = (result, status, totalMs, timings) => {
  try {
    loginTotal.inc({ result, status: String(status || 0) });
    if (Number.isFinite(totalMs)) loginDuration.observe({ result }, totalMs / 1000);
    if (timings && Number.isFinite(timings.bcrypt_ms)) bcryptDuration.observe(timings.bcrypt_ms / 1000);
    if (timings && Number.isFinite(timings.vpn_check_ms)) vpnDuration.observe(timings.vpn_check_ms / 1000);
  } catch (_) {}
};
const recordRegister = (result) => { try { registerTotal.inc({ result }); } catch (_) {} };
const recordWithdrawal = () => { try { withdrawalTotal.inc(); } catch (_) {} };

// Only a wall that exists in the database is used as a label (a made-up name in the URL becomes "unknown").
const recordCallback = (event, knownWall) => {
  try {
    callbackTotal.inc({ offer_wall: knownWall ? String(knownWall).slice(0, 40) : 'unknown', event: String(event).slice(0, 40) });
  } catch (_) {}
};

// ---- the separate metrics web server ------------------------------------------------------------
const startMetricsServer = () => {
  try {
    const port = Number(process.env.METRICS_PORT);
    if (!port) return;                                    // off unless configured
    const host = process.env.METRICS_HOST || '127.0.0.1';  // private address only, never the public IP

    const server = http.createServer(async (req, res) => {
      try {
        const path = (req.url || '').split('?')[0];
        if (req.method === 'GET' && path === '/metrics') {
          res.writeHead(200, { 'Content-Type': register.contentType });
          res.end(await register.metrics());
        } else {
          res.writeHead(404);
          res.end();
        }
      } catch (_) {
        try { res.writeHead(500); res.end(); } catch (__) {}
      }
    });

    // If the address is not ready yet (e.g. Docker starts after the app at boot) try again later; never crash the app.
    server.on('error', (err) => {
      try { logger.warn({ event: 'metrics_server_error', code: err.code, host, port }, 'Metrics server could not listen; retrying in 30 s'); } catch (_) {}
      setTimeout(() => { try { server.listen(port, host); } catch (_) {} }, 30000).unref();
    });
    server.listen(port, host, () => {
      try { logger.info({ event: 'metrics_server_started', host, port }, `Metrics server listening on ${host}:${port}`); } catch (_) {}
    });
    server.unref();                                       // never keeps the process alive by itself
  } catch (err) {
    try { logger.warn({ event: 'metrics_server_error', err }, 'Metrics server failed to start'); } catch (_) {}
  }
};

module.exports = { httpMetricsMiddleware, startMetricsServer, recordLogin, recordRegister, recordWithdrawal, recordCallback };
