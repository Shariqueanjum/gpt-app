import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Avatar, IconButton, Tooltip, TextField, MenuItem,
  Skeleton, Menu,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  useDebouncedValue, SearchInput, FilterSelect, StatusPill, PaginationFooter,
  EmptyState, ErrorState, ActionDialog, TableShell, TableScroll,
} from '../../components/Admin/AdminUiKit'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Banned' },
]

const formatMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const AdminUsersPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

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
      // surfaced inline via a transient error state would be nicer; keep simple + visible
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

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Users
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {meta ? `${meta.total} registered users` : 'Loading…'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search username, email, or ID…" COLORS={COLORS} />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} COLORS={COLORS} />
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchUsers} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No users match these filters" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['User', 'Balance', 'Earned', 'Withdrawn', 'Level', 'Status', 'Joined', ''].map((h) => (
                    <Box component="th" key={h} sx={{
                      textAlign: 'left', px: 2, py: 1.4, fontSize: '0.74rem', fontWeight: 700,
                      color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {loading
                  ? [...Array(8)].map((_, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <Box component="td" colSpan={8} sx={{ px: 2, py: 1.6 }}>
                        <Skeleton variant="rounded" height={28} />
                      </Box>
                    </Box>
                  ))
                  : rows.map((user) => (
                    <Box component="tr" key={user.id} sx={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      '&:hover': { bgcolor: `${COLORS.primary}05` },
                    }}>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: COLORS.primary }}>
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.textPrimary }} noWrap>
                                {user.username}
                              </Typography>
                              {user.is_verified && <VerifiedOutlinedIcon sx={{ fontSize: '0.95rem', color: '#10b981' }} />}
                            </Box>
                            <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted }} noWrap>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.85rem', fontWeight: 700, color: COLORS.textPrimary, whiteSpace: 'nowrap' }}>
                        {formatMoney(user.balance_available)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.83rem', color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                        {formatMoney(user.total_earned)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.83rem', color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                        {formatMoney(user.total_withdrawn)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.83rem', color: COLORS.textSecondary }}>
                        Lvl {user.level ?? 1}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <StatusPill label={user.is_active ? 'Active' : 'Banned'} color={user.is_active ? '#10b981' : '#ef4444'} />
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.8rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(user.created_at)}
                      </Box>
                      <Box component="td" sx={{ px: 1, py: 1.4, textAlign: 'right' }}>
                        <IconButton size="small" onClick={(e) => openMenu(e, user)}>
                          <MoreVertIcon fontSize="small" sx={{ color: COLORS.textMuted }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
          </TableScroll>
        )}
        {!error && <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={(v) => { setLimit(v); setPage(1) }} COLORS={COLORS} />}
      </TableShell>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 190 } }}>
        {menuUser?.is_active ? (
          <MenuItem onClick={() => { setBanDialog(true); setMenuAnchor(null) }} sx={{ fontSize: '0.85rem', gap: 1.2, color: '#ef4444' }}>
            <BlockOutlinedIcon fontSize="small" /> Ban user
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleUnban(menuUser)} sx={{ fontSize: '0.85rem', gap: 1.2, color: '#10b981' }}>
            <HowToRegOutlinedIcon fontSize="small" /> Unban user
          </MenuItem>
        )}
        <MenuItem onClick={() => { setAdjustDialog(true); setMenuAnchor(null) }} sx={{ fontSize: '0.85rem', gap: 1.2 }}>
          <PaidOutlinedIcon fontSize="small" /> Adjust balance
        </MenuItem>
      </Menu>

      <ActionDialog
        open={banDialog}
        onClose={() => { setBanDialog(false); setActionError('') }}
        title={`Ban ${menuUser?.username || 'user'}`}
        onConfirm={handleBan}
        confirmLabel="Ban user"
        danger
        loading={actionLoading}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.84rem', color: COLORS.textSecondary, mb: 1.5 }}>
          This immediately blocks the account from logging in and earning. They'll see the ban reason.
        </Typography>
        <TextField fullWidth multiline minRows={2} placeholder="Reason (optional)"
          value={banReason} onChange={(e) => setBanReason(e.target.value)} size="small" />
      </ActionDialog>

      <ActionDialog
        open={adjustDialog}
        onClose={() => { setAdjustDialog(false); setActionError('') }}
        title={`Adjust balance — ${menuUser?.username || ''}`}
        onConfirm={handleAdjustBalance}
        confirmLabel="Apply adjustment"
        loading={actionLoading}
        confirmDisabled={!adjustAmount || !adjustReason.trim()}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.84rem', color: COLORS.textSecondary, mb: 1.5 }}>
          Current balance: <strong>{formatMoney(menuUser?.balance_available)}</strong>. Use a negative amount to deduct.
        </Typography>
        <TextField fullWidth type="number" label="Amount (₹, use - to deduct)" size="small"
          value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} sx={{ mb: 1.5 }} />
        <TextField fullWidth multiline minRows={2} label="Reason" size="small"
          value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
      </ActionDialog>
    </AdminPageWrapper>
  )
}

export default AdminUsersPage