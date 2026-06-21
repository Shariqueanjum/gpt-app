// ============================================================
// ProfilePage.jsx — View & Edit Profile, Change Password
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Typography, Paper, Button, TextField, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, Divider, useTheme, useMediaQuery, CircularProgress,
  Tabs, Tab
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import StarIcon from '@mui/icons-material/Star'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

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
  const [activeTab, setActiveTab] = useState(0)

  // Profile data
  const [profile, setProfile] = useState({
    username: '', email: '', first_name: '', last_name: '',
    country: '', city: '', phone: '', bio: '',
  })

  // Password change
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Level & streak data
  const [levelData, setLevelData] = useState(null)
  const [streakData, setStreakData] = useState(null)

  useEffect(() => {
    fetchProfile()
    fetchLevelProgress()
    fetchStreakStatus()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/user/profile')
      const u = res.data.user || {}
      setProfile({
        username: u.username || '',
        email: u.email || '',
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        country: u.country || '',
        city: u.city || '',
        phone: u.phone || '',
        bio: u.bio || '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchLevelProgress = async () => {
    try {
      const res = await axiosInstance.get('/levels/progress')
      setLevelData(res.data.data)
    } catch (err) {
      console.error('Level fetch failed:', err)
    }
  }

  const fetchStreakStatus = async () => {
    try {
      const res = await axiosInstance.get('/streak/status')
      setStreakData(res.data.data)
    } catch (err) {
      console.error('Streak fetch failed:', err)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)

      await axiosInstance.put('/user/profile', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        country: profile.country,
        city: profile.city,
        phone: profile.phone,
        bio: profile.bio,
      })

      dispatch(fetchCurrentUser())
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setSaving(true)
      setError(null)

      await axiosInstance.post('/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })

      setSuccess('Password changed successfully!')
      setPasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const getMemberSince = () => {
    if (!user?.created_at) return 'New member'
    const date = new Date(user.created_at)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5
          }}>
            Profile
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Manage your account and preferences
          </Typography>
        </Box>

        {/* Profile Header Card */}
        <Paper sx={{
          p: 3, borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.primary}10 0%, ${COLORS.primary}02 100%)`,
        }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2.5,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Avatar sx={{
              width: 72, height: 72,
              bgcolor: COLORS.primary, color: '#fff',
              fontWeight: 800, fontSize: '1.8rem'
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{
                fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary
              }}>
                {user?.username || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 1 }}>
                {user?.email || ''} · ID: #{user?.public_id || '---'}
              </Typography>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap'
              }}>
                <Chip size="small" icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
                  label={`Level ${user?.level_id || 1}`} sx={{
                    bgcolor: `${COLORS.gold}12`, color: COLORS.gold,
                    fontWeight: 700, fontSize: '0.72rem'
                  }} />
                <Chip size="small" icon={<WhatshotIcon sx={{ fontSize: '0.8rem !important' }} />}
                  label={`${streakData?.current_streak || 0} Day Streak`} sx={{
                    bgcolor: `${COLORS.danger}10`, color: COLORS.danger,
                    fontWeight: 700, fontSize: '0.72rem'
                  }} />
                <Chip size="small" label={getMemberSince()} sx={{
                  bgcolor: `${COLORS.primary}08`, color: COLORS.primary,
                  fontWeight: 600, fontSize: '0.72rem'
                }} />
              </Box>
            </Box>
            <Button
              onClick={() => setPasswordOpen(true)}
              variant="outlined"
              startIcon={<LockIcon sx={{ fontSize: '0.9rem' }} />}
              size="small"
              sx={{
                borderColor: COLORS.border, color: COLORS.textSecondary,
                textTransform: 'none', fontWeight: 600, borderRadius: 2,
                '&:hover': { borderColor: COLORS.primary, color: COLORS.primary }
              }}
            >
              Change Password
            </Button>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{
          borderRadius: 3, overflow: 'hidden',
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${COLORS.border}`,
              '& .MuiTabs-indicator': { bgcolor: COLORS.primary },
              '& .MuiTab-root': {
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                '&.Mui-selected': { color: COLORS.primary, fontWeight: 700 }
              }
            }}
          >
            <Tab label="Edit Profile" />
            <Tab label="Level & Progress" />
          </Tabs>

          {/* Edit Profile Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
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

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />)}
                </Box>
              ) : (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2.5
                }}>
                  <TextField
                    label="Username" value={profile.username}
                    disabled fullWidth size="small"
                    helperText="Username cannot be changed"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="Email" value={profile.email}
                    disabled fullWidth size="small"
                    helperText="Email cannot be changed"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="First Name" value={profile.first_name}
                    onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))}
                    fullWidth size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="Last Name" value={profile.last_name}
                    onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))}
                    fullWidth size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="Country" value={profile.country}
                    onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))}
                    fullWidth size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="City" value={profile.city}
                    onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
                    fullWidth size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="Phone" value={profile.phone}
                    onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                    fullWidth size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                  <TextField
                    label="Bio" value={profile.bio}
                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                    fullWidth size="small" multiline rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving || loading}
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <EditIcon />}
                  sx={{
                    bgcolor: COLORS.primary, color: '#fff',
                    fontWeight: 700, textTransform: 'none', borderRadius: 2,
                    px: 4, py: 1,
                    '&:hover': { bgcolor: COLORS.primaryDark },
                    boxShadow: 'none',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Level & Progress Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              {levelData ? (
                <Box>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2, mb: 3
                  }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 2,
                      bgcolor: `${COLORS.gold}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.gold
                    }}>
                      <StarIcon sx={{ fontSize: '1.8rem' }} />
                    </Box>
                    <Box>
                      <Typography sx={{
                        fontWeight: 800, fontSize: '1.2rem', color: COLORS.textPrimary
                      }}>
                        Level {levelData.current_level || user?.level_id || 1}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                        {levelData.next_level
                          ? `${formatPoints(levelData.points_to_next)} pts to Level ${levelData.next_level}`
                          : 'You have reached the maximum level!'
                        }
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  {levelData.next_level && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{
                        width: '100%', height: 10, borderRadius: 5,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: `${Math.min(100, (levelData.current_points / (levelData.current_points + levelData.points_to_next)) * 100)}%`,
                          height: '100%',
                          borderRadius: 5,
                          bgcolor: COLORS.gold,
                          transition: 'width 0.5s ease'
                        }} />
                      </Box>
                      <Box sx={{
                        display: 'flex', justifyContent: 'space-between', mt: 0.8
                      }}>
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                          {formatPoints(levelData.current_points || 0)} pts
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                          {formatPoints((levelData.current_points || 0) + (levelData.points_to_next || 0))} pts
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Stats */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2
                  }}>
                    <Paper sx={{
                      p: 2.5, borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: `1px solid ${COLORS.border}`,
                      textAlign: 'center'
                    }}>
                      <TrendingUpIcon sx={{ fontSize: '1.5rem', color: COLORS.primary, mb: 0.5 }} />
                      <Typography sx={{
                        fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary
                      }}>
                        {formatPoints(levelData.total_earned_points || 0)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>
                        Total Points Earned
                      </Typography>
                    </Paper>

                    <Paper sx={{
                      p: 2.5, borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: `1px solid ${COLORS.border}`,
                      textAlign: 'center'
                    }}>
                      <WhatshotIcon sx={{ fontSize: '1.5rem', color: COLORS.danger, mb: 0.5 }} />
                      <Typography sx={{
                        fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary
                      }}>
                        {streakData?.current_streak || 0}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>
                        Current Streak
                      </Typography>
                    </Paper>

                    <Paper sx={{
                      p: 2.5, borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: `1px solid ${COLORS.border}`,
                      textAlign: 'center'
                    }}>
                      <StarIcon sx={{ fontSize: '1.5rem', color: COLORS.gold, mb: 0.5 }} />
                      <Typography sx={{
                        fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary
                      }}>
                        {levelData.current_level || user?.level_id || 1}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>
                        Current Level
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rounded" height={10} sx={{ borderRadius: 5 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Change Password Dialog */}
        <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} maxWidth="xs" fullWidth PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            Change Password
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                label="Current Password" type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
              <TextField
                label="New Password" type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth size="small"
                helperText="At least 6 characters"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
              <TextField
                label="Confirm New Password" type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPasswordOpen(false)} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              variant="contained"
              sx={{
                bgcolor: COLORS.primary, color: '#fff', textTransform: 'none', fontWeight: 700,
                borderRadius: 2, '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.textMuted }
              }}
            >
              {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Change Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageWrapper>
  )
}

export default ProfilePage