// ============================================================
// userDetailFormat.js — one place for how the admin user detail
// shows money and dates. Everything in the backend is in POINTS.
// 100 points = $1  (e.g. 756 pts  ->  $7.56)
// ============================================================
export const POINTS_TO_DOLLAR = 100

const toNumber = (n) => {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

// 1234.5 -> "1,234.5"   (no useless trailing zeros)
export const formatNumber = (n) =>
  toNumber(n).toLocaleString('en-US', { maximumFractionDigits: 2 })

export const formatPoints = (n) => `${formatNumber(n)} pts`

// 756 -> "$7.56"   -150 -> "-$1.50"
export const formatDollar = (n) => {
  const dollars = toNumber(n) / POINTS_TO_DOLLAR
  const abs = Math.abs(dollars).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${dollars < 0 ? '-' : ''}$${abs}`
}

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

export const formatShortDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// Pretty label for ledger types: "level_up_bonus" -> "Level up bonus"
export const humanize = (value) => {
  if (!value) return '—'
  const s = String(value).replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Status -> colour used by every pill in the detail view
export const STATUS_COLORS = {
  completed: '#10b981',
  paid: '#10b981',
  active: '#ef4444',
  locked: '#f59e0b',
  pending: '#f59e0b',
  processing: '#2563eb',
  reversed: '#ef4444',
  rejected: '#ef4444',
  cancelled: '#9ca3af',
  undone: '#9ca3af',
}
export const statusColor = (s) => STATUS_COLORS[s] || '#6b7280'
