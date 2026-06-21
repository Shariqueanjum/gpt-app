// ============================================================
// AdminUsersPage.jsx — Manage All Users
// ============================================================
import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  TextField, MenuItem, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const AdminUsersPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // User detail dialog
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchUsers(1)
  }, [statusFilter])

  const fetchUsers = async (page) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 20)
      params.set('sort_by', 'created_at')
      params.set('sort_order', 'desc')
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await axiosInstance.get(`/admin/users?${params.toString()}`)
      setUsers(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchUsers(1)
  }

  const handleBanUser = async (userId, ban = true) => {
    try {
      setActionLoading(true)
      await axiosInstance.post(`/admin/users/${userId}/${ban ? 'ban' : 'unban'}`)
      setSuccess(ban ? 'User banned successfully' : 'User unbanned successfully')
      fetchUsers(meta.page)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2
        }}>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary
          }}>
            Users
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>
            {meta.total} total users
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{
          p: 2, borderRadius: 3, mb: 2,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center'
        }}>
          <TextField
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{
              flex: 1, minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch} size="small" sx={{ color: COLORS.primary }}>
                  <SearchIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              )
            }}
          />
          <TextField
            select label="Status" size="small" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Users Table */}
        <Paper sx={{
          borderRadius: 3, overflow: 'hidden',
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          {loading ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={50} />)}
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: COLORS.textSecondary }}>
                No users found
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>User</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Email</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Balance</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Level</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Joined</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} sx={{
                      '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }
                    }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            bgcolor: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: COLORS.primary, fontWeight: 700, fontSize: '0.8rem'
                          }}>
                            {u.username?.[0]?.toUpperCase() || 'U'}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary }}>
                              {u.username}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                              #{u.public_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.82rem' }}>
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.primary }}>
                          {formatPoints(u.balance?.available || 0)} pts
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={`Lvl ${u.level_id || 1}`} sx={{
                          bgcolor: `${COLORS.gold}12`, color: COLORS.gold,
                          fontWeight: 700, fontSize: '0.65rem'
                        }} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={u.status || 'active'} sx={{
                          bgcolor: u.status === 'banned' ? '#fee2e2' : '#d1fae5',
                          color: u.status === 'banned' ? '#dc2626' : '#059669',
                          fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                        }} />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => {
                            setSelectedUser(u)
                            setDetailOpen(true)
                          }} sx={{ color: COLORS.primary }}>
                            <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleBanUser(u.id, u.status !== 'banned')}
                            disabled={actionLoading}
                            sx={{ color: u.status === 'banned' ? '#10b981' : '#ef4444' }}
                          >
                            {u.status === 'banned'
                              ? <CheckCircleIcon sx={{ fontSize: '1.1rem' }} />
                              : <BlockIcon sx={{ fontSize: '1.1rem' }} />
                            }
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={(_, page) => fetchUsers(page)}
                color="primary"
                size="small"
                sx={{ '& .MuiPaginationItem-root': { color: COLORS.textSecondary } }}
              />
            </Box>
          )}
        </Paper>

        {/* User Detail Dialog */}
        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            User Details
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: '50%',
                    bgcolor: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: COLORS.primary, fontWeight: 800, fontSize: '1.3rem'
                  }}>
                    {selectedUser.username?.[0]?.toUpperCase() || 'U'}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.textPrimary }}>
                      {selectedUser.username}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2
                }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>Available Balance</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.primary }}>
                      {formatPoints(selectedUser.balance?.available || 0)} pts
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>Locked Balance</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.gold }}>
                      {formatPoints(selectedUser.balance?.locked || 0)} pts
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>Level</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.textPrimary }}>
                      {selectedUser.level_id || 1}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>Referral Code</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary, fontFamily: 'monospace' }}>
                      {selectedUser.referral_code || 'N/A'}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
                    Member since: {formatDate(selectedUser.created_at)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
                    Last login: {formatDate(selectedUser.last_login_at)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
                    Country: {selectedUser.country || 'Not set'}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDetailOpen(false)} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600
            }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminUsersPage