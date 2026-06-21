// ============================================================
// WithdrawPage.jsx — Request Withdrawals + View History
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, Divider, useTheme, useMediaQuery, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Pagination
} from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PendingIcon from '@mui/icons-material/Pending'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const STATUS_ICONS = {
  pending: <PendingIcon sx={{ fontSize: '1rem', color: '#f59e0b' }} />,
  approved: <CheckCircleIcon sx={{ fontSize: '1rem', color: '#10b981' }} />,
  completed: <CheckCircleIcon sx={{ fontSize: '1rem', color: '#10b981' }} />,
  rejected: <CancelIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />,
  cancelled: <CancelIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />,
}

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#d97706' },
  approved: { bg: '#d1fae5', color: '#059669' },
  completed: { bg: '#d1fae5', color: '#059669' },
  rejected: { bg: '#fee2e2', color: '#dc2626' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
}

const WithdrawPage = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [paymentMethods, setPaymentMethods] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form state
  const [selectedMethod, setSelectedMethod] = useState('')
  const [amount, setAmount] = useState('')
  const [methodDetails, setMethodDetails] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Fetch data
  useEffect(() => {
    fetchPaymentMethods()
    fetchWithdrawals(1)
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const res = await axiosInstance.get('/payment-methods/')
      setPaymentMethods(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch payment methods:', err)
    }
  }

  const fetchWithdrawals = async (page) => {
    try {
      setLoading(true)
      const res = await axiosInstance.get(`/withdrawals/?page=${page}&limit=10`)
      setWithdrawals(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const handleMethodChange = (methodCode) => {
    setSelectedMethod(methodCode)
    const method = paymentMethods.find(m => m.code === methodCode)
    if (method?.required_fields) {
      const initial = {}
      method.required_fields.forEach(field => {
        initial[field.name] = ''
      })
      setMethodDetails(initial)
    } else {
      setMethodDetails({})
    }
  }

  const handleSubmit = async () => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) {
      setError('Please fill all fields correctly')
      return
    }

    // Validate method details
    const method = paymentMethods.find(m => m.code === selectedMethod)
    if (method?.required_fields) {
      for (const field of method.required_fields) {
        if (!methodDetails[field.name]?.trim()) {
          setError(`${field.label} is required`)
          return
        }
      }
    }

    setConfirmOpen(true)
  }

  const confirmWithdrawal = async () => {
    try {
      setSubmitting(true)
      setError(null)

      await axiosInstance.post('/withdrawals/', {
        amount: parseFloat(amount),
        method_code: selectedMethod,
        method_details: methodDetails,
      })

      setSuccess('Withdrawal request submitted successfully!')
      setAmount('')
      setSelectedMethod('')
      setMethodDetails({})
      setConfirmOpen(false)
      fetchWithdrawals(1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal')
    } finally {
      setSubmitting(false)
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

  const selectedMethodObj = paymentMethods.find(m => m.code === selectedMethod)

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5
          }}>
            Withdraw
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Request a payout from your earnings
          </Typography>
        </Box>

        {/* Balance Card */}
        <Paper sx={{
          p: 3, borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.primary
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>
                Available Balance
              </Typography>
              <Typography sx={{
                fontWeight: 800, fontSize: '1.8rem', color: COLORS.primary
              }}>
                {formatPoints(user?.balance?.available || 0)} pts
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
                ≈ ${((user?.balance?.available || 0) / 100).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {user?.balance?.locked > 0 && (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
              <strong>{formatPoints(user.balance.locked)} pts</strong> are currently locked and pending clearance.
            </Alert>
          )}
        </Paper>

        {/* Withdrawal Form */}
        <Paper sx={{
          p: 3, borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          <Typography sx={{
            fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary, mb: 2
          }}>
            Request Withdrawal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select
              label="Payment Method"
              value={selectedMethod}
              onChange={(e) => handleMethodChange(e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                }
              }}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.code} value={method.code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {method.name}
                    {method.min_amount > 0 && (
                      <Chip size="small" label={`Min: ${method.min_amount} pts`} sx={{
                        fontSize: '0.65rem', height: 20, bgcolor: `${COLORS.primary}10`, color: COLORS.primary
                      }} />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount (points)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              size="small"
              placeholder="Enter amount in points"
              helperText={selectedMethodObj ? `Minimum: ${selectedMethodObj.min_amount || 0} pts | Fee: ${selectedMethodObj.fee || 0} pts` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                }
              }}
            />

            {/* Dynamic method detail fields */}
            {selectedMethodObj?.required_fields?.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                value={methodDetails[field.name] || ''}
                onChange={(e) => setMethodDetails(prev => ({ ...prev, [field.name]: e.target.value }))}
                fullWidth
                size="small"
                placeholder={field.placeholder || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            ))}

            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedMethod || !amount}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: COLORS.primary, color: '#fff',
                fontWeight: 700, textTransform: 'none',
                borderRadius: 2, py: 1.2,
                fontSize: '0.95rem',
                '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.textMuted, color: '#fff' },
                boxShadow: 'none',
              }}
            >
              {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Request Withdrawal'}
            </Button>
          </Box>
        </Paper>

        {/* Withdrawal History */}
        <Paper sx={{
          p: 3, borderRadius: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          <Typography sx={{
            fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary, mb: 2
          }}>
            Withdrawal History
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />)}
            </Box>
          ) : withdrawals.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: COLORS.textSecondary }}>
                No withdrawals yet. Start earning and request your first payout!
              </Typography>
            </Box>
          ) : isMobile ? (
            // Mobile card view
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {withdrawals.map((w) => (
                <Paper key={w.id} sx={{
                  p: 2, borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `1px solid ${COLORS.border}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                      {formatPoints(w.amount)} pts
                    </Typography>
                    <Chip
                      size="small"
                      icon={STATUS_ICONS[w.status] || null}
                      label={w.status}
                      sx={{
                        bgcolor: STATUS_COLORS[w.status]?.bg || '#f3f4f6',
                        color: STATUS_COLORS[w.status]?.color || '#6b7280',
                        fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                    {w.method_name || w.method_code} · {formatDate(w.created_at)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            // Desktop table view
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Amount</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Method</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.78rem' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id} sx={{
                      '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }
                    }}>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
                        {formatPoints(w.amount)} pts
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.85rem' }}>
                        {w.method_name || w.method_code}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={STATUS_ICONS[w.status] || null}
                          label={w.status}
                          sx={{
                            bgcolor: STATUS_COLORS[w.status]?.bg || '#f3f4f6',
                            color: STATUS_COLORS[w.status]?.color || '#6b7280',
                            fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.82rem' }}>
                        {formatDate(w.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            Confirm Withdrawal
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: COLORS.textSecondary, mb: 2 }}>
              You are about to withdraw <strong>{formatPoints(parseFloat(amount || 0))} pts</strong> via{' '}
              <strong>{selectedMethodObj?.name || selectedMethod}</strong>.
            </Typography>
            <Typography sx={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
              This request will be reviewed by our team. Processing time varies by method.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600
            }}>
              Cancel
            </Button>
            <Button onClick={confirmWithdrawal} disabled={submitting} variant="contained" sx={{
              bgcolor: COLORS.primary, color: '#fff', textTransform: 'none', fontWeight: 700,
              borderRadius: 2, '&:hover': { bgcolor: COLORS.primaryDark }
            }}>
              {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}

export default WithdrawPage