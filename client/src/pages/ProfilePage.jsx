// ============================================================
// ProfilePage.jsx — View & Edit Profile (v4: Password Dialog Fixed)
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Paper, Button, TextField, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, useTheme, useMediaQuery, CircularProgress,
  LinearProgress, IconButton, InputAdornment
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
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

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: isMobile ? 2 : 0 }}>

        {/* HEADER */}
        <Box sx={{ mb: 3, mt: isMobile ? 1 : 0 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: isMobile ? '1.3rem' : '1.6rem',
            color: COLORS.textPrimary, mb: 0.5, letterSpacing: '-0.02em'
          }}>
            Profile
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Manage your account and preferences
          </Typography>
        </Box>

        {/* TOP CARD */}
        <Paper sx={{
          p: isMobile ? 2.5 : 3.5,
          borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.primary}12 0%, ${COLORS.primary}03 100%)`,
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'center',
            gap: isMobile ? 2.5 : 3,
            textAlign: isMobile ? 'center' : 'left',
          }}>
            <Avatar sx={{
              width: isMobile ? 72 : 84, height: isMobile ? 72 : 84,
              bgcolor: `${COLORS.primary}20`, color: COLORS.primary,
              fontSize: isMobile ? '1.6rem' : '1.8rem', fontWeight: 800,
              border: `3px solid ${COLORS.primary}30`,
            }}>
              {getInitials(user?.full_name || user?.username)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{
                fontWeight: 800, fontSize: isMobile ? '1.3rem' : '1.5rem',
                color: COLORS.textPrimary, mb: 0.3
              }}>
                {user?.full_name || user?.username || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 1.2 }}>
                {user?.email || ''} · ID: #{user?.public_id || '---'}
              </Typography>
              <Box sx={{
                display: 'flex', flexWrap: 'wrap', gap: 1,
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}>
                <Chip
                  icon={<StarIcon sx={{ fontSize: '0.85rem !important' }} />}
                  label={`Level ${user?.level || 1}`}
                  size="small"
                  sx={{ bgcolor: `${COLORS.gold}15`, color: COLORS.gold,
                    fontWeight: 700, fontSize: '0.72rem' }}
                />
                <Chip
                  icon={<CalendarTodayIcon sx={{ fontSize: '0.85rem !important' }} />}
                  label={`Since ${getMemberSince()}`}
                  size="small"
                  sx={{ bgcolor: `${COLORS.primary}12`, color: COLORS.primary,
                    fontWeight: 600, fontSize: '0.72rem' }}
                />
              </Box>
            </Box>

            <Button
              onClick={() => { setPasswordOpen(true); setError(null); setPwdErrors({}) }}
              variant="outlined"
              startIcon={<LockIcon />}
              size="small"
              sx={{
                color: COLORS.textSecondary, borderColor: COLORS.border,
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                '&:hover': { borderColor: COLORS.primary, color: COLORS.primary },
                flexShrink: 0,
              }}
            >
              Change Password
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 600 }}>
                Profile Completion
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.primary, fontWeight: 700 }}>
                {user?.profile_completion || 20}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={user?.profile_completion || 20}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary, borderRadius: 3 }
              }}
            />
          </Box>
        </Paper>

        {/* EDIT PROFILE FORM */}
        <Paper sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }}
              onClose={() => setError(null)}>{error}</Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }}
              onClose={() => setSuccess(null)}>{success}</Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 2 }} />)}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2.2 }}>
                {[
                  { label: 'Full Name', key: 'full_name', placeholder: 'Your full name' },
                  { label: 'Email', key: 'email', placeholder: '', disabled: true },
                  { label: 'Phone', key: 'phone', placeholder: '10-15 digit phone number' },
                  { label: 'Date of Birth', key: 'dob', type: 'date' },
                  { label: 'Gender', key: 'gender', type: 'select', options: GENDER_OPTIONS },
                  { label: 'Country', key: 'country', placeholder: 'Your country' },
                ].map(field => (
                  <Box key={field.key} sx={{ gridColumn: field.key === 'address' || field.key === 'upi_id' ? (isMobile ? '1' : '1 / -1') : undefined }}>
                    <Typography sx={{
                      fontSize: '0.75rem', color: COLORS.textMuted,
                      fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                      {field.label}
                    </Typography>
                    {field.type === 'select' ? (
                      <TextField select value={profile[field.key]} onChange={(e) => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                        fullWidth size="small" sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary }
                        }}>
                        <MenuItem value="" sx={{ fontSize: '0.9rem' }}>Select gender</MenuItem>
                        {field.options.map(g => <MenuItem key={g.value} value={g.value} sx={{ fontSize: '0.9rem' }}>{g.label}</MenuItem>)}
                      </TextField>
                    ) : (
                      <TextField value={profile[field.key]} onChange={(e) => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
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
                <Box sx={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <Typography sx={{
                    fontSize: '0.75rem', color: COLORS.textMuted,
                    fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>Address</Typography>
                  <TextField value={profile.address} onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                    fullWidth size="small" placeholder="Your address"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary } }} />
                </Box>
                {/* UPI ID */}
                <Box sx={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <Typography sx={{
                    fontSize: '0.75rem', color: COLORS.textMuted,
                    fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>UPI ID</Typography>
                  <TextField value={profile.upi_id} onChange={(e) => setProfile(p => ({ ...p, upi_id: e.target.value }))}
                    fullWidth size="small" placeholder="name@upi"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary } }} />
                </Box>
              </Box>

              <Button onClick={handleSaveProfile} disabled={saving} variant="contained"
                sx={{
                  bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, textTransform: 'none',
                  borderRadius: 2, px: 3, py: 1, mt: 1,
                  boxShadow: `0 4px 14px ${COLORS.primary}40`,
                  '&:hover': { bgcolor: COLORS.primaryDark },
                }}>
                {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Paper>

        {/* ═══════════════════════════════════════════════════════
            CHANGE PASSWORD DIALOG — Attractive, eye icons, field errors
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
          <Box sx={{
            p: 3, pb: 2,
            bgcolor: darkMode ? 'rgba(83,18,188,0.08)' : 'rgba(83,18,188,0.04)',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: `${COLORS.primary}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.primary,
            }}>
              <LockIcon sx={{ fontSize: '1.3rem' }} />
            </Box>
            <Box>
              <DialogTitle sx={{
                color: COLORS.textPrimary, fontWeight: 800,
                fontSize: '1.15rem', p: 0,
              }}>
                Change Password
              </DialogTitle>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                Update your account password
              </Typography>
            </Box>
          </Box>

          <DialogContent sx={{ px: 3, py: 3 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2.5, fontSize: '0.85rem' }}
                onClose={() => setError(null)}>{error}</Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Current Password */}
              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Current Password <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
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
                        <IconButton
                          onClick={() => setShowCurrent(!showCurrent)}
                          edge="end" size="small"
                          sx={{ color: COLORS.textMuted }}
                        >
                          {showCurrent
                            ? <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} />
                            : <VisibilityIcon sx={{ fontSize: '1.1rem' }} />}
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
              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  New Password <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
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
                        <IconButton
                          onClick={() => setShowNew(!showNew)}
                          edge="end" size="small"
                          sx={{ color: COLORS.textMuted }}
                        >
                          {showNew
                            ? <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} />
                            : <VisibilityIcon sx={{ fontSize: '1.1rem' }} />}
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
              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Confirm Password <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
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
                        <IconButton
                          onClick={() => setShowConfirm(!showConfirm)}
                          edge="end" size="small"
                          sx={{ color: COLORS.textMuted }}
                        >
                          {showConfirm
                            ? <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} />
                            : <VisibilityIcon sx={{ fontSize: '1.1rem' }} />}
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

            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => {
                setPasswordOpen(false); setError(null); setPwdErrors({})
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
              }}
              disabled={saving}
              sx={{
                color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600,
                borderRadius: 2, px: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={saving}
              variant="contained"
              sx={{
                bgcolor: COLORS.primary, color: '#fff',
                textTransform: 'none', fontWeight: 700,
                borderRadius: 2, px: 3,
                boxShadow: `0 4px 12px ${COLORS.primary}40`,
                '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.textMuted, color: '#fff' },
              }}
            >
              {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Update Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}

export default ProfilePage