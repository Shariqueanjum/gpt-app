import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Typography, Paper, IconButton, Tooltip, Skeleton, Chip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined'
import VpnLockOutlinedIcon from '@mui/icons-material/VpnLockOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'

const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }
const METHOD_COLORS = ['#5312bc', '#10b981', '#2563eb', '#f59e0b', '#ec4899', '#14b8a6']

const AUDIT_ICON_MAP = {
  ban_user: { icon: BlockOutlinedIcon, color: '#ef4444' },
  unban_user: { icon: HowToRegOutlinedIcon, color: '#10b981' },
  manual_adjustment: { icon: PaidOutlinedIcon, color: '#5312bc' },
  approve_withdrawal: { icon: AccountBalanceWalletOutlinedIcon, color: '#10b981' },
  reject_withdrawal: { icon: AccountBalanceWalletOutlinedIcon, color: '#ef4444' },
  settings_update: { icon: TuneOutlinedIcon, color: '#2563eb' },
}
const defaultAuditIcon = { icon: HistoryOutlinedIcon, color: '#6b7280' }

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const formatAction = (action) => action ? action.replace(/_/g, ' ') : 'action'
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

// KPI card — shows real fetched value, a clear "—" + error chip when the
// underlying endpoint failed, never a fabricated number.
const StatCard = ({ icon: Icon, label, value, subValue, color, loading, error }) => {
  return (
    <Paper elevation={0} sx={{
      p: 2.2, borderRadius: 3, height: '100%',
      bgcolor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)',
      display: 'flex', flexDirection: 'column', gap: 1,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 2, bgcolor: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          <Icon sx={{ fontSize: '1.2rem' }} />
        </Box>
        {error && <Chip label="unavailable" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ef444415', color: '#ef4444' }} />}
      </Box>
      <Typography sx={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', fontWeight: 600 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={70} height={36} />
      ) : (
        <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1.1 }}>
          {error ? '—' : value}
        </Typography>
      )}
      {subValue && !loading && !error && (
        <Typography sx={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
          {subValue}
        </Typography>
      )}
    </Paper>
  )
}

const ChartCard = ({ title, subtitle, children, height = 260 }) => (
  <Paper elevation={0} sx={{
    p: 2.4, borderRadius: 3, height: '100%',
    bgcolor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)',
  }}>
    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', mb: 1.5 }}>
        {subtitle}
      </Typography>
    )}
    <Box sx={{ width: '100%', height }}>
      {children}
    </Box>
  </Paper>
)

