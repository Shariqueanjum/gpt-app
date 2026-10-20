// Shared helpers for the Revenue & Profit page.
// Money is always POINTS from the API (100 points = $1); formatDollar/PointsCell turn that into dollars.
export { formatNumber, formatPoints, formatDollar } from '../userDetail/userDetailFormat'

// 1 survey / 2 surveys
export const plural = (n, word, pluralWord) => `${n} ${Number(n) === 1 ? word : (pluralWord || word + 's')}`

export const formatPercent = (n) => `${(Number(n) || 0).toFixed(1)}%`

// Chart axis: points -> compact dollars ("$1.2K")
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const formatAxisDollar = (points) => {
  const d = (Number(points) || 0) / 100
  return `${d < 0 ? '-' : ''}$${compact.format(Math.abs(d))}`
}

// Change vs the previous period: { pct, direction } (pct is null when there is nothing to compare with)
export const changeVs = (current, previous) => {
  const cur = Number(current) || 0
  const prev = Number(previous) || 0
  if (prev === 0) return { pct: null, direction: cur === 0 ? 'flat' : cur > 0 ? 'up' : 'down' }
  const pct = ((cur - prev) / Math.abs(prev)) * 100
  return { pct, direction: pct > 0.05 ? 'up' : pct < -0.05 ? 'down' : 'flat' }
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// 'YYYY-MM-DD' bucket key -> { year, month (1-12), quarter (1-4) }
export const parseBucketKey = (key) => {
  const year = parseInt(key.slice(0, 4), 10)
  const month = parseInt(key.slice(5, 7), 10)
  return { year, month, quarter: Math.floor((month - 1) / 3) + 1 }
}

export const GRANULARITIES = [
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]

export const TONES = {
  client: '#2563eb',
  revenue: '#7c3aed',
  loss: '#ef4444',
  profit: '#10b981',
  muted: '#9ca3af',
  bonus: '#f59e0b',
  referral: '#ec4899',
}
