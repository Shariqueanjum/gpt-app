// ============================================================
// userHistoryConfigs.jsx — describes each tab of the user detail:
// which API it calls, which filters it offers, which columns it shows.
// Adding a new tab later = adding one config object here.
// ============================================================
import { Box, Typography } from '@mui/material'
import PointsCell from './PointsCell'
import CopyText from '../CopyText'
import { StatusPill } from '../AdminUiKit'
import { formatDate, formatShortDate, humanize, statusColor } from './userDetailFormat'

const GREEN = '#10b981'
const RED = '#ef4444'

const sub = (text, COLORS) => (
  <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, lineHeight: 1.3 }}>{text}</Typography>
)
const dash = '—'

const providerOptions = (overview) => [
  { value: '', label: 'All providers' },
  ...(overview?.filter_options?.providers || []).map((p) => ({ value: String(p.id), label: p.name })),
]

const dateFilters = [
  { key: 'date_from', label: 'From date', type: 'date' },
  { key: 'date_to', label: 'To date', type: 'date' },
]
const pointsFilters = [
  { key: 'min_points', label: 'Min points', type: 'number', placeholder: '0' },
  { key: 'max_points', label: 'Max points', type: 'number', placeholder: 'Any' },
]

const dateCell = (row, { COLORS }) => (
  <Box sx={{ whiteSpace: 'nowrap' }}>
    <Typography sx={{ fontSize: '0.82rem', color: COLORS.textPrimary }}>{formatShortDate(row.created_at)}</Typography>
    {sub(new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), COLORS)}
  </Box>
)

// Withdrawal destination (UPI / PayPal / bank) in one short line
const describeMethodDetails = (d) => {
  if (!d) return dash
  if (typeof d === 'string') return d.slice(0, 70)
  const keys = ['upi_id', 'paypal_email', 'email', 'account_number', 'bank_account', 'bank_ifsc', 'ifsc', 'bank_name', 'phone']
  const picked = keys.map((k) => d[k]).filter(Boolean)
  const parts = picked.length ? picked : Object.values(d).filter((v) => typeof v === 'string' || typeof v === 'number')
  return parts.length ? parts.join(' · ').slice(0, 70) : dash
}

// ---------------- Surveys ----------------
export const surveysConfig = {
  key: 'surveys',
  label: 'Surveys',
  endpoint: 'history/surveys',
  emptyLabel: 'No surveys completed yet',
  summaryLabel: 'Total points in this list',
  minWidth: 980,
  filters: [
    { key: 'search', label: 'Search', type: 'text', placeholder: 'Survey name or ID' },
    { key: 'offer_wall_id', label: 'Provider', type: 'select', options: providerOptions },
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: '', label: 'All statuses' },
        { value: 'completed', label: 'Completed' },
        { value: 'locked', label: 'Locked' },
        { value: 'reversed', label: 'Reversed' },
      ],
    },
    ...dateFilters,
    ...pointsFilters,
  ],
  columns: [
    { label: 'Date', render: dateCell },
    {
      label: 'Survey', minWidth: 160,
      render: (r) => <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>{r.survey_name || 'Survey'}</Typography>,
    },
    { label: 'Provider', render: (r) => r.provider || dash },
    { label: 'Status', render: (r) => <StatusPill label={r.status} color={statusColor(r.status)} /> },
    {
      label: 'Points earned', render: (r, { COLORS }) => (
        <PointsCell points={r.amount} COLORS={COLORS} color={r.status === 'reversed' ? RED : undefined} />
      ),
    },
    { label: 'Our ID', render: (r, { COLORS }) => <CopyText value={r.click_transaction_id} COLORS={COLORS} maxWidth={130} /> },
    { label: 'Provider ID', render: (r, { COLORS }) => <CopyText value={r.external_transaction_id} COLORS={COLORS} maxWidth={130} /> },
  ],
}

// ---------------- Bonuses & adjustments ----------------
export const bonusesConfig = {
  key: 'bonuses',
  label: 'Bonuses',
  endpoint: 'history/bonuses',
  emptyLabel: 'No bonuses or adjustments yet',
  summaryLabel: 'Net points in this list',
  minWidth: 720,
  filters: [
    {
      key: 'type', label: 'Type', type: 'select',
      options: [
        { value: '', label: 'All types' },
        { value: 'daily_bonus', label: 'Daily bonus' },
        { value: 'level_up_bonus', label: 'Level-up bonus' },
        { value: 'bonus', label: 'Bonus' },
        { value: 'promo', label: 'Promo' },
        { value: 'adjustment', label: 'Admin adjustment' },
        { value: 'fraud_deduction', label: 'Fraud deduction' },
        { value: 'refund', label: 'Withdrawal refund' },
      ],
    },
    {
      key: 'direction', label: 'Direction', type: 'select',
      options: [{ value: '', label: 'Added + taken' }, { value: 'credit', label: 'Points added' }, { value: 'debit', label: 'Points taken' }],
    },
    ...dateFilters,
    ...pointsFilters,
  ],
  columns: [
    { label: 'Date', render: dateCell },
    { label: 'Type', render: (r) => <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>{humanize(r.type)}</Typography> },
    { label: 'Note', minWidth: 180, render: (r, { COLORS }) => <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>{r.note || dash}</Typography> },
    { label: 'Status', render: (r) => <StatusPill label={r.status} color={statusColor(r.status)} /> },
    { label: 'Points', render: (r, { COLORS }) => <PointsCell points={r.amount} COLORS={COLORS} signed color={r.amount >= 0 ? GREEN : RED} /> },
  ],
}

