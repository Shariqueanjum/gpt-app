// ============================================================
// surveyActivityConstants.js — labels, colours, formatters and the
// default filter set shared by every Survey Activity component.
// ============================================================

// 100 points = $1 — same convention used everywhere else in the admin panel
export const POINTS_TO_DOLLAR = 100

export const formatPoints = (n) =>
  `${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} pts`

export const formatDollar = (n) => `$${(Number(n || 0) / POINTS_TO_DOLLAR).toFixed(2)}`

// ---- status / wall presentation ------------------------------------------------

export const STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#10b981' },
  reversed: { label: 'Reversed', color: '#ef4444' },
  failed: { label: 'Failed', color: '#6b7280' },
  quota_full: { label: 'Quota full', color: '#8b5cf6' },
  security_terminated: { label: 'Security terminated', color: '#dc2626' },
  terminated: { label: 'Terminated', color: '#6b7280' },
}

// Providers can send statuses we have no colour for — never crash on those
export const getStatusMeta = (status) =>
  STATUS_META[status] || { label: String(status || 'unknown').replace(/_/g, ' '), color: '#6b7280' }

export const WALL_TYPE_META = {
  iframe: { label: 'Iframe', color: '#2563eb' },
  router: { label: 'Router', color: '#8b5cf6' },
  api: { label: 'API', color: '#0ea5e9' },
}

export const getWallTypeMeta = (type) =>
  WALL_TYPE_META[type] || { label: String(type || '—'), color: '#6b7280' }

// ---- filter option lists ---------------------------------------------------------

export const WALL_TYPE_OPTIONS = [
  { value: '', label: 'All wall types' },
  { value: 'iframe', label: 'Iframe' },
  { value: 'router', label: 'Router' },
  { value: 'api', label: 'API' },
]

export const ORIGIN_OPTIONS = [
  { value: '', label: 'Any origin' },
  { value: 'direct', label: 'Direct click' },
  { value: 'auto_created', label: 'Auto-created from postback' },
]

export const POSTBACK_OPTIONS = [
  { value: '', label: 'Any postback state' },
  { value: 'received', label: 'Postback received' },
  { value: 'none', label: 'No postback yet' },
]

export const FUNDS_OPTIONS = [
  { value: '', label: 'Any funds state' },
  { value: 'available', label: 'Funds available' },
  { value: 'locked', label: 'Funds locked' },
]

export const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'updated_at:desc', label: 'Recently updated' },
  { value: 'cpa_user:desc', label: 'Points: high → low' },
  { value: 'cpa_user:asc', label: 'Points: low → high' },
]

// Statuses we always offer, merged with whatever the database actually contains
export const BASE_STATUS_VALUES = ['pending', 'completed', 'reversed', 'failed', 'quota_full', 'security_terminated']

// ---- dates -------------------------------------------------------------------------

const toDateString = (d) => d.toISOString().slice(0, 10)

// Whole-day UTC ranges — the admin panel shows UTC everywhere
export const DATE_PRESETS = [
  { key: 'today', label: 'Today', range: () => { const t = toDateString(new Date()); return { date_from: t, date_to: t } } },
  { key: 'yesterday', label: 'Yesterday', range: () => { const y = toDateString(new Date(Date.now() - 86400000)); return { date_from: y, date_to: y } } },
  { key: '7d', label: 'Last 7 days', range: () => ({ date_from: toDateString(new Date(Date.now() - 6 * 86400000)), date_to: toDateString(new Date()) }) },
  { key: '30d', label: 'Last 30 days', range: () => ({ date_from: toDateString(new Date(Date.now() - 29 * 86400000)), date_to: toDateString(new Date()) }) },
]

// ---- filters -----------------------------------------------------------------------

export const DEFAULT_FILTERS = {
  transaction_id: '',
  external_transaction_id: '',
  user: '',
  user_id: '',
  status: '',
  wall_type: '',
  offer_wall_id: '',
  origin: '',
  postback: '',
  funds: '',
  min_points: '',
  max_points: '',
  date_from: '',
  date_to: '',
  hide_stale_pending: false,
  sort: 'created_at:desc',
}

// Filters typed by hand — debounced so we don't query on every keystroke
export const TEXT_FILTER_KEYS = ['transaction_id', 'external_transaction_id', 'user', 'min_points', 'max_points']

// How many filters the admin has switched on (sort is not a filter)
export const countActiveFilters = (filters) =>
  Object.entries(filters).filter(([key, value]) => {
    if (key === 'sort') return false
    if (typeof value === 'boolean') return value
    return value !== '' && value !== null && value !== undefined
  }).length

// Turns UI filter state into API query params, dropping anything empty
export const buildQueryParams = (filters) => {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'sort') return
    if (typeof value === 'boolean') {
      if (value) params[key] = 'true'
      return
    }
    const trimmed = typeof value === 'string' ? value.trim() : value
    if (trimmed !== '' && trimmed !== null && trimmed !== undefined) params[key] = trimmed
  })

  const [sortBy, sortOrder] = (filters.sort || 'created_at:desc').split(':')
  params.sort_by = sortBy
  params.sort_order = sortOrder
  return params
}

// Pulls the exact ids out of an error response so dialogs can show them
export const getApiErrorMessage = (err, fallback) => {
  const msg = err?.response?.data?.message
  if (Array.isArray(msg)) return msg.join(', ')
  return msg || fallback
}
