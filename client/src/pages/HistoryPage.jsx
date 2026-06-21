// ============================================================
// HistoryPage.jsx — Transaction History with Filters
// ============================================================
import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Pagination,
  TextField, MenuItem, useTheme, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip
} from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'
import FilterListIcon from '@mui/icons-material/FilterList'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const TYPE_COLORS = {
  credit: { bg: '#d1fae5', color: '#059669', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  debit: { bg: '#fee2e2', color: '#dc2626', icon: <TrendingDownIcon sx={{ fontSize: '0.9rem' }} /> },
  survey_completion: { bg: '#dbeafe', color: '#2563eb', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  referral_bonus: { bg: '#fce7f3', color: '#db2777', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  withdrawal: { bg: '#fef3c7', color: '#d97706', icon: <TrendingDownIcon sx={{ fontSize: '0.9rem' }} /> },
  streak_bonus: { bg: '#ede9fe', color: '#7c3aed', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
  level_bonus: { bg: '#cffafe', color: '#0891b2', icon: <TrendingUpIcon sx={{ fontSize: '0.9rem' }} /> },
}

const STATUS_COLORS = {
  completed: { bg: '#d1fae5', color: '#059669' },
  pending: { bg: '#fef3c7', color: '#d97706' },
  failed: { bg: '#fee2e2', color: '#dc2626' },
  reversed: { bg: '#f3f4f6', color: '#6b7280' },
}

const TRANSACTION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'survey_completion', label: 'Survey Completion' },
  { value: 'referral_bonus', label: 'Referral Bonus' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'streak_bonus', label: 'Streak Bonus' },
  { value: 'level_bonus', label: 'Level Bonus' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
]

const TRANSACTION_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'reversed', label: 'Reversed' },
]

const HistoryPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTransactions(1)
  }, [filters.type, filters.status, filters.date_from, filters.date_to, filters.sort_by, filters.sort_order])

  const fetchTransactions = async (page) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 20)
      params.set('sort_by', filters.sort_by)
      params.set('sort_order', filters.sort_order)
      if (filters.type) params.set('type', filters.type)
      if (filters.status) params.set('status', filters.status)
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)

      const res = await axiosInstance.get(`/transactions/?${params.toString()}`)
      setTransactions(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const formatDollar = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return `$${parseFloat(val).toFixed(2)}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getTypeConfig = (type) => TYPE_COLORS[type] || TYPE_COLORS.credit

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1
        }}>
          <Box>
            <Typography sx={{
              fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5
            }}>
              History
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
              {meta.total > 0 ? `${meta.total} transactions found` : 'Your earning and withdrawal history'}
            </Typography>
          </Box>
          <IconButton onClick={() => setShowFilters(!showFilters)} sx={{
            color: COLORS.primary,
            bgcolor: `${COLORS.primary}08`,
            '&:hover': { bgcolor: `${COLORS.primary}15` }
          }}>
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Paper sx={{
            p: 2.5, borderRadius: 3, mb: 3,
            bgcolor: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
          }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2
            }}>
              <TextField
                select label="Type" size="small" value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              >
                {TRANSACTION_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>

              <TextField
                select label="Status" size="small" value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              >
                {TRANSACTION_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>

              <TextField
                label="From Date" type="date" size="small" value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />

              <TextField
                label="To Date" type="date" size="small" value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Box>
          </Paper>
        )}

        {/* Transactions */}
        <Paper sx={{
          p: { xs: 2, md: 3 }, borderRadius: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant="rounded" height={70} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: COLORS.danger }}>{error}</Typography>
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <HistoryIcon sx={{ fontSize: '3rem', color: COLORS.textMuted, mb: 1 }} />
              <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                No transactions yet
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.85rem', mt: 0.5 }}>
                Complete surveys and offers to see your earnings here
              </Typography>
            </Box>
          ) : isMobile ? (
            // Mobile card view
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {transactions.map((tx) => {
                const typeConfig = getTypeConfig(tx.type)
                const isPositive = tx.amount > 0
                return (
                  <Paper key={tx.id} sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${COLORS.border}`,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 32, height: 32, borderRadius: 1.5,
                          bgcolor: typeConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: typeConfig.color
                        }}>
                          {typeConfig.icon}
                        </Box>
                        <Box>
                          <Typography sx={{
                            fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary,
                            textTransform: 'capitalize'
                          }}>
                            {tx.type?.replace(/_/g, ' ')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                            {formatDate(tx.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{
                        fontWeight: 800, fontSize: '1.1rem',
                        color: isPositive ? '#10b981' : '#ef4444'
                      }}>
                        {isPositive ? '+' : ''}{formatPoints(tx.amount)}
                      </Typography>
                    </Box>
                    {tx.description && (
                      <Typography sx={{
                        fontSize: '0.8rem', color: COLORS.textSecondary, mb: 1
                      }}>
                        {tx.description}
                      </Typography>
                    )}
                    <Chip size="small" label={tx.status} sx={{
                      bgcolor: STATUS_COLORS[tx.status]?.bg || '#f3f4f6',
                      color: STATUS_COLORS[tx.status]?.color || '#6b7280',
                      fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                    }} />
                  </Paper>
                )
              })}
            </Box>
          ) : (
            // Desktop table view
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Type</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Description</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }} align="right">Amount</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => {
                    const typeConfig = getTypeConfig(tx.type)
                    const isPositive = tx.amount > 0
                    return (
                      <TableRow key={tx.id} sx={{
                        '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }
                      }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 28, height: 28, borderRadius: 1.2,
                              bgcolor: typeConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: typeConfig.color
                            }}>
                              {typeConfig.icon}
                            </Box>
                            <Typography sx={{
                              fontWeight: 600, fontSize: '0.85rem', color: COLORS.textPrimary,
                              textTransform: 'capitalize'
                            }}>
                              {tx.type?.replace(/_/g, ' ')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.82rem', maxWidth: 300 }}>
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{
                            fontWeight: 800, fontSize: '0.95rem',
                            color: isPositive ? '#10b981' : '#ef4444'
                          }}>
                            {isPositive ? '+' : ''}{formatPoints(tx.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={tx.status} sx={{
                            bgcolor: STATUS_COLORS[tx.status]?.bg || '#f3f4f6',
                            color: STATUS_COLORS[tx.status]?.color || '#6b7280',
                            fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                          }} />
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
    </PageWrapper>
  )
}

export default HistoryPage