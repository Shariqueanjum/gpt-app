// ============================================================
// HistoryPage.jsx — "Reports" — Full Transaction Report
// Uses EXACT types & statuses from server/src/constants/transactionTypes.js
// Filters: type, status, date_from, date_to, sort_by, sort_order
// ============================================================
import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  MenuItem, Select, FormControl, InputLabel, useTheme, useMediaQuery,
  IconButton, Tooltip, Collapse, Avatar,
} from '@mui/material'
import PollIcon              from '@mui/icons-material/Poll'
import PeopleIcon            from '@mui/icons-material/People'
import CardGiftcardIcon      from '@mui/icons-material/CardGiftcard'
import WhatshotIcon          from '@mui/icons-material/Whatshot'
import UndoIcon              from '@mui/icons-material/Undo'
import TuneIcon              from '@mui/icons-material/Tune'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import EmojiEventsIcon       from '@mui/icons-material/EmojiEvents'
import GppBadIcon            from '@mui/icons-material/GppBad'
import SyncAltIcon           from '@mui/icons-material/SyncAlt'
import ReceiptLongIcon       from '@mui/icons-material/ReceiptLong'
import ArrowUpwardIcon       from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon     from '@mui/icons-material/ArrowDownward'
import CloseIcon             from '@mui/icons-material/Close'
import TrendingUpIcon        from '@mui/icons-material/TrendingUp'
import axiosInstance         from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

// ─── Exact types from server constants ───────────────────────────────────────
const TX_TYPES = [
  { value: 'survey',               label: 'Survey',              icon: PollIcon,                color: '#5312bc', earn: true  },
  { value: 'referral',             label: 'Referral',            icon: PeopleIcon,              color: '#ec4899', earn: true  },
  { value: 'bonus',                label: 'Bonus',               icon: CardGiftcardIcon,        color: '#f59e0b', earn: true  },
  { value: 'daily_bonus',          label: 'Daily Bonus',         icon: WhatshotIcon,            color: '#10b981', earn: true  },
  { value: 'reversal',             label: 'Reversal',            icon: UndoIcon,                color: '#6b7280', earn: false },
  { value: 'adjustment',           label: 'Adjustment',          icon: SyncAltIcon,             color: '#0891b2', earn: null  },
  { value: 'promo',                label: 'Promo',               icon: CardGiftcardIcon,        color: '#8b5cf6', earn: true  },
  { value: 'refund',               label: 'Refund',              icon: UndoIcon,                color: '#14b8a6', earn: true  },
  { value: 'withdrawal',           label: 'Withdrawal',          icon: AccountBalanceWalletIcon,color: '#2563eb', earn: false },
  { value: 'payment_proof_reward', label: 'Payment Proof',       icon: ReceiptLongIcon,         color: '#059669', earn: true  },
  { value: 'level_up_bonus',       label: 'Level Up Bonus',      icon: EmojiEventsIcon,         color: '#d97706', earn: true  },
  { value: 'fraud_deduction',      label: 'Fraud Deduction',     icon: GppBadIcon,              color: '#ef4444', earn: false },
  { value: 'undo_reversal',        label: 'Undo Reversal',       icon: SyncAltIcon,             color: '#7c3aed', earn: true  },
]

const TX_STATUSES = [
  { value: 'completed',  label: 'Completed',  bg: '#d1fae5', color: '#059669' },
  { value: 'pending',    label: 'Pending',    bg: '#fef3c7', color: '#d97706' },
  { value: 'locked',     label: 'Locked',     bg: '#ede9fe', color: '#7c3aed' },
  { value: 'reversed',   label: 'Reversed',   bg: '#f3f4f6', color: '#6b7280' },
  { value: 'cancelled',  label: 'Cancelled',  bg: '#fee2e2', color: '#dc2626' },
]

// Tabs: "all" + each type that exists in the data — we show static tab list
const TABS = [
  { value: 'all',    label: 'All' },
  { value: 'survey', label: 'Surveys' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'referral',   label: 'Referrals' },
  { value: 'bonus,daily_bonus,promo,level_up_bonus,payment_proof_reward', label: 'Bonuses' },
  { value: 'reversal,undo_reversal,adjustment,fraud_deduction,refund', label: 'Adjustments' },
]

const typeMap = Object.fromEntries(TX_TYPES.map(t => [t.value, t]))
const statusMap = Object.fromEntries(TX_STATUSES.map(s => [s.value, s]))

// Build a human-readable description from the tx object
const buildDescription = (tx) => {
  const meta = tx.metadata || {}
  switch (tx.type) {
    case 'survey':
      return tx.offer_wall_name
        ? `Completed survey on ${tx.offer_wall_name}${meta.survey_name ? ` — ${meta.survey_name}` : ''}`
        : meta.survey_name || 'Survey completed'
    case 'referral':
      return meta.referred_username
        ? `Earned from referral: ${meta.referred_username}`
        : 'Referral commission earned'
    case 'bonus':         return meta.reason || 'Bonus credited by admin'
    case 'daily_bonus':   return `Daily streak bonus — Day ${meta.streak_day || '?'}`
    case 'reversal':      return meta.reason || 'Transaction reversed'
    case 'undo_reversal': return meta.reason || 'Reversal undone'
    case 'adjustment':    return meta.reason || 'Account adjustment'
    case 'promo':         return meta.promo_name || meta.reason || 'Promotional reward'
    case 'refund':        return meta.reason || 'Refund issued'
    case 'withdrawal':    return meta.method
      ? `Withdrawal via ${meta.method}${meta.account ? ` (${meta.account})` : ''}`
      : 'Withdrawal processed'
    case 'payment_proof_reward': return 'Payment proof approved'
    case 'level_up_bonus':       return `Level up bonus${meta.level ? ` — Level ${meta.level}` : ''}`
    case 'fraud_deduction':      return meta.reason || 'Fraud-related deduction'
    default: return tx.type?.replace(/_/g, ' ') || '—'
  }
}

const HistoryPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS   = getColors(darkMode)
  const theme    = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [transactions, setTransactions] = useState([])
  const [meta,         setMeta]         = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [activeTab,    setActiveTab]    = useState('all')
  const [showFilters,  setShowFilters]  = useState(false)
  const [summaryStats, setSummaryStats] = useState({ totalEarned: 0, totalWithdrawn: 0, pending: 0 })

  // Filters (on top of tab)
  const [status,    setStatus]    = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')

  const buildParams = useCallback((page = 1) => {
    const p = new URLSearchParams()
    p.set('page', page)
    p.set('limit', 20)
    p.set('sort_by', 'created_at')
    p.set('sort_order', sortOrder)
    if (status) p.set('status', status)
    if (dateFrom) p.set('date_from', dateFrom)
    if (dateTo)   p.set('date_to',   dateTo)

    // Tab maps to one or more `type` values — we send only one at a time if single
    const tabTypes = activeTab === 'all' ? [] : activeTab.split(',')
    if (tabTypes.length === 1) p.set('type', tabTypes[0])
    // For multi-type tabs we fetch without type filter and rely on label
    return { params: p, multiTypes: tabTypes.length > 1 ? tabTypes : null }
  }, [activeTab, status, sortOrder, dateFrom, dateTo])

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const { params, multiTypes } = buildParams(page)
      const res = await axiosInstance.get(`/transactions/?${params.toString()}`)
      let data = res.data.data || []
      if (multiTypes) data = data.filter(tx => multiTypes.includes(tx.type))
      setTransactions(data)
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [buildParams])

  // Summary stats — always fetched without type filter
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [earn, withdraw, pend] = await Promise.all([
          axiosInstance.get('/transactions/?status=completed&sort_by=amount&limit=100'),
          axiosInstance.get('/transactions/?type=withdrawal&status=completed&limit=100'),
          axiosInstance.get('/transactions/?status=pending&limit=1'),
        ])
        const earned = (earn.data.data || [])
          .filter(t => t.amount > 0)
          .reduce((s, t) => s + parseFloat(t.amount), 0)
        const withdrawn = (withdraw.data.data || [])
          .reduce((s, t) => s + Math.abs(parseFloat(t.amount)), 0)
        setSummaryStats({
          totalEarned: earned,
          totalWithdrawn: withdrawn,
          pending: pend.data.meta?.total || 0,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  useEffect(() => { fetchTransactions(1) }, [fetchTransactions])

  const formatPts = (v) => Math.floor(v || 0).toLocaleString()
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'
  const formatDateShort = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const isPositive = (tx) => {
    const cfg = typeMap[tx.type]
    if (cfg?.earn === true)  return true
    if (cfg?.earn === false) return false
    return tx.amount > 0
  }

  // ── Stat card ─────────────────────────────────────────────────────────────
  const StatCard = ({ label, value, sub, accent, icon: Icon }) => (
    <Paper elevation={0} sx={{
      p: { xs: 2, md: 2.5 }, borderRadius: 3, flex: 1,
      bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
      display: 'flex', alignItems: 'center', gap: 2,
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2, flexShrink: 0,
        bgcolor: `${accent}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: 22, color: accent }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.2 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 0.2 }}>{sub}</Typography>}
      </Box>
    </Paper>
  )

  // ── Transaction row icon ───────────────────────────────────────────────────
  const TxIcon = ({ type, size = 36 }) => {
    const cfg  = typeMap[type] || { icon: SyncAltIcon, color: COLORS.primary }
    const Icon = cfg.icon
    return (
      <Box sx={{
        width: size, height: size, borderRadius: size / 4,
        bgcolor: `${cfg.color}14`, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: size * 0.5, color: cfg.color }} />
      </Box>
    )
  }

  // ── Status chip ────────────────────────────────────────────────────────────
  const StatusChip = ({ status: s }) => {
    const cfg = statusMap[s] || { bg: '#f3f4f6', color: '#6b7280', label: s }
    return (
      <Chip size="small" label={cfg.label || s} sx={{
        bgcolor: darkMode ? `${cfg.color}22` : cfg.bg,
        color: cfg.color, fontWeight: 700, fontSize: '0.65rem',
        textTransform: 'capitalize', border: `1px solid ${cfg.color}30`,
        height: 20,
      }} />
    )
  }

  // ── Amount display ─────────────────────────────────────────────────────────
  const AmountDisplay = ({ tx, large }) => {
    const pos  = isPositive(tx)
    const sign = pos ? '+' : '−'
    const col  = pos ? '#10b981' : '#ef4444'
    return (
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 800, fontSize: large ? '1.15rem' : '0.95rem', color: col, lineHeight: 1.1 }}>
          {sign}{formatPts(Math.abs(tx.amount))}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: COLORS.textMuted }}>pts</Typography>
      </Box>
    )
  }

  // ── Select style ───────────────────────────────────────────────────────────
  const selectSx = {
    borderRadius: 2,
    fontSize: '0.82rem',
    bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(83,18,188,0.03)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: `${COLORS.primary}60` },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
    color: COLORS.textPrimary,
    '& .MuiSvgIcon-root': { color: COLORS.textMuted },
  }

  const activeFiltersCount = [status, dateFrom || dateTo].filter(Boolean).length

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 8 } }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: '50%',
        bgcolor: `${COLORS.primary}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 2,
      }}>
        <ReceiptLongIcon sx={{ fontSize: 30, color: COLORS.primary }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary, mb: 0.5 }}>
        No transactions found
      </Typography>
      <Typography sx={{ fontSize: '0.83rem', color: COLORS.textMuted }}>
        {activeTab === 'all' && !status ? 'Complete surveys and offers to see your earnings here' : 'Try adjusting your filters'}
      </Typography>
    </Box>
  )

  // ── Mobile card ────────────────────────────────────────────────────────────
  const MobileCard = ({ tx }) => (
    <Paper elevation={0} sx={{
      p: 2, borderRadius: 2.5,
      bgcolor: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      transition: 'border-color 0.2s',
      '&:hover': { borderColor: `${COLORS.primary}30` },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <TxIcon type={tx.type} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary }}>
              {typeMap[tx.type]?.label || tx.type}
            </Typography>
            <AmountDisplay tx={tx} large />
          </Box>
          <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, mb: 0.8, lineHeight: 1.4, pr: 1 }}>
            {buildDescription(tx)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusChip status={tx.status} />
            <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted }}>
              {formatDateShort(tx.created_at)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )

  // ── Desktop row ────────────────────────────────────────────────────────────
  const DesktopRow = ({ tx }) => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 1fr 100px 90px 110px',
      gap: 2, alignItems: 'center',
      px: 2.5, py: 1.8,
      borderBottom: `1px solid ${COLORS.border}`,
      transition: 'background 0.15s',
      '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.025)' : 'rgba(83,18,188,0.025)' },
    }}>
      <TxIcon type={tx.type} size={36} />
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: COLORS.textPrimary }}>
          {typeMap[tx.type]?.label || tx.type}
        </Typography>
        {tx.offer_wall_name && (
          <Typography sx={{ fontSize: '0.72rem', color: COLORS.primary, fontWeight: 600 }}>
            via {tx.offer_wall_name}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary, lineHeight: 1.4, pr: 1 }}>
        {buildDescription(tx)}
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{
          fontWeight: 800, fontSize: '1rem',
          color: isPositive(tx) ? '#10b981' : '#ef4444',
        }}>
          {isPositive(tx) ? '+' : '−'}{formatPts(Math.abs(tx.amount))}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: COLORS.textMuted }}>pts</Typography>
      </Box>
      <StatusChip status={tx.status} />
      <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
        {formatDateShort(tx.created_at)}
      </Typography>
    </Box>
  )

  return (
    <PageWrapper
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      title="Reports"
      subtitle="Your complete transaction history"
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>

        {/* ── Summary stats ─────────────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', gap: 2, mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <StatCard
            label="Total Earned" icon={TrendingUpIcon} accent="#10b981"
            value={`${formatPts(summaryStats.totalEarned)} pts`}
            sub={`≈ $${(summaryStats.totalEarned / 100).toFixed(2)}`}
          />
          <StatCard
            label="Withdrawn" icon={AccountBalanceWalletIcon} accent="#2563eb"
            value={`${formatPts(summaryStats.totalWithdrawn)} pts`}
            sub={`≈ $${(summaryStats.totalWithdrawn / 100).toFixed(2)}`}
          />
          <StatCard
            label="Pending" icon={WhatshotIcon} accent="#f59e0b"
            value={summaryStats.pending}
            sub="transactions awaiting"
          />
        </Box>

        {/* ── Main card ──────────────────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          borderRadius: 3, overflow: 'hidden',
          bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
        }}>

          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: { xs: 2, md: 2.5 }, pt: 2, pb: 0,
            borderBottom: `1px solid ${COLORS.border}`,
            gap: 1,
          }}>
            <Box sx={{
              display: 'flex', gap: 0.5, overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              pb: 0,
            }}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.value
                return (
                  <Box key={tab.value} onClick={() => setActiveTab(tab.value)} sx={{
                    px: { xs: 1.5, md: 2 }, py: 1.2,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontSize: '0.82rem', fontWeight: isActive ? 700 : 600,
                    color: isActive ? COLORS.primary : COLORS.textSecondary,
                    borderBottom: isActive ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                    transition: 'all 0.18s ease',
                    '&:hover': { color: COLORS.primary },
                  }}>
                    {tab.label}
                  </Box>
                )
              })}
            </Box>

            {/* Filter toggle */}
            <Tooltip title={showFilters ? 'Hide filters' : 'Filter & sort'}>
              <Box onClick={() => setShowFilters(p => !p)} sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1.5, py: 0.7, borderRadius: 2, cursor: 'pointer', mb: 0.5, flexShrink: 0,
                bgcolor: showFilters ? `${COLORS.primary}12` : `${COLORS.primary}07`,
                color: COLORS.primary,
                border: `1px solid ${showFilters ? `${COLORS.primary}35` : 'transparent'}`,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: `${COLORS.primary}15` },
              }}>
                <TuneIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                  Filter{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* ── Filter panel ─────────────────────────────────────────────── */}
          <Collapse in={showFilters}>
            <Box sx={{
              px: { xs: 2, md: 2.5 }, py: 2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(83,18,188,0.02)',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}>
              {/* Status */}
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)} sx={selectSx}>
                  <MenuItem value="" sx={{ fontSize: '0.82rem' }}>All statuses</MenuItem>
                  {TX_STATUSES.map(s => (
                    <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.82rem' }}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort order */}
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Sort</InputLabel>
                <Select value={sortOrder} label="Sort" onChange={e => setSortOrder(e.target.value)} sx={selectSx}>
                  <MenuItem value="desc" sx={{ fontSize: '0.82rem' }}>Newest first</MenuItem>
                  <MenuItem value="asc"  sx={{ fontSize: '0.82rem' }}>Oldest first</MenuItem>
                </Select>
              </FormControl>

              {/* Date from */}
              <Box>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mb: 0.5, fontWeight: 600 }}>From Date</Typography>
                <input
                  type="date" value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: '0.82rem',
                    border: `1px solid ${COLORS.border}`,
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(83,18,188,0.03)',
                    color: COLORS.textPrimary, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </Box>

              {/* Date to */}
              <Box>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mb: 0.5, fontWeight: 600 }}>To Date</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <input
                    type="date" value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    style={{
                      flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: '0.82rem',
                      border: `1px solid ${COLORS.border}`,
                      background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(83,18,188,0.03)',
                      color: COLORS.textPrimary, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {(dateFrom || dateTo || status) && (
                    <Tooltip title="Clear filters">
                      <IconButton size="small" onClick={() => { setStatus(''); setDateFrom(''); setDateTo('') }} sx={{ color: COLORS.textMuted, '&:hover': { color: COLORS.danger } }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          </Collapse>

          {/* ── Table header (desktop) ────────────────────────────────────── */}
          {!isMobile && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr 100px 90px 110px',
              gap: 2, px: 2.5, py: 1.2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(83,18,188,0.03)',
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              {['', 'Type', 'Description', 'Amount', 'Status', 'Date'].map((h, i) => (
                <Typography key={i} sx={{
                  fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  textAlign: i === 3 ? 'right' : 'left',
                }}>
                  {h}
                </Typography>
              ))}
            </Box>
          )}

          {/* ── Transaction list ─────────────────────────────────────────── */}
          <Box>
            {loading ? (
              <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[1,2,3,4,5,6].map(i => (
                  <Skeleton key={i} variant="rounded" height={isMobile ? 90 : 56} sx={{ borderRadius: 2 }} />
                ))}
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ color: COLORS.danger, fontWeight: 600 }}>{error}</Typography>
              </Box>
            ) : transactions.length === 0 ? (
              <EmptyState />
            ) : isMobile ? (
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {transactions.map(tx => <MobileCard key={tx.id} tx={tx} />)}
              </Box>
            ) : (
              transactions.map(tx => <DesktopRow key={tx.id} tx={tx} />)
            )}
          </Box>

          {/* ── Pagination ───────────────────────────────────────────────── */}
          {meta.totalPages > 1 && !loading && (
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2.5, py: 2, borderTop: `1px solid ${COLORS.border}`,
              flexWrap: 'wrap', gap: 1,
            }}>
              <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
                Page {meta.page} of {meta.totalPages} · {meta.total} total
              </Typography>
              <Pagination
                count={meta.totalPages} page={meta.page}
                onChange={(_, p) => fetchTransactions(p)}
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: COLORS.textSecondary, borderRadius: 1.5,
                    fontSize: '0.78rem',
                  },
                  '& .Mui-selected': {
                    bgcolor: `${COLORS.primary} !important`,
                    color: '#fff !important',
                  },
                }}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </PageWrapper>
  )
}

export default HistoryPage