// ---------------- Reversals ----------------
export const reversalsConfig = {
  key: 'reversals',
  label: 'Reversals',
  endpoint: 'history/reversals',
  emptyLabel: 'No reversals — nothing was taken back',
  summaryLabel: 'Points reversed in this list',
  minWidth: 1020,
  filters: [
    { key: 'search', label: 'Search', type: 'text', placeholder: 'Survey, reason or ID' },
    { key: 'offer_wall_id', label: 'Provider', type: 'select', options: providerOptions },
    {
      key: 'kind', label: 'What was reversed', type: 'select',
      options: [{ value: '', label: 'Everything' }, { value: 'survey', label: 'Survey' }, { value: 'referral', label: 'Referral commission' }],
    },
    {
      key: 'state', label: 'State', type: 'select',
      options: [{ value: '', label: 'Active + undone' }, { value: 'active', label: 'Active (still reversed)' }, { value: 'undone', label: 'Undone (restored)' }],
    },
    {
      key: 'source', label: 'Reversed by', type: 'select',
      options: [{ value: '', label: 'Anyone' }, { value: 'callback', label: 'Provider postback' }, { value: 'manual', label: 'Admin (manual)' }, { value: 'csv', label: 'CSV upload' }],
    },
    ...dateFilters,
    ...pointsFilters,
  ],
  columns: [
    { label: 'Date', render: dateCell },
    {
      label: 'What', render: (r) => (
        <StatusPill label={r.kind === 'survey' ? 'Survey' : 'Referral commission'} color={r.kind === 'survey' ? '#5312bc' : '#ec4899'} />
      ),
    },
    { label: 'Provider', render: (r) => r.provider || dash },
    {
      label: 'Survey / From', minWidth: 150, render: (r, { COLORS }) => (
        r.kind === 'survey'
          ? <Box><Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.survey_name || 'Survey'}</Typography>{sub(r.click_transaction_id || '', COLORS)}</Box>
          : <Typography sx={{ fontSize: '0.82rem' }}>{r.from_username ? `From ${r.from_username}` : dash}</Typography>
      ),
    },
    { label: 'Reason', minWidth: 190, render: (r, { COLORS }) => <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>{r.reason || dash}</Typography> },
    { label: 'Reversed by', render: (r) => ({ callback: 'Provider', manual: 'Admin', csv: 'CSV' }[r.source] || humanize(r.source)) },
    {
      label: 'State', render: (r) => (
        <StatusPill label={r.state === 'active' ? 'Reversed' : 'Undone'} color={r.state === 'active' ? RED : '#9ca3af'} />
      ),
    },
    {
      label: 'Points', render: (r, { COLORS }) => (
        <PointsCell points={r.amount} COLORS={COLORS} color={r.state === 'active' ? RED : undefined} muted={r.state !== 'active'} />
      ),
    },
  ],
}

// ---------------- Withdrawals ----------------
export const withdrawalsConfig = {
  key: 'withdrawals',
  label: 'Withdrawals',
  endpoint: 'history/withdrawals',
  emptyLabel: 'No withdrawal requests yet',
  summaryLabel: 'Total requested in this list',
  minWidth: 940,
  filters: [
    { key: 'search', label: 'Search', type: 'text', placeholder: 'Bank txn ID or reason' },
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: '', label: 'All statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'paid', label: 'Paid (received)' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      key: 'method', label: 'Method', type: 'select',
      options: (overview) => [
        { value: '', label: 'All methods' },
        ...(overview?.filter_options?.withdrawal_methods || []).map((m) => ({ value: m, label: humanize(m) })),
      ],
    },
    ...dateFilters,
    ...pointsFilters,
  ],
  columns: [
    { label: 'Requested', render: dateCell },
    { label: 'Method', render: (r) => <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase' }}>{r.method}</Typography> },
    { label: 'Paid to', minWidth: 170, render: (r, { COLORS }) => <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, wordBreak: 'break-all' }}>{describeMethodDetails(r.method_details)}</Typography> },
    { label: 'Status', render: (r) => <StatusPill label={r.status === 'paid' ? 'Paid' : r.status} color={statusColor(r.status)} /> },
    { label: 'Points', render: (r, { COLORS }) => <PointsCell points={r.amount} COLORS={COLORS} color={r.status === 'paid' ? GREEN : r.status === 'rejected' ? RED : undefined} muted={r.status === 'rejected'} /> },
    { label: 'Bank txn ID', render: (r, { COLORS }) => <CopyText value={r.bank_transaction_id} COLORS={COLORS} maxWidth={130} /> },
    { label: 'Updated', render: (r, { COLORS }) => <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>{formatDate(r.updated_at)}</Typography> },
    { label: 'Note', minWidth: 150, render: (r, { COLORS }) => <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>{r.rejection_reason || dash}</Typography> },
  ],
}