const EmptyState = ({ label }) => (
  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography sx={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{label}</Typography>
  </Box>
)

const initialData = {
  totalUsers: null, activeUsers: null,
  pendingWithdrawals: null, pendingWithdrawalsAmount: null,
  openTickets: null, pendingProofs: null,
  fraudFlagged: null, fraudScanned: null, fraudByRisk: [],
  withdrawalsByMethod: [],
  traffic: [], vpn: null,
  recentActivity: [],
}

const AdminDashboardPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const next = { ...initialData }
    const errs = {}

    const [
      totalUsersRes, activeUsersRes, withdrawalsRes, ticketsRes,
      proofsRes, fraudRes, trafficRes, vpnRes, auditRes,
    ] = await Promise.allSettled([
      adminAxiosInstance.get('/admin/users', { params: { limit: 1 } }),
      adminAxiosInstance.get('/admin/users', { params: { limit: 1, is_active: true } }),
      adminAxiosInstance.get('/admin/withdrawals/pending', { params: { limit: 100 } }),
      adminAxiosInstance.get('/admin/tickets', { params: { status: 'open', limit: 1 } }),
      adminAxiosInstance.get('/admin/payment-proofs', { params: { limit: 1 } }),
      adminAxiosInstance.get('/admin/fraud/dashboard', { params: { min_score: 31 } }),
      adminAxiosInstance.get('/admin/traffic-logs/stats'),
      adminAxiosInstance.get('/admin/vpn/stats'),
      adminAxiosInstance.get('/admin/audit-logs', { params: { limit: 8 } }),
    ])

    if (totalUsersRes.status === 'fulfilled') next.totalUsers = totalUsersRes.value.data?.meta?.total ?? 0
    else errs.totalUsers = true

    if (activeUsersRes.status === 'fulfilled') next.activeUsers = activeUsersRes.value.data?.meta?.total ?? 0
    else errs.activeUsers = true

    if (withdrawalsRes.status === 'fulfilled') {
      const meta = withdrawalsRes.value.data?.meta
      const rows = withdrawalsRes.value.data?.data || []
      next.pendingWithdrawals = meta?.total ?? rows.length
      next.pendingWithdrawalsAmount = rows.reduce((s, w) => s + (Number(w.amount) || 0), 0)
      const byMethod = {}
      rows.forEach((w) => {
        const m = w.method || 'other'
        byMethod[m] = (byMethod[m] || 0) + (Number(w.amount) || 0)
      })
      next.withdrawalsByMethod = Object.entries(byMethod).map(([method, amount]) => ({ method, amount }))
    } else errs.withdrawals = true

    if (ticketsRes.status === 'fulfilled') next.openTickets = ticketsRes.value.data?.meta?.total ?? 0
    else errs.tickets = true

    if (proofsRes.status === 'fulfilled') {
      next.pendingProofs = proofsRes.value.data?.meta?.total ?? (proofsRes.value.data?.data?.length ?? 0)
    } else errs.proofs = true

    if (fraudRes.status === 'fulfilled') {
      const rows = fraudRes.value.data?.data || []
      next.fraudFlagged = fraudRes.value.data?.meta?.flagged_count ?? rows.length
      next.fraudScanned = fraudRes.value.data?.meta?.total_scanned ?? null
      const byRisk = {}
      rows.forEach((u) => { byRisk[u.risk_level] = (byRisk[u.risk_level] || 0) + 1 })
      next.fraudByRisk = Object.entries(byRisk).map(([risk_level, count]) => ({ risk_level, count }))
    } else errs.fraud = true

    if (trafficRes.status === 'fulfilled') {
      next.traffic = (trafficRes.value.data?.data || []).map((t) => ({
        label: `${t.direction} · ${t.type}`,
        success: Number(t.count) - Number(t.error_count || 0),
        errors: Number(t.error_count || 0),
      }))
    } else errs.traffic = true

    if (vpnRes.status === 'fulfilled') next.vpn = vpnRes.value.data?.data || null
    else errs.vpn = true

    if (auditRes.status === 'fulfilled') next.recentActivity = auditRes.value.data?.data || []
    else errs.audit = true

    setData(next)
    setErrors(errs)
    setLoading(false)
    setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 120000) // auto-refresh every 2 min
    return () => clearInterval(interval)
  }, [fetchAll])

  const cssVars = useMemo(() => ({
    '--admin-card-bg': COLORS.cardBg,
    '--admin-border': COLORS.border,
    '--admin-text-primary': COLORS.textPrimary,
    '--admin-text-secondary': COLORS.textSecondary,
    '--admin-text-muted': COLORS.textMuted,
  }), [COLORS])

  const trafficTotalErrors = data.traffic.reduce((s, t) => s + t.errors, 0)
  const trafficTotal = data.traffic.reduce((s, t) => s + t.success + t.errors, 0)

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={cssVars}>
        {/* Header row */}
        <Box sx={{
          display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 3,
        }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
              Overview
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
              {lastUpdated ? `Updated ${timeAgo(lastUpdated.toISOString())}` : 'Loading live data…'}
            </Typography>
          </Box>
          <Tooltip title="Refresh now">
            <span>
              <IconButton onClick={fetchAll} disabled={loading} sx={{
                bgcolor: `${COLORS.primary}10`, color: COLORS.primary,
                '&:hover': { bgcolor: `${COLORS.primary}1c` },
              }}>
                <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* KPI grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2, mb: 3,
        }}>
          <StatCard icon={PeopleAltOutlinedIcon} label="Total users" value={data.totalUsers}
            loading={loading} error={errors.totalUsers} color="#5312bc" />
          <StatCard icon={HowToRegOutlinedIcon} label="Active users" value={data.activeUsers}
            loading={loading} error={errors.activeUsers} color="#10b981" />
          <StatCard icon={AccountBalanceWalletOutlinedIcon} label="Pending withdrawals" value={data.pendingWithdrawals}
            subValue={data.pendingWithdrawalsAmount != null ? `${formatCurrency(data.pendingWithdrawalsAmount)} value` : null}
            loading={loading} error={errors.withdrawals} color="#f59e0b" />
          <StatCard icon={SupportAgentOutlinedIcon} label="Open tickets" value={data.openTickets}
            loading={loading} error={errors.tickets} color="#2563eb" />
          <StatCard icon={ReceiptLongOutlinedIcon} label="Payment proofs pending" value={data.pendingProofs}
            loading={loading} error={errors.proofs} color="#14b8a6" />
          <StatCard icon={GppMaybeOutlinedIcon} label="Fraud-flagged users" value={data.fraudFlagged}
            subValue={data.fraudScanned != null ? `of ${data.fraudScanned} scanned` : null}
            loading={loading} error={errors.fraud} color="#ef4444" />
          <StatCard icon={SwapHorizOutlinedIcon} label="Traffic (24h)" value={trafficTotal || 0}
            subValue={trafficTotal ? `${trafficTotalErrors} errors` : null}
            loading={loading} error={errors.traffic} color="#ec4899" />
          <StatCard icon={VpnLockOutlinedIcon} label="VPN/proxy hits (24h)" value={data.vpn ? Number(data.vpn.vpn_detected) + Number(data.vpn.proxy_detected) : 0}
            subValue={data.vpn ? `of ${data.vpn.total_checks} checks` : null}
            loading={loading} error={errors.vpn} color="#6b7280" />
        </Box>

        {/* Charts row */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
          gap: 2, mb: 3,
        }}>
          <ChartCard title="Fraud risk distribution" subtitle="Users scoring above 30, by risk level">
            {loading ? (
              <Skeleton variant="rounded" width="100%" height="100%" />
            ) : data.fraudByRisk.length === 0 ? (
              <EmptyState label="No flagged users right now" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.fraudByRisk}
                    dataKey="count"
                    nameKey="risk_level"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.fraudByRisk.map((entry) => (
                      <Cell key={entry.risk_level} fill={RISK_COLORS[entry.risk_level] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={28} iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' }}>{value}</span>} />
                  <ReTooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Pending withdrawals by method" subtitle="Total ₹ amount awaiting approval">
            {loading ? (
              <Skeleton variant="rounded" width="100%" height="100%" />
            ) : data.withdrawalsByMethod.length === 0 ? (
              <EmptyState label="No pending withdrawals" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.withdrawalsByMethod}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="method" tick={{ fontSize: 11, fill: COLORS.textSecondary }} />
                  <YAxis tick={{ fontSize: 11, fill: COLORS.textSecondary }} />
                  <ReTooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {data.withdrawalsByMethod.map((entry, i) => (
                      <Cell key={entry.method} fill={METHOD_COLORS[i % METHOD_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Offer-wall traffic (24h)" subtitle="Success vs. error responses by type">
            {loading ? (
              <Skeleton variant="rounded" width="100%" height="100%" />
            ) : data.traffic.length === 0 ? (
              <EmptyState label="No traffic in the last 24h" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.traffic} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textSecondary }} />
                  <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 10, fill: COLORS.textSecondary }} />
                  <ReTooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="success" stackId="a" fill="#10b981" name="Success" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="errors" stackId="a" fill="#ef4444" name="Errors" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Box>

        {/* Recent activity */}
        <Paper elevation={0} sx={{
          p: 2.4, borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
        }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary, mb: 1.5 }}>
            Recent admin activity
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={48} />)}
            </Box>
          ) : errors.audit ? (
            <EmptyState label="Couldn't load audit logs" />
          ) : data.recentActivity.length === 0 ? (
            <EmptyState label="No admin actions logged yet" />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {data.recentActivity.map((log, idx) => {
                const cfg = AUDIT_ICON_MAP[log.action] || defaultAuditIcon
                const Icon = cfg.icon
                return (
                  <Box key={log.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.3,
                    borderBottom: idx < data.recentActivity.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  }}>
                    <Box sx={{
                      width: 34, height: 34, borderRadius: 1.8, bgcolor: `${cfg.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0,
                    }}>
                      <Icon sx={{ fontSize: '1.05rem' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textPrimary, fontWeight: 600, textTransform: 'capitalize' }}>
                        {formatAction(log.action)}
                        {log.target_type && (
                          <Typography component="span" sx={{ fontSize: '0.8rem', color: COLORS.textMuted, fontWeight: 500 }}>
                            {' '}· {log.target_type} #{log.target_id}
                          </Typography>
                        )}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: COLORS.textMuted }}>
                        by {log.admin_username || 'admin'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted, flexShrink: 0 }}>
                      {timeAgo(log.created_at)}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          )}
        </Paper>
      </Box>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AdminPageWrapper>
  )
}

export default AdminDashboardPage