import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  TextField, MenuItem, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SendIcon from '@mui/icons-material/Send'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const STATUS_CONFIG = {
  open: { bg: '#dbeafe', color: '#2563eb' },
  in_progress: { bg: '#fef3c7', color: '#d97706' },
  resolved: { bg: '#d1fae5', color: '#059669' },
  closed: { bg: '#f3f4f6', color: '#6b7280' },
}

const AdminTicketsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [tickets, setTickets] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('open')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [response, setResponse] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchTickets(1) }, [statusFilter])

  const fetchTickets = async (page) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 20)
      params.set('sort_by', 'created_at')
      params.set('sort_order', 'desc')
      if (statusFilter) params.set('status', statusFilter)

      const res = await axiosInstance.get(`/admin/tickets?${params.toString()}`)
      setTickets(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!response.trim()) {
      setError('Response cannot be empty')
      return
    }
    try {
      setActionLoading(true)
      await axiosInstance.post(`/admin/tickets/${selectedTicket.id}/respond`, {
        admin_response: response.trim(),
        status: 'resolved'
      })
      setSuccess('Response sent successfully')
      setResponse('')
      fetchTickets(meta.page)
      setDetailOpen(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send response')
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

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>
            Support Tickets
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
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
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
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: COLORS.textSecondary }}>No tickets found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>ID</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Subject</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Category</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>User</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Date</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                      <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.82rem' }}>#{t.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary }}>
                          {t.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={t.category?.replace(/_/g, ' ')} sx={{
                          bgcolor: `${COLORS.primary}08`, color: COLORS.primary,
                          fontWeight: 600, fontSize: '0.65rem', textTransform: 'capitalize',
                        }} />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.82rem' }}>
                        {t.user?.username || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={t.status?.replace(/_/g, ' ')} sx={{
                          bgcolor: STATUS_CONFIG[t.status]?.bg || '#f3f4f6',
                          color: STATUS_CONFIG[t.status]?.color || '#6b7280',
                          fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                        }} />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {formatDate(t.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => {
                          setSelectedTicket(t)
                          setResponse(t.admin_response || '')
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
                onChange={(_, page) => fetchTickets(page)}
                color="primary"
                size="small"
                sx={{ '& .MuiPaginationItem-root': { color: COLORS.textSecondary } }}
              />
            </Box>
          )}
        </Paper>

        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            Ticket #{selectedTicket?.id}
          </DialogTitle>
          <DialogContent>
            {selectedTicket && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary }}>
                    {selectedTicket.subject}
                  </Typography>
                  <Chip size="small" label={selectedTicket.status?.replace(/_/g, ' ')} sx={{
                    bgcolor: STATUS_CONFIG[selectedTicket.status]?.bg || '#f3f4f6',
                    color: STATUS_CONFIG[selectedTicket.status]?.color || '#6b7280',
                    fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                  }} />
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${COLORS.border}` }}>
                  <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 0.5 }}>From: {selectedTicket.user?.username} ({selectedTicket.user?.email})</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mb: 1 }}>Category: {selectedTicket.category?.replace(/_/g, ' ')}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6 }}>
                    {selectedTicket.message}
                  </Typography>
                </Box>

                {selectedTicket.image_url && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary, mb: 1 }}>Attachment</Typography>
                    <Box component="img" src={selectedTicket.image_url} alt="Attachment" sx={{
                      maxWidth: '100%', maxHeight: 300, borderRadius: 2, border: `1px solid ${COLORS.border}`
                    }} />
                  </Box>
                )}

                {selectedTicket.admin_response && (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${COLORS.primary}06`, border: `1px solid ${COLORS.primary}15` }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.primary, mb: 0.5 }}>Previous Response</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6 }}>
                      {selectedTicket.admin_response}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 0.5 }}>
                      Responded on {formatDate(selectedTicket.responded_at)}
                    </Typography>
                  </Box>
                )}

                {selectedTicket.status !== 'closed' && (
                  <TextField
                    label="Your Response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    multiline rows={4}
                    fullWidth
                    placeholder="Type your response to the user..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDetailOpen(false)} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600
            }}>
              Close
            </Button>
            {selectedTicket?.status !== 'closed' && (
              <Button
                onClick={handleRespond}
                disabled={actionLoading || !response.trim()}
                variant="contained"
                startIcon={actionLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{
                  bgcolor: COLORS.primary, color: '#fff', textTransform: 'none', fontWeight: 700,
                  borderRadius: 2, '&:hover': { bgcolor: COLORS.primaryDark }
                }}
              >
                Send Response
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminTicketsPage