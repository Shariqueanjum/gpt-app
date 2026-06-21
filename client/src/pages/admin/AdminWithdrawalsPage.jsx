import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  TextField, MenuItem, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const STATUS_CONFIG = {
  pending: { bg: '#fef3c7', color: '#d97706' },
  approved: { bg: '#d1fae5', color: '#059669' },
  rejected: { bg: '#fee2e2', color: '#dc2626' },
  completed: { bg: '#dbeafe', color: '#2563eb' },
}

const AdminWithdrawalsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [withdrawals, setWithdrawals] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchWithdrawals(1) }, [statusFilter])

  const fetchWithdrawals = async (page) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 20)
      params.set('sort_by', 'created_at')
      params.set('sort_order', 'desc')
      if (statusFilter) params.set('status', statusFilter)

      const res = await axiosInstance.get(`/admin/withdrawals?${params.toString()}`)
      setWithdrawals(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      setActionLoading(true)
      await axiosInstance.post(`/admin/withdrawals/${id}/${action}`)
      setSuccess(`Withdrawal ${action}d successfully`)
      fetchWithdrawals(meta.page)
      setDetailOpen(false)
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
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>
            Withdrawals
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>
            {meta.total} total
          </Typography>
        </Box>

        <Paper sx={{
          p: 2, borderRadius: 3, mb: 2,
          bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
          display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center'
        }}>
          <TextField
            select label="Status" size="small" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 160,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
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

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
          {loading ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={50} />)}
            </Box>
          ) : withdrawals.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: COLORS.textSecondary }}>No withdrawals found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>User</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Amount</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Method</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Date</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            bgcolor: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: COLORS.primary, fontWeight: 700, fontSize: '0.8rem'
                          }}>
                            {w.user?.username?.[0]?.toUpperCase() || 'U'}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary }}>
                              {w.user?.username || 'Unknown'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                              #{w.user?.public_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.primary }}>
                          {formatPoints(w.amount)} pts
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.82rem' }}>
                        {w.method_name || w.method_code}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={w.status} sx={{
                          bgcolor: STATUS_CONFIG[w.status]?.bg || '#f3f4f6',
                          color: STATUS_CONFIG[w.status]?.color || '#6b7280',
                          fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                        }} />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {formatDate(w.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => {
                          setSelectedWithdrawal(w)
                          setDetailOpen(true)
                        }} sx={{ color: COLORS.primary }}>
                          <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
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
                onChange={(_, page) => fetchWithdrawals(page)}
                color="primary"
                size="small"
                sx={{ '& .MuiPaginationItem-root': { color: COLORS.textSecondary } }}
              />
            </Box>
          )}
        </Paper>

        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            Withdrawal Details
          </DialogTitle>
          <DialogContent>
            {selectedWithdrawal && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>Amount</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS.primary }}>{formatPoints(selectedWithdrawal.amount)} pts</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>Status</Typography>
                    <Chip size="small" label={selectedWithdrawal.status} sx={{
                      bgcolor: STATUS_CONFIG[selectedWithdrawal.status]?.bg || '#f3f4f6',
                      color: STATUS_CONFIG[selectedWithdrawal.status]?.color || '#6b7280',
                      fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                    }} />
                  </Paper>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary, mb: 1 }}>Payment Details</Typography>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                    {selectedWithdrawal.method_details && Object.entries(selectedWithdrawal.method_details).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: COLORS.textPrimary, fontWeight: 600 }}>{value}</Typography>
                      </Box>
                    ))}
                  </Paper>
                </Box>

                {selectedWithdrawal.payment_proof_url && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary, mb: 1 }}>Payment Proof</Typography>
                    <Box component="img" src={selectedWithdrawal.payment_proof_url} alt="Payment Proof" sx={{
                      maxWidth: '100%', maxHeight: 400, borderRadius: 2, border: `1px solid ${COLORS.border}`, cursor: 'pointer'
                    }} onClick={() => window.open(selectedWithdrawal.payment_proof_url, '_blank')} />
                  </Box>
                )}

                <Box>
                  <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>Requested: {formatDate(selectedWithdrawal.created_at)}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>User: {selectedWithdrawal.user?.username} ({selectedWithdrawal.user?.email})</Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            {selectedWithdrawal?.status === 'pending' && (
              <>
                <Button onClick={() => handleAction(selectedWithdrawal.id, 'reject')} disabled={actionLoading} sx={{
                  color: '#ef4444', textTransform: 'none', fontWeight: 700
                }}>
                  {actionLoading ? <CircularProgress size={16} /> : 'Reject'}
                </Button>
                <Button onClick={() => handleAction(selectedWithdrawal.id, 'approve')} disabled={actionLoading} variant="contained" sx={{
                  bgcolor: '#10b981', color: '#fff', textTransform: 'none', fontWeight: 700,
                  borderRadius: 2, '&:hover': { bgcolor: '#059669' }
                }}>
                  {actionLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Approve'}
                </Button>
              </>
            )}
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

export default AdminWithdrawalsPage