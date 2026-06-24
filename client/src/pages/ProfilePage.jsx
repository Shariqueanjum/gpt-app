// ============================================================
// ProfilePage.jsx — View & Edit Profile + Security Tab (Login History with Clean Pagination)
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Paper, Button, TextField, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, useTheme, useMediaQuery, CircularProgress,
  LinearProgress, IconButton, InputAdornment, Tabs, Tab
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import SecurityIcon from '@mui/icons-material/Security'
import PersonIcon from '@mui/icons-material/Person'
import ComputerIcon from '@mui/icons-material/Computer'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuItem from '@mui/material/MenuItem'
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const ProfilePage = ({ darkMode, toggleDarkMode }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '', dob: '', gender: '',
    address: '', country: '', upi_id: '',
  })

  // Password dialog
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdErrors, setPwdErrors] = useState({})

  // Login History (lazy loaded with page number pagination)
  const [loginHistory, setLoginHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyMeta, setHistoryMeta] = useState(null)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/user/profile')
      const u = res.data.user || {}
      setProfile({
        full_name: u.full_name || '', email: u.email || '', phone: u.phone || '',
        dob: u.dob || '', gender: u.gender || '', address: u.address || '',
        country: u.country || '', upi_id: u.upi_id || '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchLoginHistory = async (page = 1) => {
    setHistoryLoading(true)
    try {
      const res = await axiosInstance.get(`/login-history/?page=${page}&limit=10&sort_by=created_at&sort_order=desc`)
      setLoginHistory(res.data.data || [])
      setHistoryMeta(res.data.meta || null)
      setHistoryPage(page)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load login history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (historyMeta && newPage > historyMeta.totalPages)) return
    fetchLoginHistory(newPage)
  }

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue)
    setError(null)
    setSuccess(null)
    if (newValue === 1 && loginHistory.length === 0) {
      fetchLoginHistory(1)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true); setError(null)
      await axiosInstance.put('/user/profile', {
        full_name: profile.full_name, phone: profile.phone,
        dob: profile.dob || undefined, gender: profile.gender || undefined,
        address: profile.address, country: profile.country, upi_id: profile.upi_id,
      })
      dispatch(fetchCurrentUser())
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const validatePasswordFields = () => {
    const errs = {}
    if (!currentPassword.trim()) errs.currentPassword = 'Current password is required'
    if (!newPassword.trim()) errs.newPassword = 'New password is required'
    else if (newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters'
    if (!confirmPassword.trim()) errs.confirmPassword = 'Please confirm your password'
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setPwdErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePasswordFields()) return
    try {
      setSaving(true); setError(null)
      await axiosInstance.post('/user/change-password', {
        current_password: currentPassword, new_password: newPassword,
      })
      setSuccess('Password changed successfully!')
      setPasswordOpen(false)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdErrors({})
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const getMemberSince = () => {
    if (!user?.created_at) return 'New member'
    return new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!historyMeta) return []
    const totalPages = historyMeta.totalPages
    const current = historyPage
    const pages = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (current >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: isMobile ? 2 : 0 }}>
        {/* HEADER */}
        <Box sx={{ mb: 3, mt: isMobile ? 1 : 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5 }}>
            Profile
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Manage your account and preferences
          </Typography>
        </Box>

        {/* TOP CARD */}
        <Paper sx={{
          p: isMobile ? 2.5 : 3,
          borderRadius: 3,
          mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.primary}12 0%, ${COLORS.primary}03 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{
              width: 64, height: 64,
              bgcolor: `${COLORS.primary}15`,
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: '1.5rem',
              border: `2px solid ${COLORS.primary}25`
            }}>
              {getInitials(user?.full_name || user?.username)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.textPrimary }}>
                {user?.full_name || user?.username || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                {user?.email || ''} · ID: #{user?.public_id || '---'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
                <Chip
                  icon={<StarIcon sx={{ fontSize: '0.8rem', color: COLORS.gold }} />}
                  label={`Level ${user?.level || 1}`}
                  size="small"
                  sx={{ bgcolor: `${COLORS.gold}15`, color: COLORS.gold, fontWeight: 700, fontSize: '0.72rem' }}
                />
                <Chip
                  icon={<CalendarTodayIcon sx={{ fontSize: '0.8rem', color: COLORS.primary }} />}
                  label={`Since ${getMemberSince()}`}
                  size="small"
                  sx={{ bgcolor: `${COLORS.primary}12`, color: COLORS.primary, fontWeight: 600, fontSize: '0.72rem' }}
                />
              </Box>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.8 }}>
            Profile Completion
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={user?.profile_completion || 20}
              sx={{
                flex: 1, height: 8, borderRadius: 4,
                bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary, borderRadius: 4 }
              }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS.primary }}>
              {user?.profile_completion || 20}%
            </Typography>
          </Box>
        </Paper>

        {/* TABS */}
        <Paper sx={{
          borderRadius: 3,
          mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden'
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              borderBottom: `1px solid ${COLORS.border}`,
              '& .MuiTabs-flexContainer': { px: isMobile ? 0 : 2 },
              '& .MuiTabs-indicator': { bgcolor: COLORS.primary, height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: COLORS.textSecondary,
                '&.Mui-selected': { color: COLORS.primary, fontWeight: 700 },
              }
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label="Profile" />
            <Tab icon={<SecurityIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label="Security" />
          </Tabs>

          {/* TAB 1: PROFILE */}
          {activeTab === 0 && (
            <Box sx={{ p: isMobile ? 2 : 3 }}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setError(null)}>{error}</Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setSuccess(null)}>{success}</Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />)}
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {[
                      { label: 'Full Name', key: 'full_name', placeholder: 'Your full name' },
                      { label: 'Email', key: 'email', placeholder: '', disabled: true },
                      { label: 'Phone', key: 'phone', placeholder: '10-15 digit phone number' },
                      { label: 'Date of Birth', key: 'dob', type: 'date' },
                      { label: 'Gender', key: 'gender', type: 'select', options: GENDER_OPTIONS },
                      { label: 'Country', key: 'country', placeholder: 'Your country' },
                    ].map(field => (
                      <Box key={field.key}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.6 }}>
                          {field.label}
                        </Typography>
                        {field.type === 'select' ? (
                          <TextField
                            select
                            value={profile[field.key] || ''}
                            onChange={(e) => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                            fullWidth size="small" sx={{
                              '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary }
                            }}
                          >
                            <MenuItem value=""><em>Select gender</em></MenuItem>
                            {field.options.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                          </TextField>
                        ) : (
                          <TextField
                            value={profile[field.key] || ''}
                            onChange={(e) => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                            fullWidth size="small" placeholder={field.placeholder} disabled={field.disabled} type={field.type || 'text'}
                            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                            sx={{
                              '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary },
                              '& .Mui-disabled': { color: COLORS.textMuted }
                            }} />
                        )}
                      </Box>
                    ))}

                    {/* Address */}
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.6 }}>Address</Typography>
                      <TextField
                        value={profile.address || ''}
                        onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                        fullWidth size="small" placeholder="Your address"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary } }} />
                    </Box>

                    {/* UPI ID */}
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.6 }}>UPI ID</Typography>
                      <TextField
                        value={profile.upi_id || ''}
                        onChange={(e) => setProfile(p => ({ ...p, upi_id: e.target.value }))}
                        fullWidth size="small" placeholder="name@upi"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary } }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
                      sx={{
                        bgcolor: COLORS.primary, color: '#fff', fontWeight: 700,
                        textTransform: 'none', borderRadius: 2, px: 3,
                        '&:hover': { bgcolor: COLORS.primaryDark },
                        boxShadow: 'none'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => setPasswordOpen(true)}
                      variant="outlined"
                      startIcon={<LockIcon />}
                      sx={{
                        borderColor: COLORS.primary, color: COLORS.primary,
                        fontWeight: 700, textTransform: 'none', borderRadius: 2,
                        '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primaryDark }
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 1 && (
            <Box sx={{ p: isMobile ? 2 : 3 }}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setError(null)}>{error}</Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setSuccess(null)}>{success}</Alert>
              )}

              {/* Change Password Section */}
              <Paper sx={{
                p: isMobile ? 2 : 2.5,
                borderRadius: 3,
                mb: 3,
                bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                border: `1px solid ${COLORS.border}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    bgcolor: `${COLORS.primary}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: COLORS.primary
                  }}>
                    <LockIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary }}>
                      Password
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                      Update your account password
                    </Typography>
                  </Box>
                </Box>
                <Button
                  onClick={() => setPasswordOpen(true)}
                  variant="outlined"
                  sx={{
                    borderColor: COLORS.primary, color: COLORS.primary,
                    fontWeight: 700, textTransform: 'none', borderRadius: 2,
                    '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primaryDark }
                  }}
                >
                  Change Password
                </Button>
              </Paper>

              {/* Login History Section */}
              <Paper sx={{
                p: isMobile ? 2 : 2.5,
                borderRadius: 3,
                bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                border: `1px solid ${COLORS.border}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      bgcolor: `${COLORS.primary}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.primary
                    }}>
                      <ComputerIcon sx={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary }}>
                        Login History
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                        Recent sign-in activity on your account
                        {historyMeta && (
                          <span style={{ color: COLORS.textMuted }}> · {historyMeta.total} total</span>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {historyLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />)}
                  </Box>
                ) : loginHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ComputerIcon sx={{ fontSize: '2.5rem', color: COLORS.textMuted, mb: 1 }} />
                    <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                      No login history yet
                    </Typography>
                    <Typography sx={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>
                      Your recent sign-in activity will appear here
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {loginHistory.map((entry, idx) => (
                        <Box
                          key={entry.id || idx}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: COLORS.cardBg,
                            border: `1px solid ${COLORS.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1.5
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 36, height: 36, borderRadius: '50%',
                              bgcolor: entry.status === 'success' ? `${COLORS.accent}12` : `${COLORS.danger}12`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: entry.status === 'success' ? COLORS.accent : COLORS.danger
                            }}>
                              {entry.status === 'success' ? <CheckCircleIcon sx={{ fontSize: '1.1rem' }} /> : <CancelIcon sx={{ fontSize: '1.1rem' }} />}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: COLORS.textPrimary }}>
                                {entry.device_info || 'Unknown Device'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                                {entry.ip_address || 'Unknown IP'} · {entry.location || 'Unknown Location'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: COLORS.textPrimary }}>
                              {formatDate(entry.created_at)}
                            </Typography>
                            <Chip
                              label={entry.status === 'success' ? 'Success' : 'Failed'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: entry.status === 'success' ? `${COLORS.accent}12` : `${COLORS.danger}12`,
                                color: entry.status === 'success' ? COLORS.accent : COLORS.danger,
                                borderRadius: 1
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Clean Page Number Pagination */}
                    {historyMeta && historyMeta.totalPages > 1 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 0.8, 
                        mt: 3,
                        flexWrap: 'wrap'
                      }}>
                        {/* Left Arrow — hidden on page 1 */}
                        {historyPage > 1 && (
                          <IconButton
                            onClick={() => handlePageChange(historyPage - 1)}
                            disabled={historyLoading}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.textSecondary,
                              '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primary, color: COLORS.primary },
                            }}
                          >
                            <ChevronLeftIcon sx={{ fontSize: '1.2rem' }} />
                          </IconButton>
                        )}

                        {/* Page Numbers */}
                        {getPageNumbers().map((page, idx) => (
                          page === '...' ? (
                            <Typography 
                              key={`ellipsis-${idx}`} 
                              sx={{ 
                                color: COLORS.textMuted, 
                                fontSize: '0.85rem', 
                                px: 0.5,
                                fontWeight: 600,
                                userSelect: 'none'
                              }}
                            >
                              ...
                            </Typography>
                          ) : (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              disabled={historyLoading}
                              variant={historyPage === page ? 'contained' : 'text'}
                              sx={{
                                minWidth: 36,
                                height: 36,
                                p: 0,
                                borderRadius: 2,
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                bgcolor: historyPage === page ? COLORS.primary : 'transparent',
                                color: historyPage === page ? '#fff' : COLORS.textSecondary,
                                '&:hover': historyPage === page 
                                  ? { bgcolor: COLORS.primaryDark } 
                                  : { bgcolor: `${COLORS.primary}08`, color: COLORS.primary },
                              }}
                            >
                              {page}
                            </Button>
                          )
                        ))}

                        {/* Right Arrow — hidden on last page */}
                        {historyPage < historyMeta.totalPages && (
                          <IconButton
                            onClick={() => handlePageChange(historyPage + 1)}
                            disabled={historyLoading}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.textSecondary,
                              '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primary, color: COLORS.primary },
                            }}
                          >
                            <ChevronRightIcon sx={{ fontSize: '1.2rem' }} />
                          </IconButton>
                        )}
                      </Box>
                    )}

                    {/* Page info */}
                    {historyMeta && (
                      <Typography sx={{ textAlign: 'center', mt: 1.5, fontSize: '0.8rem', color: COLORS.textMuted }}>
                        Page {historyPage} of {historyMeta.totalPages}
                      </Typography>
                    )}
                  </>
                )}
              </Paper>
            </Box>
          )}
        </Paper>

        {/* ═══════════════════════════════════════════════════════
            CHANGE PASSWORD DIALOG
            ═══════════════════════════════════════════════════════ */}
        <Dialog
          open={passwordOpen}
          onClose={() => {
            if (!saving) {
              setPasswordOpen(false); setError(null); setPwdErrors({})
              setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
            }
          }}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
            }
          }}
        >
          {/* Header */}
          <DialogTitle sx={{ pb: 0.5, pt: 2.5, px: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: COLORS.textPrimary }}>
              Change Password
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mt: 0.3 }}>
              Update your account password
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setError(null)}>{error}</Alert>
            )}

            {/* Current Password */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.6 }}>
                Current Password *
              </Typography>
              <TextField
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (pwdErrors.currentPassword) setPwdErrors(p => ({ ...p, currentPassword: '' }))
                }}
                fullWidth size="small"
                placeholder="Enter current password"
                error={!!pwdErrors.currentPassword}
                helperText={pwdErrors.currentPassword || ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small" sx={{ color: COLORS.textMuted }}>
                        {showCurrent ? <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} /> : <VisibilityIcon sx={{ fontSize: '1.1rem' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary,
                  },
                  '& .MuiFormHelperText-root': {
                    color: COLORS.danger,
                    fontSize: '0.75rem',
                    marginLeft: '4px',
                    marginTop: '4px',
                  },
                }}
              />
            </Box>

            {/* New Password */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.6 }}>
                New Password *
              </Typography>
              <TextField
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (pwdErrors.newPassword) setPwdErrors(p => ({ ...p, newPassword: '' }))
                }}
                fullWidth size="small"
                placeholder="Enter new password"
                error={!!pwdErrors.newPassword}
                helperText={pwdErrors.newPassword || 'At least 8 characters'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small" sx={{ color: COLORS.textMuted }}>
                        {showNew ? <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} /> : <VisibilityIcon sx={{ fontSize: '1.1rem' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary,
                  },
                  '& .MuiFormHelperText-root': {
                    color: pwdErrors.newPassword ? COLORS.danger : COLORS.textMuted,
                    fontSize: '0.75rem',
                    marginLeft: '4px',
                    marginTop: '4px',
                  },
                }}
              />
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.6 }}>
                Confirm Password *
              </Typography>
              <TextField
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (pwdErrors.confirmPassword) setPwdErrors(p => ({ ...p, confirmPassword: '' }))
                }}
                fullWidth size="small"
                placeholder="Confirm new password"
                error={!!pwdErrors.confirmPassword}
                helperText={pwdErrors.confirmPassword || ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small" sx={{ color: COLORS.textMuted }}>
                        {showConfirm ? <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} /> : <VisibilityIcon sx={{ fontSize: '1.1rem' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary,
                  },
                  '& .MuiFormHelperText-root': {
                    color: COLORS.danger,
                    fontSize: '0.75rem',
                    marginLeft: '4px',
                    marginTop: '4px',
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => {
                setPasswordOpen(false); setError(null); setPwdErrors({})
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
              }}
              disabled={saving}
              sx={{ color: COLORS.textSecondary, fontWeight: 600, textTransform: 'none', borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={saving}
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
              sx={{
                bgcolor: COLORS.primary, color: '#fff', fontWeight: 700,
                textTransform: 'none', borderRadius: 2, px: 3,
                '&:hover': { bgcolor: COLORS.primaryDark },
                boxShadow: 'none'
              }}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}

export default ProfilePage