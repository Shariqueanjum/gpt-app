import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Avatar, IconButton, Tooltip, TextField, MenuItem,
  Skeleton, Menu, Drawer, Divider, Chip, Tabs, Tab, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Grid, useTheme, useMediaQuery
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import PersonIcon from '@mui/icons-material/Person'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  useDebouncedValue, SearchInput, FilterSelect, StatusPill, PaginationFooter,
  EmptyState, ErrorState, ActionDialog, TableShell, } from '../../components/Admin/AdminUiKit'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Banned' },
]

// 100 points = $1
const POINTS_TO_DOLLAR = 100
const formatPoints = (n) => `${Number(n || 0).toLocaleString('en-US')} pts`
const formatDollar = (n) => `$${(Number(n || 0) / POINTS_TO_DOLLAR).toFixed(2)}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const PointsWithDollar = ({ points, COLORS, size = '0.75rem' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.2 }}>
    <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '0.9rem', lineHeight: 1.2 }}>
      {formatPoints(points)}
    </Typography>
    <Typography sx={{ fontSize: size, color: COLORS.textMuted, lineHeight: 1.2 }}>
      {formatDollar(points)}
    </Typography>
  </Box>
)

const StatCard = ({ icon: Icon, label, value, subvalue, color, COLORS }) => (
  <Paper sx={{
    p: 2, borderRadius: 3, bgcolor: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1.5
  }}>
    <Box sx={{
      width: 44, height: 44, borderRadius: 2.5, bgcolor: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon sx={{ color, fontSize: 24 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.2, mt: 0.3 }}>
        {value}
      </Typography>
      {subvalue && (
        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mt: 0.3, lineHeight: 1.2 }}>
          {subvalue}
        </Typography>
      )}
    </Box>
  </Paper>
)

const UserDetailDrawer = ({ userId, open, onClose, darkMode, onBanUnban }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [transactions, setTransactions] = useState({ data: [], meta: null })
  const [withdrawals, setWithdrawals] = useState({ data: [], meta: null })
  const [txLoading, setTxLoading] = useState(false)
  const [wdLoading, setWdLoading] = useState(false)

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await adminAxiosInstance.get(`/admin/users/${userId}/details`)
      setUserData(res.data?.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchTransactions = useCallback(async (page = 1) => {
    if (!userId) return
    setTxLoading(true)
    try {
      const res = await adminAxiosInstance.get(`/admin/users/${userId}/transactions`, { params: { page, limit: 10 } })
      setTransactions({
        data: res.data?.data || [],
        meta: res.data?.meta || null
      })
    } catch (err) {
      setTransactions({ data: [], meta: null })
    } finally {
      setTxLoading(false)
    }
  }, [userId])

  const fetchWithdrawals = useCallback(async (page = 1) => {
    if (!userId) return
    setWdLoading(true)
    try {
      const res = await adminAxiosInstance.get(`/admin/users/${userId}/withdrawals`, { params: { page, limit: 10 } })
      setWithdrawals({
        data: res.data?.data || [],
        meta: res.data?.meta || null
      })
    } catch (err) {
      setWithdrawals({ data: [], meta: null })
    } finally {
      setWdLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails()
      fetchTransactions()
      fetchWithdrawals()
      setActiveTab(0)
    }
  }, [open, userId, fetchUserDetails, fetchTransactions, fetchWithdrawals])

  const handleTabChange = (e, newVal) => {
    setActiveTab(newVal)
  }

  const drawerWidth = isMobile ? '100%' : 520

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          bgcolor: COLORS.bg,
          borderLeft: `1px solid ${COLORS.border}`,
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 2.5, borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: COLORS.cardBg
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Avatar sx={{
              width: 44, height: 44, bgcolor: COLORS.primary,
              fontSize: '1.1rem', fontWeight: 700, flexShrink: 0
            }}>
              {userData?.user?.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '1rem', lineHeight: 1.2 }}>
                {userData?.user?.username || 'Loading...'}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, lineHeight: 1.2 }}>
                {userData?.user?.email || ''}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: COLORS.textSecondary, flexShrink: 0 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Box>
          ) : error ? (
            <ErrorState label={error} onRetry={fetchUserDetails} COLORS={COLORS} />
          ) : userData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Status Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={userData.user.is_active ? 'Active' : 'Banned'}
                  sx={{
                    bgcolor: userData.user.is_active ? '#10b98115' : '#ef444415',
                    color: userData.user.is_active ? '#10b981' : '#ef4444',
                    fontWeight: 700, fontSize: '0.75rem'
                  }}
                />
                {userData.user.is_verified && (
                  <Chip
                    size="small"
                    icon={<VerifiedOutlinedIcon sx={{ fontSize: 14 }} />}
                    label="Verified"
                    sx={{ bgcolor: '#2563eb15', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem' }}
                  />
                )}
                <Chip
                  size="small"
                  label={`Lvl ${userData.user.level || 1}`}
                  sx={{ bgcolor: `${COLORS.primary}15`, color: COLORS.primary, fontWeight: 700, fontSize: '0.75rem' }}
                />
              </Box>

              {/* Stats Grid */}
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <StatCard
                    icon={AccountBalanceWalletIcon}
                    label="Balance"
                    value={formatPoints(userData.user.balance_available)}
                    subvalue={formatDollar(userData.user.balance_available)}
                    color={COLORS.primary}
                    COLORS={COLORS}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatCard
                    icon={TrendingUpIcon}
                    label="Total Earned"
                    value={formatPoints(userData.stats.total_earned)}
                    subvalue={formatDollar(userData.stats.total_earned)}
                    color="#10b981"
                    COLORS={COLORS}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatCard
                    icon={PaidOutlinedIcon}
                    label="Withdrawn"
                    value={formatPoints(userData.stats.total_withdrawn)}
                    subvalue={formatDollar(userData.stats.total_withdrawn)}
                    color="#f59e0b"
                    COLORS={COLORS}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatCard
                    icon={PeopleIcon}
                    label="Referrals"
                    value={userData.stats.total_referrals}
                    subvalue={`Earned: ${formatPoints(userData.stats.referral_earnings)}`}
                    color="#ec4899"
                    COLORS={COLORS}
                  />
                </Grid>
              </Grid>

              {/* User Info */}
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '0.9rem', mb: 1.5 }}>
                  Account Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Full Name', value: userData.user.full_name || '—' },
                    { label: 'Public ID', value: userData.user.public_id },
                    { label: 'Country', value: userData.user.country || '—' },
                    { label: 'Phone', value: userData.user.phone || '—' },
                    { label: 'UPI ID', value: userData.user.upi_id || '—' },
                    { label: 'Referral Code', value: userData.user.referral_code },
                    { label: 'Profile Completion', value: `${userData.user.profile_completion || 0}%` },
                    { label: 'Joined', value: formatDate(userData.user.created_at) },
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, gap: 1 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted, flexShrink: 0 }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textPrimary, fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: COLORS.border }}>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 40 }}>
                  <Tab label="Transactions" sx={{ textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, minHeight: 40 }} />
                  <Tab label="Withdrawals" sx={{ textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, minHeight: 40 }} />
                  <Tab label={`Referrals (${userData.referrals.total_referrals})`} sx={{ textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, minHeight: 40 }} />
                </Tabs>
              </Box>

              {/* Transactions Tab */}
              {activeTab === 0 && (
                <Box>
                  {txLoading ? (
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                  ) : transactions.data.length === 0 ? (
                    <EmptyState label="No transactions found" COLORS={COLORS} />
                  ) : (
                    <TableShell COLORS={COLORS}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Type', 'Amount', 'Status', 'Date'].map((h) => (
                              <TableCell key={h} sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions.data.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.8rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {tx.type}
                              </TableCell>
                              <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <PointsWithDollar points={tx.amount} COLORS={COLORS} size="0.7rem" />
                              </TableCell>
                              <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <StatusPill label={tx.status} color={
                                  tx.status === 'completed' ? '#10b981' :
                                  tx.status === 'pending' ? '#f59e0b' :
                                  tx.status === 'reversed' ? '#ef4444' : '#6b7280'
                                } />
                              </TableCell>
                              <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {formatDate(tx.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableShell>
                  )}
                  {transactions.meta && transactions.meta.totalPages > 1 && (
                    <PaginationFooter
                      meta={transactions.meta}
                      onPageChange={(p) => fetchTransactions(p)}
                      COLORS={COLORS}
                    />
                  )}
                </Box>
              )}

              {/* Withdrawals Tab */}
              {activeTab === 1 && (
                <Box>
                  {wdLoading ? (
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                  ) : withdrawals.data.length === 0 ? (
                    <EmptyState label="No withdrawals found" COLORS={COLORS} />
                  ) : (
                    <TableShell COLORS={COLORS}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Amount', 'Method', 'Status', 'Date'].map((h) => (
                              <TableCell key={h} sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {withdrawals.data.map((wd) => (
                            <TableRow key={wd.id}>
                              <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <PointsWithDollar points={wd.amount} COLORS={COLORS} size="0.7rem" />
                              </TableCell>
                              <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.8rem', borderBottom: `1px solid ${COLORS.border}`, textTransform: 'uppercase' }}>
                                {wd.method}
                              </TableCell>
                              <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <StatusPill label={wd.status} color={
                                  wd.status === 'paid' ? '#10b981' :
                                  wd.status === 'pending' ? '#f59e0b' :
                                  wd.status === 'rejected' ? '#ef4444' : '#6b7280'
                                } />
                              </TableCell>
                              <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {formatDate(wd.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableShell>
                  )}
                  {withdrawals.meta && withdrawals.meta.totalPages > 1 && (
                    <PaginationFooter
                      meta={withdrawals.meta}
                      onPageChange={(p) => fetchWithdrawals(p)}
                      COLORS={COLORS}
                    />
                  )}
                </Box>
              )}

              {/* Referrals Tab */}
              {activeTab === 2 && (
                <Box>
                  {userData.referrals.referrals.length === 0 ? (
                    <EmptyState label="No referrals yet" COLORS={COLORS} />
                  ) : (
                    <TableShell COLORS={COLORS}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['User', 'Balance', 'Joined'].map((h) => (
                              <TableCell key={h} sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userData.referrals.referrals.map((ref) => (
                            <TableRow key={ref.id}>
                              <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: COLORS.primary, fontSize: '0.75rem' }}>
                                    {ref.username?.[0]?.toUpperCase() || '?'}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: COLORS.textPrimary, fontWeight: 600, lineHeight: 1.2 }}>
                                      {ref.username}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, lineHeight: 1.2 }}>
                                      {ref.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <PointsWithDollar points={ref.balance_available} COLORS={COLORS} size="0.7rem" />
                              </TableCell>
                              <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                                {formatDate(ref.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableShell>
                  )}
                </Box>
              )}

              {/* Ban Info */}
              {!userData.user.is_active && userData.user.ban_reason && (
                <Paper sx={{
                  p: 2, borderRadius: 3, bgcolor: '#fef2f2',
                  border: '1px solid #fecaca'
                }}>
                  <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', mb: 0.5 }}>
                    Banned
                  </Typography>
                  <Typography sx={{ color: '#991b1b', fontSize: '0.8rem' }}>
                    Reason: {userData.user.ban_reason}
                  </Typography>
                  <Typography sx={{ color: '#991b1b', fontSize: '0.75rem', mt: 0.5 }}>
                    Banned at: {formatDate(userData.user.banned_at)}
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : null}
        </Box>

        {/* Footer Actions */}
        {userData && (
          <Box sx={{
            p: 2.5, borderTop: `1px solid ${COLORS.border}`,
            bgcolor: COLORS.cardBg, display: 'flex', gap: 1.5
          }}>
            {userData.user.is_active ? (
              <Box
                onClick={() => { onClose(); onBanUnban(userData.user, 'ban'); }}
                sx={{
                  flex: 1, py: 1.2, borderRadius: 2, cursor: 'pointer',
                  bgcolor: '#fef2f2', color: '#ef4444',
                  fontWeight: 700, fontSize: '0.85rem', textAlign: 'center',
                  border: '1px solid #fecaca',
                  '&:hover': { bgcolor: '#fee2e2' }
                }}
              >
                Ban User
              </Box>
            ) : (
              <Box
                onClick={() => { onClose(); onBanUnban(userData.user, 'unban'); }}
                sx={{
                  flex: 1, py: 1.2, borderRadius: 2, cursor: 'pointer',
                  bgcolor: '#f0fdf4', color: '#10b981',
                  fontWeight: 700, fontSize: '0.85rem', textAlign: 'center',
                  border: '1px solid #bbf7d0',
                  '&:hover': { bgcolor: '#dcfce7' }
                }}
              >
                Unban User
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

const AdminUsersPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuUser, setMenuUser] = useState(null)

  const [detailUser, setDetailUser] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [banDialog, setBanDialog] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [adjustDialog, setAdjustDialog] = useState(false)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.is_active = statusFilter
      const res = await adminAxiosInstance.get('/admin/users', { params })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users')
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

  const openMenu = (e, user) => { setMenuAnchor(e.currentTarget); setMenuUser(user) }
  const closeMenu = () => { setMenuAnchor(null); setMenuUser(null) }

  const openDetails = (user) => {
    setDetailUser(user)
    setDetailOpen(true)
    closeMenu()
  }

  const handleBan = async () => {
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.put(`/admin/users/${menuUser.id}/ban`, { reason: banReason || undefined })
      setBanDialog(false); setBanReason('')
      fetchUsers()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to ban user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnban = async (user) => {
    closeMenu()
    try {
      await adminAxiosInstance.put(`/admin/users/${user.id}/unban`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unban user')
    }
  }

  const handleAdjustBalance = async () => {
    const amountNum = parseFloat(adjustAmount)
    if (!amountNum || !adjustReason.trim()) return
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.post(`/admin/users/${menuUser.id}/adjust-balance`, {
        amount: amountNum, reason: adjustReason,
      })
      setAdjustDialog(false); setAdjustAmount(''); setAdjustReason('')
      fetchUsers()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to adjust balance')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBanUnbanFromDetail = (user, action) => {
    if (action === 'ban') {
      setMenuUser(user)
      setBanDialog(true)
    } else {
      handleUnban(user)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: COLORS.textPrimary, mb: 0.5 }}>
            Users
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>
            {meta ? `${meta.total.toLocaleString()} registered users` : 'Loading…'}
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search users…" COLORS={COLORS} />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            COLORS={COLORS}
          />
        </Box>

        {/* List: mobile cards vs desktop table */}
        {error ? (
          <ErrorState label={error} onRetry={fetchUsers} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No users found" COLORS={COLORS} />
        ) : isMobile ? (
          /* ---------- MOBILE CARD LIST ---------- */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
                ))
              : rows.map((user) => (
                  <Paper
                    key={user.id}
                    onClick={() => openDetails(user)}
                    sx={{
                      p: 2, borderRadius: 3, bgcolor: COLORS.cardBg,
                      border: `1px solid ${COLORS.border}`, cursor: 'pointer'
                    }}
                  >
                    {/* Top row: avatar/name/email + menu */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: COLORS.primary, fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{
                              fontSize: '0.9rem', fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {user.username}
                            </Typography>
                            {user.is_verified && (
                              <VerifiedOutlinedIcon sx={{ fontSize: 14, color: '#2563eb', flexShrink: 0 }} />
                            )}
                          </Box>
                          <Typography sx={{
                            fontSize: '0.75rem', color: COLORS.textMuted, lineHeight: 1.2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); openMenu(e, user); }}
                        sx={{ color: COLORS.textSecondary, flexShrink: 0 }}
                      >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>

                    {/* Balance / Earned / Withdrawn */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
                      {[
                        { label: 'Balance', value: user.balance_available },
                        { label: 'Earned', value: user.total_earned },
                        { label: 'Withdrawn', value: user.total_withdrawn },
                      ].map((item) => (
                        <Box key={item.label}>
                          <Typography sx={{ fontSize: '0.65rem', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.3 }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.3 }}>
                            {formatPoints(item.value)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: COLORS.textMuted }}>
                            {formatDollar(item.value)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Status / Level / Joined */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                        <StatusPill
                          label={user.is_active ? 'Active' : 'Banned'}
                          color={user.is_active ? '#10b981' : '#ef4444'}
                        />
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 600 }}>
                          Lvl {user.level ?? 1}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(user.created_at)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
          </Box>
        ) : (
          /* ---------- DESKTOP TABLE ---------- */
          <Box sx={{
              overflowX: 'auto',
              width: '100%',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: COLORS.border, borderRadius: '10px' }
            }}>
              <TableShell COLORS={COLORS} sx={{ minWidth: { xs: 720, sm: '100%' } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['User', 'Balance', 'Earned', 'Withdrawn', 'Level', 'Status', 'Joined', ''].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          color: COLORS.textMuted,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          borderBottom: `1px solid ${COLORS.border}`,
                          whiteSpace: 'nowrap',
                          textAlign: h === '' ? 'center' : (h === 'User' ? 'left' : 'center'),
                          px: { xs: 1, sm: 2 }
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? [...Array(8)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(8)].map((_, j) => (
                            <TableCell key={j} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                              <Skeleton variant="text" width={j === 0 ? 120 : 60} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : rows.map((user) => (
                        <TableRow
                          key={user.id}
                          sx={{
                            '&:hover': { bgcolor: `${COLORS.primary}04` },
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onClick={() => openDetails(user)}
                        >
                          {/* User */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, px: { xs: 1, sm: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.primary, fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                                {user.username?.[0]?.toUpperCase() || '?'}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                                    {user.username}
                                  </Typography>
                                  {user.is_verified && (
                                    <VerifiedOutlinedIcon sx={{ fontSize: 14, color: '#2563eb', flexShrink: 0 }} />
                                  )}
                                </Box>
                                <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, lineHeight: 1.2 }}>
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Balance - CENTERED */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}>
                              <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                {formatPoints(user.balance_available)}
                              </Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, lineHeight: 1.2 }}>
                                {formatDollar(user.balance_available)}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Earned - CENTERED */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}>
                              <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                {formatPoints(user.total_earned)}
                              </Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, lineHeight: 1.2 }}>
                                {formatDollar(user.total_earned)}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Withdrawn - CENTERED */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}>
                              <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                {formatPoints(user.total_withdrawn)}
                              </Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, lineHeight: 1.2 }}>
                                {formatDollar(user.total_withdrawn)}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Level - CENTERED */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                            <Typography sx={{ fontSize: '0.85rem', color: COLORS.textPrimary, fontWeight: 600, lineHeight: 1.2 }}>
                              Lvl {user.level ?? 1}
                            </Typography>
                          </TableCell>

                          {/* Status - CENTERED */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                            <StatusPill
                              label={user.is_active ? 'Active' : 'Banned'}
                              color={user.is_active ? '#10b981' : '#ef4444'}
                            />
                          </TableCell>

                          {/* Joined - CENTERED */}
                          <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.8rem', borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', whiteSpace: 'nowrap', px: { xs: 1, sm: 2 } }}>
                            {formatDate(user.created_at)}
                          </TableCell>

                          {/* Actions - CENTERED */}
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); openMenu(e, user); }}
                              sx={{ color: COLORS.textSecondary }}
                            >
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableShell>
            </Box>
        )}

        {!error && meta && (
          <PaginationFooter
            meta={meta}
            onPageChange={setPage}
            onLimitChange={(v) => { setLimit(v); setPage(1) }}
            COLORS={COLORS}
          />
        )}
      </Box>

      {/* Row Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{ sx: { bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => { openDetails(menuUser); }} sx={{ fontSize: '0.85rem', gap: 1.2, color: COLORS.textPrimary }}>
          <PersonIcon sx={{ fontSize: 18 }} /> View Details
        </MenuItem>
        {menuUser?.is_active ? (
          <MenuItem onClick={() => { setBanDialog(true); setMenuAnchor(null); }} sx={{ fontSize: '0.85rem', gap: 1.2, color: '#ef4444' }}>
            <BlockOutlinedIcon sx={{ fontSize: 18 }} /> Ban user
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { handleUnban(menuUser); }} sx={{ fontSize: '0.85rem', gap: 1.2, color: '#10b981' }}>
            <HowToRegOutlinedIcon sx={{ fontSize: 18 }} /> Unban user
          </MenuItem>
        )}
        <MenuItem onClick={() => { setAdjustDialog(true); setMenuAnchor(null); }} sx={{ fontSize: '0.85rem', gap: 1.2, color: COLORS.textPrimary }}>
          <PaidOutlinedIcon sx={{ fontSize: 18 }} /> Adjust balance
        </MenuItem>
      </Menu>

      {/* Detail Drawer */}
      <UserDetailDrawer
        userId={detailUser?.id}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        darkMode={darkMode}
        onBanUnban={handleBanUnbanFromDetail}
      />

      {/* Ban Dialog */}
      <ActionDialog
        open={banDialog}
        onClose={() => { setBanDialog(false); setActionError(''); }}
        title={`Ban ${menuUser?.username || 'user'}`}
        onConfirm={handleBan}
        confirmLabel="Ban user"
        danger
        loading={actionLoading}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 1.5 }}>
          This immediately blocks the account from logging in and earning. They'll see the ban reason.
        </Typography>
        <TextField
          fullWidth
          label="Ban reason (optional)"
          placeholder="e.g. Fraud detected"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: COLORS.cardBg,
              color: COLORS.textPrimary,
              '& fieldset': { borderColor: COLORS.border },
            }
          }}
        />
      </ActionDialog>

      {/* Adjust Dialog */}
      <ActionDialog
        open={adjustDialog}
        onClose={() => { setAdjustDialog(false); setActionError(''); }}
        title={`Adjust balance — ${menuUser?.username || ''}`}
        onConfirm={handleAdjustBalance}
        confirmLabel="Apply adjustment"
        loading={actionLoading}
        confirmDisabled={!adjustAmount || !adjustReason.trim()}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 1.5 }}>
          Current balance: <strong>{formatPoints(menuUser?.balance_available)}</strong> ({formatDollar(menuUser?.balance_available)}).
          Use a negative amount to deduct.
        </Typography>
        <TextField
          fullWidth
          label="Amount (points)"
          type="number"
          placeholder="e.g. 500 or -200"
          value={adjustAmount}
          onChange={(e) => setAdjustAmount(e.target.value)}
          size="small"
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              bgcolor: COLORS.cardBg,
              color: COLORS.textPrimary,
              '& fieldset': { borderColor: COLORS.border },
            }
          }}
        />
        <TextField
          fullWidth
          label="Reason"
          placeholder="Why are you adjusting?"
          value={adjustReason}
          onChange={(e) => setAdjustReason(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: COLORS.cardBg,
              color: COLORS.textPrimary,
              '& fieldset': { borderColor: COLORS.border },
            }
          }}
        />
      </ActionDialog>
    </AdminPageWrapper>
  )
}

export default AdminUsersPage