// ---------------- People this user referred ----------------
export const referralsConfig = {
  key: 'referrals',
  label: 'Referrals',
  endpoint: 'history/referrals',
  emptyLabel: 'This user has not referred anyone yet',
  summaryLabel: 'Commission earned from this list',
  minWidth: 860,
  sortOptions: [
    { value: 'joined:desc', label: 'Newest first' },
    { value: 'joined:asc', label: 'Oldest first' },
    { value: 'earned:desc', label: 'Most commission' },
    { value: 'earned:asc', label: 'Least commission' },
  ],
  filters: [
    { key: 'search', label: 'Search username', type: 'text', placeholder: 'Username' },
    ...dateFilters.map((f) => ({ ...f, label: f.key === 'date_from' ? 'Joined from' : 'Joined to' })),
  ],
  columns: [
    { label: 'Joined', render: (r) => formatShortDate(r.joined_at) },
    {
      label: 'User', render: (r, { COLORS, onOpenUser }) => (
        <Box onClick={() => onOpenUser?.(r.id)} sx={{ cursor: onOpenUser ? 'pointer' : 'default', '&:hover .u': onOpenUser ? { textDecoration: 'underline' } : {} }}>
          <Typography className="u" sx={{ fontSize: '0.86rem', fontWeight: 700, color: COLORS.primaryLight }}>{r.username}</Typography>
          {sub(r.public_id, COLORS)}
        </Box>
      ),
    },
    { label: 'Country', render: (r) => r.country || dash },
    { label: 'Status', render: (r) => <StatusPill label={r.is_active ? 'Active' : 'Banned'} color={r.is_active ? GREEN : RED} /> },
    { label: 'Surveys completed', align: 'right', render: (r) => r.surveys_completed },
    { label: 'Commission earned', render: (r, { COLORS }) => <PointsCell points={r.commission_earned} COLORS={COLORS} color={GREEN} /> },
    { label: 'Reversed', render: (r, { COLORS }) => <PointsCell points={r.commission_reversed} COLORS={COLORS} color={r.commission_reversed ? RED : undefined} muted={!r.commission_reversed} /> },
    { label: 'Net commission', render: (r, { COLORS }) => <PointsCell points={r.commission_net} COLORS={COLORS} /> },
  ],
}

// ---------------- Everything (full ledger) ----------------
const ledgerNote = (r) => {
  const m = r.metadata || {}
  return r.offer_wall_name || (r.referred_username ? `From ${r.referred_username}` : null) || m.reason || m.rejection_reason || null
}
export const allActivityConfig = {
  key: 'all',
  label: 'All activity',
  endpoint: 'transactions',
  emptyLabel: 'No activity yet',
  minWidth: 760,
  filters: [
    {
      key: 'type', label: 'Type', type: 'select',
      options: [
        { value: '', label: 'All types' },
        ...['survey', 'referral', 'daily_bonus', 'level_up_bonus', 'bonus', 'promo', 'reversal', 'undo_reversal',
          'unlock', 'unlock_undo', 'adjustment', 'fraud_deduction', 'withdrawal', 'refund']
          .map((t) => ({ value: t, label: humanize(t) })),
      ],
    },
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: '', label: 'All statuses' },
        ...['completed', 'locked', 'pending', 'reversed', 'cancelled'].map((s) => ({ value: s, label: humanize(s) })),
      ],
    },
    ...dateFilters,
  ],
  columns: [
    { label: 'Date', render: dateCell },
    { label: 'Type', render: (r) => <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>{humanize(r.type)}</Typography> },
    { label: 'Details', minWidth: 170, render: (r, { COLORS }) => <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>{ledgerNote(r) || dash}</Typography> },
    { label: 'Status', render: (r) => <StatusPill label={r.status} color={statusColor(r.status)} /> },
    { label: 'Points', render: (r, { COLORS }) => <PointsCell points={r.amount} COLORS={COLORS} signed color={r.amount >= 0 ? GREEN : RED} /> },
  ],
}

export const HISTORY_TABS = [surveysConfig, bonusesConfig, reversalsConfig, withdrawalsConfig, referralsConfig, allActivityConfig]
