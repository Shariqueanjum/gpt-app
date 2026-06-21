import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const TYPE_COLORS = {
  credit: { bg: '#d1fae5', color: '#059669', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  debit: { bg: '#fee2e2', color: '#dc2626', icon: <TrendingDownIcon sx={{ fontSize: '0.9rem' }} /> },
  survey_completion: { bg: '#dbeafe', color: '#2563eb', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  referral_bonus: { bg: '#fce7f3', color: '#db2777', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  withdrawal: { bg: '#fef3c7', color: '#d97706', icon: <TrendingDownIcon sx={{ fontSize: '0.9rem' }} /> },
  streak_bonus: { bg: '#ede9fe', color: '#7c3aed', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  level_bonus: { bg: '#cffafe', color: '#0891b2', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
}

const AdminTransactionsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => { fetchTransactions(1) }, [typeFilter])

  const fetchTransactions = async (page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 30)
      params.set('sort_by', 'created_at')
      params.set('sort_order', 'desc')
      if (typeFilter) params.set('type', typeFilter)

      const res = await axiosInstance.get(`/transactions?${params.toString()}`)
      setTransactions(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getTypeConfig = (type) => TYPE_COLORS[type] || TYPE_COLORS.credit

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>
            Transactions
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
            select label="Type" size="small" value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="survey_completion">Survey Completion</MenuItem>
            <MenuItem value="referral_bonus">Referral Bonus</MenuItem>
            <MenuItem value="withdrawal">Withdrawal</MenuItem>
            <MenuItem value="streak_bonus">Streak Bonus</MenuItem>
            <MenuItem value="level_bonus">Level Bonus</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="debit">Debit</MenuItem>
          </TextField>
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
          {loading ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={50} />)}
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: COLORS.textSecondary }}>No transactions found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>ID</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>User</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Type</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Description</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }} align="right">Amount</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.75rem' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => {
                    const typeConfig = getTypeConfig(tx.type)
                    const isPositive = tx.amount > 0
                    return (
                      <TableRow key={tx.id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                        <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.78rem' }}>#{tx.id}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textPrimary }}>
                            {tx.user?.username || 'System'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 24, height: 24, borderRadius: 1,
                              bgcolor: typeConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: typeConfig.color
                            }}>
                              {typeConfig.icon}
                            </Box>
                            <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, textTransform: 'capitalize' }}>
                              {tx.type?.replace(/_/g, ' ')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.78rem', maxWidth: 250 }}>
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{
                            fontWeight: 700, fontSize: '0.9rem',
                            color: isPositive ? '#10b981' : '#ef4444'
                          }}>
                            {isPositive ? '+' : ''}{formatPoints(tx.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={tx.status} sx={{
                            bgcolor: tx.status === 'completed' ? '#d1fae5' : tx.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#dc2626',
                            fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                          }} />
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {formatDate(tx.created_at)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={(_, page) => fetchTransactions(page)}
                color="primary"
                size="small"
                sx={{ '& .MuiPaginationItem-root': { color: COLORS.textSecondary } }}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminTransactionsPage