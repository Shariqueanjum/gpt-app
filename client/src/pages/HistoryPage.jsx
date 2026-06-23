// HistoryPage.jsx — Reports
// All data from real backend APIs. No hardcoded values.
// Types/statuses match server/src/constants/transactionTypes.js exactly.
import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  MenuItem, Select, FormControl, InputLabel,
  useTheme, useMediaQuery, IconButton, Tooltip, Collapse,
} from '@mui/material'
import PollIcon                 from '@mui/icons-material/Poll'
import PeopleIcon               from '@mui/icons-material/People'
import CardGiftcardIcon         from '@mui/icons-material/CardGiftcard'
import WhatshotIcon             from '@mui/icons-material/Whatshot'
import UndoIcon                 from '@mui/icons-material/Undo'
import ReplayIcon               from '@mui/icons-material/Replay'
import TuneIcon                 from '@mui/icons-material/Tune'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import EmojiEventsIcon          from '@mui/icons-material/EmojiEvents'
import GppBadIcon               from '@mui/icons-material/GppBad'
import SyncAltIcon              from '@mui/icons-material/SyncAlt'
import ReceiptLongIcon          from '@mui/icons-material/ReceiptLong'
import LockIcon                 from '@mui/icons-material/Lock'
import CloseIcon                from '@mui/icons-material/Close'
import TrendingUpIcon           from '@mui/icons-material/TrendingUp'
import SummarizeIcon            from '@mui/icons-material/Summarize'
import axiosInstance            from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

// ─── Types — exact match with server/src/constants/transactionTypes.js ────────
const TX_TYPES = [
  { value: 'survey',               label: 'Survey',                icon: PollIcon,                color: '#5312bc', earn: true  },
  { value: 'referral',             label: 'Referral Bonus',        icon: PeopleIcon,              color: '#ec4899', earn: true  },
  { value: 'bonus',                label: 'Bonus',                 icon: CardGiftcardIcon,        color: '#f59e0b', earn: true  },
  { value: 'daily_bonus',          label: 'Daily Streak Bonus',    icon: WhatshotIcon,            color: '#10b981', earn: true  },
  { value: 'reversal',             label: 'Reversal',              icon: UndoIcon,                color: '#ef4444', earn: false },
  { value: 'adjustment',           label: 'Adjustment',            icon: SyncAltIcon,             color: '#0891b2', earn: null  },
  { value: 'promo',                label: 'Promo Reward',          icon: CardGiftcardIcon,        color: '#8b5cf6', earn: true  },
  { value: 'refund',               label: 'Refund',                icon: ReplayIcon,              color: '#14b8a6', earn: true  },
  { value: 'withdrawal',           label: 'Withdrawal',            icon: AccountBalanceWalletIcon,color: '#2563eb', earn: false },
  { value: 'payment_proof_reward', label: 'Payment Proof Reward',  icon: ReceiptLongIcon,         color: '#059669', earn: true  },
  { value: 'level_up_bonus',       label: 'Level Up Bonus',        icon: EmojiEventsIcon,         color: '#d97706', earn: true  },
  { value: 'fraud_deduction',      label: 'Fraud Deduction',       icon: GppBadIcon,              color: '#ef4444', earn: false },
  { value: 'undo_reversal',        label: 'Reversal Undone',       icon: ReplayIcon,              color: '#7c3aed', earn: true  },
]

// ─── Statuses — exact match with backend ─────────────────────────────────────
const TX_STATUSES = [
  { value: 'completed', label: 'Completed', bg: '#d1fae5', color: '#059669' },
  { value: 'pending',   label: 'Pending',   bg: '#fef3c7', color: '#d97706' },
  { value: 'locked',    label: 'Locked',    bg: '#ede9fe', color: '#7c3aed' },
  { value: 'reversed',  label: 'Reversed',  bg: '#f3f4f6', color: '#6b7280' },
  { value: 'cancelled', label: 'Cancelled', bg: '#fee2e2', color: '#dc2626' },
]

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { value: 'all',       label: 'All' },
  { value: 'survey',    label: 'Surveys' },
  { value: 'withdrawal',label: 'Withdrawals' },
  { value: 'referral',  label: 'Referrals' },
  { value: 'bonus,daily_bonus,promo,level_up_bonus,payment_proof_reward', label: 'Bonuses' },
  { value: 'reversal,undo_reversal,adjustment,fraud_deduction,refund',    label: 'Adjustments' },
]

