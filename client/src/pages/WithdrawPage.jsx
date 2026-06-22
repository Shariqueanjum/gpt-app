// ============================================================
// WithdrawPage.jsx — Final v4: Points Primary, Dollar Secondary, Net Value
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, useTheme, useMediaQuery, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Pagination, Tooltip, Fade
} from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PendingIcon from '@mui/icons-material/Pending'
import PaymentsIcon from '@mui/icons-material/Payments'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'
import { fetchCurrentUser } from '../slices/authSlice'

// ─── Status helpers ────────────────────────────────────────
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

// ─── Frontend hardcoded required fields (must match backend) ─
const REQUIRED_FIELDS = {
  upi: [
    { name: 'upi_id', label: 'UPI ID', placeholder: 'name@upi' }
  ],
  bank: [
    { name: 'account_holder_name', label: 'Account Holder Name', placeholder: 'Full name as per bank' },
    { name: 'account_number', label: 'Account Number', placeholder: 'Enter account number' },
    { name: 'ifsc_code', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
    { name: 'bank_name', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
  ],
  paypal: [
    { name: 'paypal_email', label: 'PayPal Email', placeholder: 'your@email.com' }
  ],
  paytm: [
    { name: 'paytm_number', label: 'Paytm Number', placeholder: '10-digit mobile number' }
  ],
  amazon_pay: [
    { name: 'amazon_pay_number', label: 'Amazon Pay Number', placeholder: '10-digit mobile number' }
  ],
}

// ─── Method name map ───────────────────────────────────────
const METHOD_NAMES = {
  upi: 'UPI',
  bank: 'Bank Transfer',
  paypal: 'PayPal',
  paytm: 'Paytm',
  amazon_pay: 'Amazon Pay',
}

// ─── Helpers ───────────────────────────────────────────────
const ptsToUsd = (pts) => ((pts || 0) / 100).toFixed(2)
const usdToPts = (usd) => Math.round((parseFloat(usd) || 0) * 100)

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })
}

// ─── Component ─────────────────────────────────────────────
const WithdrawPage = ({ darkMode, toggleDarkMode }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  const [paymentMethods, setPaymentMethods] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form state — amount in DOLLARS (user-facing)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [amount, setAmount] = useState('')
  const [methodDetails, setMethodDetails] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  // ─── Fetch everything on mount ───────────────────────────
  useEffect(() => {
    dispatch(fetchCurrentUser())
    fetchPaymentMethods()
    fetchWithdrawals(1)
  }, [dispatch])

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
    const fields = REQUIRED_FIELDS[methodCode]
    if (fields && fields.length > 0) {
      const initial = {}
      fields.forEach(f => { initial[f.name] = '' })
      setMethodDetails(initial)
    } else {
      setMethodDetails({})
    }
  }

  const handleSubmit = () => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) {
      setError('Please fill all fields correctly')
      return
    }

    const fields = REQUIRED_FIELDS[selectedMethod]
    if (fields && fields.length > 0) {
      for (const field of fields) {
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
        amount: usdToPts(amount),
        method_code: selectedMethod,
        method_details: methodDetails,
      })

      setSuccess('Withdrawal request submitted successfully!')
      setAmount('')
      setSelectedMethod('')
      setMethodDetails({})
      setConfirmOpen(false)
      fetchWithdrawals(1)
      dispatch(fetchCurrentUser())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMethodObj = paymentMethods.find(m => m.code === selectedMethod)
  const requiredFields = REQUIRED_FIELDS[selectedMethod] || []

  // ─── Net value calculation ───────────────────────────────
  const amountPts = amount ? usdToPts(amount) : 0
  const feePts = selectedMethodObj ? (selectedMethodObj.processing_fee || 0) : 0
  const feeUsd = ptsToUsd(feePts)
  const netPts = Math.max(0, amountPts - feePts)
  const netUsd = ptsToUsd(netPts)

  // ─── Render ──────────────────────────────────────────────
  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 960, mx: 'auto', px: isMobile ? 2 : 0 }}>

        {/* HEADING */}
        <Box sx={{ mb: 3, mt: isMobile ? 1 : 0 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: isMobile ? '1.3rem' : '1.6rem',
            color: COLORS.textPrimary, mb: 0.5, letterSpacing: '-0.02em'
          }}>
            Cash Out Your Earnings
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Convert your points into real money — fast and secure
          </Typography>
        </Box>

        {/* ═══════════════════════════════════════════════════════
            BALANCE CARD — Points Primary, Dollar Secondary
        ═══════════════════════════════════════════════════════ */}
        <Paper sx={{
          p: isMobile ? 2.5 : 3.5,
          borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.accent})`,
            borderRadius: '3px 3px 0 0'
          }} />

          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 2.5 : 4,
          }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 2.5,
              bgcolor: darkMode ? 'rgba(83,18,188,0.15)' : 'rgba(83,18,188,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.primary, flexShrink: 0,
              boxShadow: darkMode
                ? '0 0 20px rgba(83,18,188,0.15)'
                : '0 0 20px rgba(83,18,188,0.08)',
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: '1.8rem' }} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{
                fontSize: '0.8rem', color: COLORS.textSecondary,
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5
              }}>
                Available Balance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
                {/* PRIMARY: Points */}
                <Typography sx={{
                  fontWeight: 800, fontSize: isMobile ? '2rem' : '2.4rem',
                  color: COLORS.textPrimary, lineHeight: 1.1
                }}>
                  {Math.floor(user?.balance_available || 0).toLocaleString()}
                  <Typography component="span" sx={{
                    fontSize: '0.85rem', color: COLORS.textMuted, fontWeight: 600, ml: 0.8
                  }}>
                    pts
                  </Typography>
                </Typography>
                {/* SECONDARY: Dollar value */}
                <Box sx={{
                  px: 1.5, py: 0.4, borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${darkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`,
                }}>
                  <Typography sx={{
                    fontSize: '0.85rem', fontWeight: 700, color: COLORS.accent
                  }}>
                    ≈ ${ptsToUsd(user?.balance_available)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* MAIN: Form + History */}
        <Box sx={{
          display: 'flex',
          flexDirection: isTablet ? 'column' : 'row',
          gap: 3,
        }}>

          {/* LEFT: Withdrawal Form */}
          <Box sx={{ flex: isTablet ? 1 : '0 0 420px' }}>
            <Paper sx={{
              p: isMobile ? 2.5 : 3,
              borderRadius: 3,
              bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              position: 'sticky', top: 24,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2,
                  bgcolor: `${COLORS.primary}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: COLORS.primary,
                }}>
                  <PaymentsIcon sx={{ fontSize: '1.1rem' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary }}>
                  Request Payout
                </Typography>
              </Box>

              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }}
                    onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </Fade>
              )}
              {success && (
                <Fade in>
                  <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }}
                    onClose={() => setSuccess(null)}>
                    {success}
                  </Alert>
                </Fade>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>

                {/* Payment Method */}
                <Box>
                  <Typography sx={{
                    fontSize: '0.75rem', color: COLORS.textMuted,
                    fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>
                    Payment Method <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
                  </Typography>
                  <TextField
                    select
                    value={selectedMethod}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Choose a method"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        fontSize: '0.9rem', fontWeight: 600, color: COLORS.textPrimary,
                      },
                    }}
                  >
                    {paymentMethods.length === 0 ? (
                      <MenuItem disabled>No methods available</MenuItem>
                    ) : (
                      paymentMethods.map((method) => (
                        <MenuItem key={method.code} value={method.code} sx={{ fontSize: '0.9rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Box sx={{
                              width: 28, height: 28, borderRadius: 1.2,
                              bgcolor: `${COLORS.primary}10`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: COLORS.primary, fontSize: '0.7rem', fontWeight: 700
                            }}>
                              {method.name.charAt(0)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {method.name}
                              </Typography>
                            </Box>
                            {method.min_amount > 0 && (
                              <Chip size="small" label={`Min $${ptsToUsd(method.min_amount)}`} sx={{
                                fontSize: '0.6rem', height: 20,
                                bgcolor: `${COLORS.primary}10`, color: COLORS.primary, fontWeight: 700
                              }} />
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>

                {/* Amount in DOLLARS */}
                <Box>
                  <Typography sx={{
                    fontSize: '0.75rem', color: COLORS.textMuted,
                    fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>
                    Amount ($) <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
                  </Typography>
                  <TextField
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Enter amount in dollars"
                    inputProps={{ step: '0.01', min: 0 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        fontSize: '0.9rem', fontWeight: 600, color: COLORS.textPrimary,
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                      {selectedMethodObj
                        ? `Min: $${ptsToUsd(selectedMethodObj.min_amount)} · Fee: $${ptsToUsd(selectedMethodObj.processing_fee)}`
                        : 'Select a payment method to see requirements'}
                    </Typography>
                    {amount && parseFloat(amount) > 0 && (
                      <Typography sx={{ fontSize: '0.75rem', color: COLORS.primary, fontWeight: 700 }}>
                        ≈ {usdToPts(amount).toLocaleString()} pts
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* NET VALUE BREAKDOWN */}
                {amount && parseFloat(amount) > 0 && selectedMethodObj && (
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)',
                    border: `1px solid ${darkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'}`,
                  }}>
                    <Typography sx={{
                      fontSize: '0.75rem', color: COLORS.accent,
                      fontWeight: 700, mb: 1.2, textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                      You Will Receive
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                        Requested
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: COLORS.textPrimary, fontWeight: 600 }}>
                        ${parseFloat(amount).toFixed(2)}
                      </Typography>
                    </Box>
                    {feePts > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                          Processing Fee
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: COLORS.danger, fontWeight: 600 }}>
                          -${feeUsd}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{
                      display: 'flex', justifyContent: 'space-between',
                      pt: 1, mt: 0.5,
                      borderTop: `1px dashed ${COLORS.border}`,
                    }}>
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textPrimary, fontWeight: 700 }}>
                        Net Amount
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', color: COLORS.accent, fontWeight: 800 }}>
                        ${netUsd}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.8 }}>
                      ≈ {netPts.toLocaleString()} pts after fee deduction
                    </Typography>
                  </Box>
                )}

                {/* REQUIRED FIELDS */}
                {selectedMethod && requiredFields.length > 0 && (
                  <Box sx={{
                    p: 2.5, borderRadius: 2.5,
                    bgcolor: darkMode ? 'rgba(83,18,188,0.08)' : 'rgba(83,18,188,0.04)',
                    border: `1px solid ${darkMode ? 'rgba(83,18,188,0.2)' : 'rgba(83,18,188,0.12)'}`,
                    borderLeft: `4px solid ${COLORS.primary}`,
                  }}>
                    <Typography sx={{
                      fontSize: '0.8rem', color: COLORS.primary,
                      fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                      Required Details for {selectedMethodObj?.name || METHOD_NAMES[selectedMethod]}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                      {requiredFields.map((field) => (
                        <Box key={field.name}>
                          <Typography sx={{
                            fontSize: '0.8rem', color: COLORS.textSecondary,
                            fontWeight: 600, mb: 0.6
                          }}>
                            {field.label} <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
                          </Typography>
                          <TextField
                            value={methodDetails[field.name] || ''}
                            onChange={(e) => setMethodDetails(prev => ({ ...prev, [field.name]: e.target.value }))}
                            fullWidth
                            size="small"
                            placeholder={field.placeholder}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary,
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedMethod || !amount}
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: COLORS.primary, color: '#fff',
                    fontWeight: 700, textTransform: 'none',
                    borderRadius: 2, py: 1.3, fontSize: '0.95rem', mt: 0.5,
                    boxShadow: `0 4px 14px ${COLORS.primary}40`,
                    '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: `0 6px 20px ${COLORS.primary}50` },
                    '&:disabled': { bgcolor: COLORS.textMuted, color: '#fff', boxShadow: 'none' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {submitting
                    ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                    : 'Request Withdrawal'}
                </Button>

                <Typography sx={{
                  fontSize: '0.7rem', color: COLORS.textMuted,
                  textAlign: 'center', mt: 0.5
                }}>
                  All withdrawals are manually reviewed and typically processed within 24–48 hours.
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* RIGHT: Withdrawal History */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{
              p: isMobile ? 2.5 : 3,
              borderRadius: 3,
              bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              minHeight: 400,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: `${COLORS.primary}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: COLORS.primary,
                  }}>
                    <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary }}>
                    Payout History
                  </Typography>
                </Box>
                {meta.total > 0 && (
                  <Chip size="small" label={`${meta.total} total`} sx={{
                    fontSize: '0.7rem', fontWeight: 700,
                    bgcolor: darkMode ? 'rgba(83,18,188,0.12)' : 'rgba(83,18,188,0.06)',
                    color: COLORS.primary,
                    border: `1px solid ${darkMode ? 'rgba(83,18,188,0.2)' : 'rgba(83,18,188,0.1)'}`,
                  }} />
                )}
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              ) : withdrawals.length === 0 ? (
                <Box sx={{
                  textAlign: 'center', py: 6, borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `1px dashed ${COLORS.border}`,
                }}>
                  <PaymentsIcon sx={{ fontSize: '2.5rem', color: COLORS.textMuted, mb: 1.5, opacity: 0.5 }} />
                  <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                    No withdrawals yet
                  </Typography>
                  <Typography sx={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>
                    Complete offers, earn points, and request your first payout here.
                  </Typography>
                </Box>
              ) : isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {withdrawals.map((w) => (
                    <Paper key={w.id} sx={{
                      p: 1.2,
                      px: 1.5,
                      borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: `1px solid ${COLORS.border}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: `${COLORS.primary}30`,
                        bgcolor: darkMode ? 'rgba(83,18,188,0.04)' : 'rgba(83,18,188,0.02)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                            ${ptsToUsd(w.amount)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 500 }}>
                            {Math.floor(w.amount || 0).toLocaleString()} pts
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          icon={STATUS_ICONS[w.status] || null}
                          label={w.status}
                          sx={{
                            bgcolor: STATUS_COLORS[w.status]?.bg || '#f3f4f6',
                            color: STATUS_COLORS[w.status]?.color || '#6b7280',
                            fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                            height: 22,
                            '& .MuiChip-icon': { ml: '4px', fontSize: '0.8rem' },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textSecondary, fontWeight: 500 }}>
                          {METHOD_NAMES[w.method] || w.method}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                          {formatDate(w.created_at)}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                        <TableCell sx={{
                          color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${COLORS.border}`, py: 1.2
                        }}>Amount</TableCell>
                        <TableCell sx={{
                          color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${COLORS.border}`, py: 1.2
                        }}>Method</TableCell>
                        <TableCell sx={{
                          color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${COLORS.border}`, py: 1.2
                        }}>Status</TableCell>
                        <TableCell sx={{
                          color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${COLORS.border}`, py: 1.2
                        }} align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w.id} sx={{
                          transition: 'background 0.15s',
                          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)' },
                          '&:last-child td': { borderBottom: 'none' },
                        }}>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, py: 1.8 }}>
                            <Box>
                              <Typography sx={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: '0.95rem' }}>
                                ${ptsToUsd(w.amount)}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 500 }}>
                                {Math.floor(w.amount || 0).toLocaleString()} pts
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, py: 1.8 }}>
                            <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
                              {METHOD_NAMES[w.method] || w.method}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, py: 1.8 }}>
                            <Chip
                              size="small"
                              icon={STATUS_ICONS[w.status] || null}
                              label={w.status}
                              sx={{
                                bgcolor: STATUS_COLORS[w.status]?.bg || '#f3f4f6',
                                color: STATUS_COLORS[w.status]?.color || '#6b7280',
                                fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                                height: 26,
                                '& .MuiChip-icon': { ml: '6px' },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}`, py: 1.8 }} align="right">
                            <Typography sx={{ color: COLORS.textMuted, fontSize: '0.8rem', fontWeight: 500 }}>
                              {formatDate(w.created_at)}
                            </Typography>
                            <Typography sx={{ color: COLORS.textMuted, fontSize: '0.7rem' }}>
                              {formatTime(w.created_at)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {meta.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
                  <Pagination
                    count={meta.totalPages}
                    page={meta.page}
                    onChange={(_, page) => fetchWithdrawals(page)}
                    color="primary"
                    size="small"
                    sx={{
                      '& .MuiPaginationItem-root': { color: COLORS.textSecondary, fontSize: '0.8rem', fontWeight: 600 },
                      '& .Mui-selected': {
                        bgcolor: `${COLORS.primary} !important`,
                        color: '#fff !important', fontWeight: 700,
                      }
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Box>
        </Box>

        {/* CONFIRMATION DIALOG */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3, bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              maxWidth: 420, width: '100%', mx: 2,
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: '1.15rem', pt: 3, px: 3 }}>
            Confirm Withdrawal
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 1 }}>
            <Box sx={{
              p: 2, borderRadius: 2,
              bgcolor: darkMode ? 'rgba(83,18,188,0.08)' : 'rgba(83,18,188,0.04)',
              border: `1px solid ${darkMode ? 'rgba(83,18,188,0.15)' : 'rgba(83,18,188,0.08)'}`,
              mb: 2,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem' }}>Amount</Typography>
                <Typography sx={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>
                  ${parseFloat(amount || 0).toFixed(2)}
                </Typography>
              </Box>
              {feePts > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem' }}>Processing Fee</Typography>
                  <Typography sx={{ color: COLORS.danger, fontWeight: 700, fontSize: '0.9rem' }}>
                    -${feeUsd}
                  </Typography>
                </Box>
              )}
              <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                pt: 1, mt: 0.5,
                borderTop: `1px dashed ${COLORS.border}`,
              }}>
                <Typography sx={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>
                  Net Amount
                </Typography>
                <Typography sx={{ color: COLORS.accent, fontWeight: 800, fontSize: '0.95rem' }}>
                  ${netUsd}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography sx={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>Points</Typography>
                <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.85rem' }}>
                  {usdToPts(amount).toLocaleString()} pts
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ color: COLORS.textMuted, fontSize: '0.82rem', lineHeight: 1.5 }}>
              This request will be reviewed by our team. Processing time varies by payment method. You will receive an email once approved.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button onClick={() => setConfirmOpen(false)} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600,
              borderRadius: 2, px: 2,
            }}>
              Cancel
            </Button>
            <Button
              onClick={confirmWithdrawal}
              disabled={submitting}
              variant="contained"
              sx={{
                bgcolor: COLORS.primary, color: '#fff',
                textTransform: 'none', fontWeight: 700,
                borderRadius: 2, px: 3,
                boxShadow: `0 4px 12px ${COLORS.primary}40`,
                '&:hover': { bgcolor: COLORS.primaryDark },
              }}
            >
              {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}

export default WithdrawPage