const typeMap   = Object.fromEntries(TX_TYPES.map(t => [t.value, t]))
const statusMap = Object.fromEntries(TX_STATUSES.map(s => [s.value, s]))

// ─── Smart description builder ───────────────────────────────────────────────
// Reversal has two sub-types distinguished by reference_type:
//   reference_type = 'survey_click' → your own survey was reversed by provider
//   reference_type = 'referral'     → someone you referred got reversed, your commission clawed back
const buildDescription = (tx) => {
  const meta = tx.metadata || {}

  if (tx.type === 'reversal') {
    if (tx.reference_type === 'referral') {
      // Commission clawback due to referred user's survey being reversed
      const who = meta.from_username || 'a referred user'
      return `Referral commission clawed back — ${who}'s survey was reversed`
    }
    // Own survey reversed
    const reason = meta.reason ? ` · Reason: ${meta.reason}` : ''
    return `Your survey was reversed by the provider${reason}`
  }

  switch (tx.type) {
    case 'survey':
      if (tx.offer_wall_name && meta.survey_name)
        return `Survey on ${tx.offer_wall_name} — ${meta.survey_name}`
      if (tx.offer_wall_name)
        return `Survey completed on ${tx.offer_wall_name}`
      return meta.survey_name || 'Survey completed'

    case 'referral':
      return meta.referred_username
        ? `Commission from ${meta.referred_username}'s survey completion`
        : 'Referral commission earned'

    case 'bonus':
      return meta.reason || 'Bonus credited by admin'

    case 'daily_bonus':
      return meta.streak_day
        ? `Day ${meta.streak_day} streak bonus`
        : 'Daily login streak bonus'

    case 'undo_reversal': {
      return meta.reason || 'A previous reversal was undone — your points were restored'
    }

    case 'adjustment':
      return meta.reason || 'Manual balance adjustment by admin'

    case 'promo':
      return meta.promo_name || meta.reason || 'Promotional reward'

    case 'refund':
      return meta.reason || 'Refund issued to your account'

    case 'withdrawal':
      if (meta.method && meta.account)
        return `Withdrawal via ${meta.method} · ${meta.account}`
      if (meta.method)
        return `Withdrawal via ${meta.method}`
      return 'Withdrawal processed'

    case 'payment_proof_reward':
      return 'Payment proof approved by admin'

    case 'level_up_bonus':
      return meta.level
        ? `Reached Level ${meta.level} — bonus credited`
        : 'Level up bonus'

    case 'fraud_deduction':
      return meta.reason || 'Deduction due to suspicious activity'

    default:
      return tx.type?.replace(/_/g, ' ') || '—'
  }
}

// ─── Reversal sub-label (shown as secondary label on reversal rows) ───────────
const getReversalSubLabel = (tx) => {
  if (tx.type !== 'reversal') return null
  if (tx.reference_type === 'referral') return 'Commission Clawback'
  return 'Survey Reversed'
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
  const [summaryStats, setSummaryStats] = useState({ totalEarned: 0, totalWithdrawn: 0, locked: 0 })

  const [status,    setStatus]    = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const tabTypes = activeTab === 'all' ? [] : activeTab.split(',')

      const makeParams = (type, pg, lim = 20, overrideStatus) => {
        const p = new URLSearchParams()
        p.set('page', pg)
        p.set('limit', lim)
        p.set('sort_by', 'created_at')
        p.set('sort_order', sortOrder)
        const s = overrideStatus !== undefined ? overrideStatus : status
        if (s)      p.set('status',    s)
        if (dateFrom) p.set('date_from', dateFrom)
        if (dateTo)   p.set('date_to',   dateTo)
        if (type)   p.set('type',      type)
        return p.toString()
      }

      // ── Special case: Surveys tab + reversed filter ──────────────────────
      // survey transaction rows never get status='reversed' in the DB —
      // reversals create a separate row of type='reversal' with reference_type='survey_click'.
      // So we fetch type=reversal&status=reversed and filter to reference_type='survey_click'.
      if (activeTab === 'survey' && status === 'reversed') {
        const res = await axiosInstance.get(`/transactions/?${makeParams('reversal', page, 20, 'reversed')}`)
        const rows = (res.data.data || []).filter(tx => tx.reference_type === 'survey_click')
        setTransactions(rows)
        setMeta(res.data.meta || { page: 1, totalPages: 1, total: rows.length })
        return
      }

      if (tabTypes.length <= 1) {
        const type = tabTypes[0] || ''
        const res  = await axiosInstance.get(`/transactions/?${makeParams(type, page)}`)
        setTransactions(res.data.data || [])
        setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
      } else {
        const results = await Promise.all(
          tabTypes.map(type =>
            axiosInstance.get(`/transactions/?${makeParams(type, 1, 100)}`).then(r => r.data.data || [])
          )
        )
        const merged = results.flat().sort((a, b) =>
          sortOrder === 'desc'
            ? new Date(b.created_at) - new Date(a.created_at)
            : new Date(a.created_at) - new Date(b.created_at)
        )
        const pageSize = 20
        setTransactions(merged.slice((page - 1) * pageSize, page * pageSize))
        setMeta({ page, limit: pageSize, total: merged.length, totalPages: Math.ceil(merged.length / pageSize) })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [activeTab, status, sortOrder, dateFrom, dateTo])

  // Stats from /dashboard — exact DB-computed values, no guessing
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/dashboard')
        const d   = res.data.data || res.data
        setSummaryStats({
          totalEarned:    parseFloat(d?.lifetime?.total_earned    || 0),
          totalWithdrawn: parseFloat(d?.lifetime?.total_withdrawn || 0),
          locked:         parseFloat(d?.balance?.locked           || 0),
        })
      } catch {}
    }
    fetchStats()
  }, [])

  useEffect(() => { fetchTransactions(1) }, [fetchTransactions])

  // Reset to page 1 whenever filters or tab change
  useEffect(() => { fetchTransactions(1) }, [activeTab, status, sortOrder, dateFrom, dateTo]) // eslint-disable-line

  const fmt    = (v) => Math.floor(v || 0).toLocaleString()
  const fmtUSD = (v) => `≈ $${(parseFloat(v || 0) / 100).toFixed(2)}`

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'
  const fmtDateShort = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const isCredit = (tx) => {
    const cfg = typeMap[tx.type]
    if (cfg?.earn === true)  return true
    if (cfg?.earn === false) return false
    return parseFloat(tx.amount) > 0
  }

  const selectSx = {
    borderRadius: 2, fontSize: '0.82rem',
    bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(83,18,188,0.03)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: `${COLORS.primary}60` },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
    color: COLORS.textPrimary,
    '& .MuiSvgIcon-root': { color: COLORS.textMuted },
  }

  const dateInputStyle = {
    width: '100%', height: 40, padding: '0 10px',
    borderRadius: 8, fontSize: '0.82rem',
    border: `1px solid ${COLORS.border}`,
    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(83,18,188,0.03)',
    color: COLORS.textPrimary, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const activeFiltersCount = [status, dateFrom || dateTo].filter(Boolean).length
  const clearFilters = () => { setStatus(''); setDateFrom(''); setDateTo('') }

  // ── Sub-components ────────────────────────────────────────────────────────

  const StatCard = ({ label, value, sub, accent, icon: Icon }) => (
    <Paper elevation={0} sx={{
      p: { xs: 2, md: 2.5 }, borderRadius: 3,
      bgcolor: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      background: `linear-gradient(135deg, ${accent}12 0%, ${accent}03 100%)`,
      display: 'flex', alignItems: 'center', gap: 2,
    }}>
      <Box sx={{
        width: 46, height: 46, borderRadius: 2.5, flexShrink: 0,
        bgcolor: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: 22, color: accent }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.2 }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 0.1 }}>{sub}</Typography>
        )}
      </Box>
    </Paper>
  )

  const TxIcon = ({ tx, size = 36 }) => {
    const cfg  = typeMap[tx.type] || { icon: SyncAltIcon, color: COLORS.primary }
    // Referral commission clawback — show a different tint to distinguish
    const isClawback = tx.type === 'reversal' && tx.reference_type === 'referral'
    const color = isClawback ? '#f97316' : cfg.color
    const Icon  = cfg.icon
    return (
      <Box sx={{
        width: size, height: size, borderRadius: size / 4, flexShrink: 0,
        bgcolor: `${color}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: size * 0.48, color }} />
      </Box>
    )
  }

  const StatusChip = ({ status: s }) => {
    const cfg = statusMap[s] || { bg: '#f3f4f6', color: '#6b7280', label: s }
    return (
      <Chip size="small" label={cfg.label || s} sx={{
        bgcolor: darkMode ? `${cfg.color}22` : cfg.bg,
        color: cfg.color, fontWeight: 700, fontSize: '0.63rem',
        border: `1px solid ${cfg.color}30`, height: 20,
      }} />
    )
  }

  const AmountBadge = ({ tx }) => {
    const credit = isCredit(tx)
    const color  = credit ? '#10b981' : '#ef4444'
    const sign   = credit ? '+' : '−'
    return (
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color, lineHeight: 1.1 }}>
          {sign}{fmt(Math.abs(parseFloat(tx.amount)))}
        </Typography>
        <Typography sx={{ fontSize: '0.62rem', color: COLORS.textMuted, lineHeight: 1 }}>pts</Typography>
      </Box>
    )
  }

  // Small badge shown on undo_reversal rows to clarify what was undone
  const UndoBadge = ({ tx }) => {
    if (tx.type !== 'undo_reversal') return null
    return (
      <Chip size="small"
        label="Reversal Undone"
        sx={{
          bgcolor: darkMode ? 'rgba(124,58,237,0.15)' : '#f5f3ff',
          color: '#7c3aed', fontWeight: 600, fontSize: '0.62rem',
          border: '1px solid #7c3aed25', height: 18, mt: 0.5,
        }}
      />
    )
  }

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
        {activeTab === 'all' && !status
          ? 'Complete surveys and offers to start earning'
          : 'Try adjusting your filters or switching tabs'}
      </Typography>
    </Box>
  )

  // Mobile card — shows all the info a user needs clearly
  const MobileCard = ({ tx }) => {
    const subLabel   = getReversalSubLabel(tx)
    const isClawback = tx.type === 'reversal' && tx.reference_type === 'referral'
    return (
      <Paper elevation={0} sx={{
        p: 2, borderRadius: 2.5,
        bgcolor: darkMode ? 'rgba(255,255,255,0.055)' : 'rgba(83,18,188,0.032)',
        border: `1px solid ${COLORS.border}`,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: `${COLORS.primary}35`,
          bgcolor: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(83,18,188,0.05)',
        },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <TxIcon tx={tx} size={40} />
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Row 1: type label + amount */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: COLORS.textPrimary, lineHeight: 1.2 }}>
                  {subLabel || typeMap[tx.type]?.label || tx.type}
                </Typography>
                {isClawback && (
                  <Typography sx={{ fontSize: '0.68rem', color: '#f97316', fontWeight: 600 }}>
                    Referral Commission
                  </Typography>
                )}
                {tx.offer_wall_name && tx.type === 'survey' && (
                  <Typography sx={{ fontSize: '0.68rem', color: COLORS.primary, fontWeight: 600 }}>
                    via {tx.offer_wall_name}
                  </Typography>
                )}
              </Box>
              <AmountBadge tx={tx} />
            </Box>

            {/* Row 2: description */}
            <Typography sx={{
              fontSize: '0.76rem', color: COLORS.textSecondary,
              lineHeight: 1.45, my: 0.7, pr: 0.5,
            }}>
              {buildDescription(tx)}
            </Typography>

            <UndoBadge tx={tx} />

            {/* Row 3: status + date */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusChip status={tx.status} />
              <Typography sx={{ fontSize: '0.67rem', color: COLORS.textMuted }}>
                {fmtDateShort(tx.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    )
  }

  // Desktop row
  const DesktopRow = ({ tx }) => {
    const subLabel   = getReversalSubLabel(tx)
    const isClawback = tx.type === 'reversal' && tx.reference_type === 'referral'
    const credit     = isCredit(tx)
    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '44px 160px 1fr 110px 95px 120px',
        gap: 2, alignItems: 'center',
        px: 2.5, py: 1.6,
        borderBottom: `1px solid ${COLORS.border}`,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.025)' : 'rgba(83,18,188,0.025)' },
      }}>
        <TxIcon tx={tx} size={36} />

        {/* Type column */}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary, lineHeight: 1.2 }}>
            {subLabel || typeMap[tx.type]?.label || tx.type}
          </Typography>
          {isClawback && (
            <Typography sx={{ fontSize: '0.68rem', color: '#f97316', fontWeight: 600 }}>
              Referral Commission
            </Typography>
          )}
          {tx.offer_wall_name && tx.type === 'survey' && (
            <Typography sx={{ fontSize: '0.68rem', color: COLORS.primary, fontWeight: 600 }}>
              via {tx.offer_wall_name}
            </Typography>
          )}
          <UndoBadge tx={tx} />
          {!isClawback && !tx.offer_wall_name && tx.type !== 'undo_reversal' && (
            <StatusChip status={tx.status} />
          )}
        </Box>

        {/* Description */}
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary, lineHeight: 1.45, pr: 1 }}>
          {buildDescription(tx)}
        </Typography>

        {/* Amount */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{
            fontWeight: 800, fontSize: '1rem', lineHeight: 1.1,
            color: credit ? '#10b981' : '#ef4444',
          }}>
            {credit ? '+' : '−'}{fmt(Math.abs(parseFloat(tx.amount)))}
          </Typography>
          <Typography sx={{ fontSize: '0.62rem', color: COLORS.textMuted }}>pts</Typography>
        </Box>

        {/* Status (only for non-type rows) */}
        <Box>{isClawback || tx.offer_wall_name ? <StatusChip status={tx.status} /> : null}</Box>

        {/* Date */}
        <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
          {fmtDateShort(tx.created_at)}
        </Typography>
      </Box>
    )
  }

  return (
    <PageWrapper
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      title="Reports"
      subtitle="Your complete transaction history"
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 0 } }}>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <Box sx={{ mb: 3, mt: { xs: 2, md: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.4 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              bgcolor: `${COLORS.primary}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SummarizeIcon sx={{ fontSize: 20, color: COLORS.primary }} />
            </Box>
            <Typography sx={{
              fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.8rem' },
              color: COLORS.textPrimary, letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              Reports
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.87rem', color: COLORS.textMuted, pl: '54px' }}>
            Your complete earning & withdrawal history
          </Typography>
        </Box>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2, mb: 3,
        }}>
          <StatCard
            label="Total Earned" icon={TrendingUpIcon} accent="#10b981"
            value={`${fmt(summaryStats.totalEarned)} pts`}
            sub={fmtUSD(summaryStats.totalEarned)}
          />
          <StatCard
            label="Total Withdrawn" icon={AccountBalanceWalletIcon} accent="#2563eb"
            value={`${fmt(summaryStats.totalWithdrawn)} pts`}
            sub={fmtUSD(summaryStats.totalWithdrawn)}
          />
          <StatCard
            label="Locked Balance" icon={LockIcon} accent="#7c3aed"
            value={`${fmt(summaryStats.locked)} pts`}
            sub={fmtUSD(summaryStats.locked)}
          />
        </Box>

        {/* ── Main transaction card ─────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          borderRadius: 3, overflow: 'hidden',
          bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
        }}>

          {/* Tabs + filter toggle */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: { xs: 2, md: 2.5 }, pt: 2, pb: 0,
            borderBottom: `1px solid ${COLORS.border}`, gap: 1,
          }}>
            <Box sx={{
              display: 'flex', gap: 0.5, overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.value
                return (
                  <Box key={tab.value} onClick={() => { setActiveTab(tab.value) }} sx={{
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

            <Tooltip title={showFilters ? 'Hide filters' : 'Filter & sort'}>
              <Box onClick={() => setShowFilters(p => !p)} sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1.5, py: 0.7, mb: 0.5, borderRadius: 2,
                cursor: 'pointer', flexShrink: 0,
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

          {/* Filter panel */}
          <Collapse in={showFilters}>
            <Box sx={{
              px: { xs: 2, md: 2.5 }, py: 2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(83,18,188,0.02)',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 1.5, alignItems: 'end',
            }}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)} sx={selectSx}>
                  <MenuItem value="" sx={{ fontSize: '0.82rem' }}>All statuses</MenuItem>
                  {TX_STATUSES.map(s => (
                    <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.82rem' }}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Sort</InputLabel>
                <Select value={sortOrder} label="Sort" onChange={e => setSortOrder(e.target.value)} sx={selectSx}>
                  <MenuItem value="desc" sx={{ fontSize: '0.82rem' }}>Newest first</MenuItem>
                  <MenuItem value="asc"  sx={{ fontSize: '0.82rem' }}>Oldest first</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, fontWeight: 600, lineHeight: 1 }}>From</Typography>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, fontWeight: 600, lineHeight: 1 }}>To</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...dateInputStyle, flex: 1, width: 'auto' }} />
                  {(dateFrom || dateTo || status) && (
                    <Tooltip title="Clear all filters">
                      <IconButton size="small" onClick={clearFilters}
                        sx={{ color: COLORS.textMuted, '&:hover': { color: '#ef4444' }, flexShrink: 0 }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          </Collapse>

          {/* Desktop table header */}
          {!isMobile && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '44px 160px 1fr 110px 95px 120px',
              gap: 2, px: 2.5, py: 1.2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(83,18,188,0.025)',
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              {['', 'Type', 'Description', 'Amount', 'Status', 'Date'].map((h, i) => (
                <Typography key={i} sx={{
                  fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  textAlign: i === 3 ? 'right' : 'left',
                }}>
                  {h}
                </Typography>
              ))}
            </Box>
          )}

          {/* Transaction list */}
          <Box>
            {loading ? (
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[1,2,3,4,5,6].map(i => (
                  <Skeleton key={i} variant="rounded" height={isMobile ? 95 : 58} sx={{ borderRadius: 2 }} />
                ))}
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{error}</Typography>
              </Box>
            ) : transactions.length === 0 ? (
              <EmptyState />
            ) : isMobile ? (
              <Box sx={{ p: { xs: '12px 16px', md: 2 }, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {transactions.map(tx => <MobileCard key={tx.id} tx={tx} />)}
              </Box>
            ) : (
              transactions.map(tx => <DesktopRow key={tx.id} tx={tx} />)
            )}
          </Box>

          {/* Pagination */}
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
                  '& .MuiPaginationItem-root': { color: COLORS.textSecondary, borderRadius: 1.5, fontSize: '0.78rem' },
                  '& .Mui-selected': { bgcolor: `${COLORS.primary} !important`, color: '#fff !important' },
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