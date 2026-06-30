import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, IconButton, InputAdornment, TextField, Button, Alert, CircularProgress } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { loginAdmin, clearAdminError } from '../../slices/adminAuthSlice'

const COLORS = {
  ink: '#0d0a1f',
  primary: '#5312bc',
  primaryLight: '#8b5cf6',
  accent: '#10b981',
  textOnDark: '#f1f0f7',
  textMutedOnDark: '#9b94c2',
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: 'rgba(255,255,255,0.04)',
    color: '#f1f0f7',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.24)' },
    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
  },
  '& .MuiFormHelperText-root': { color: '#f87171', ml: 0 },
}

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, isAdminAuthenticated, admin } = useSelector((state) => state.adminAuth)

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (isAdminAuthenticated && admin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdminAuthenticated, admin, navigate])

  useEffect(() => {
    return () => { dispatch(clearAdminError()) }
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) dispatch(clearAdminError())
  }

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))

  const emailError = touched.email && !/^\S+@\S+\.\S+$/.test(formData.email)
    ? 'Enter a valid email' : ''
  const passwordError = touched.password && !formData.password
    ? 'Password is required' : ''

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!/^\S+@\S+\.\S+$/.test(formData.email) || !formData.password) return
    dispatch(loginAdmin(formData))
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      bgcolor: COLORS.ink,
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    }}>
      {/* Left brand panel — hidden on small screens */}
      <Box sx={{
        flex: '0 0 44%',
        display: { xs: 'none', md: 'flex' },
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 6,
        overflow: 'hidden',
        background: `radial-gradient(120% 120% at 0% 0%, ${COLORS.primary} 0%, #2a0e6e 38%, ${COLORS.ink} 78%)`,
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at 30% 20%, black, transparent 70%)',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.4 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2.5, bgcolor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: COLORS.primary, fontWeight: 800, fontSize: '1.3rem',
            fontFamily: '"Sora", sans-serif',
          }}>W</Box>
          <Typography sx={{
            fontFamily: '"Sora", sans-serif', fontWeight: 800, fontSize: '1.3rem',
            color: '#fff', letterSpacing: '-0.02em',
          }}>WABCASH</Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 380 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.8, mb: 2.5,
            px: 1.4, py: 0.6, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <ShieldOutlinedIcon sx={{ fontSize: '1rem', color: COLORS.accent }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: COLORS.textOnDark, letterSpacing: '0.04em' }}>
              RESTRICTED ACCESS
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: '"Sora", sans-serif', fontWeight: 800, fontSize: '2.1rem',
            lineHeight: 1.18, color: '#fff', letterSpacing: '-0.02em', mb: 2,
          }}>
            Control room for the cash you pay out.
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.7, color: COLORS.textMutedOnDark }}>
            Users, withdrawals, offer walls, fraud signals and every callback your
            survey providers send — all in one place.
          </Typography>
        </Box>

        <Typography sx={{ position: 'relative', zIndex: 1, fontSize: '0.78rem', color: COLORS.textMutedOnDark }}>
          © {new Date().getFullYear()} WABCASH Market Insights (OPC) Pvt. Ltd.
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: { xs: 3, sm: 6 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.2, mb: 4 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2.5, bgcolor: COLORS.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontFamily: '"Sora", sans-serif',
            }}>W</Box>
            <Typography sx={{
              fontFamily: '"Sora", sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#fff',
            }}>WABCASH</Typography>
          </Box>

          <Typography sx={{
            fontFamily: '"Sora", sans-serif', fontWeight: 800, fontSize: '1.7rem',
            color: '#fff', letterSpacing: '-0.02em', mb: 0.6,
          }}>
            Admin sign in
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', color: COLORS.textMutedOnDark, mb: 4 }}>
            Sign in with your administrator credentials to continue.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textMutedOnDark, mb: 0.8 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              name="email"
              type="email"
              placeholder="admin@wabcash.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!emailError}
              helperText={emailError}
              autoComplete="username"
              autoFocus
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: COLORS.textMutedOnDark, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textMutedOnDark, mb: 0.8, mt: 2.5 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!passwordError}
              helperText={passwordError}
              autoComplete="current-password"
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: COLORS.textMutedOnDark, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                      {showPassword
                        ? <VisibilityOffOutlinedIcon sx={{ color: COLORS.textMutedOnDark, fontSize: '1.15rem' }} />
                        : <VisibilityOutlinedIcon sx={{ color: COLORS.textMutedOnDark, fontSize: '1.15rem' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                mt: 4, py: 1.4, borderRadius: 2.5,
                bgcolor: COLORS.primary, color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', textTransform: 'none',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                boxShadow: '0 8px 24px rgba(83,18,188,0.35)',
                '&:hover': { bgcolor: COLORS.primaryLight },
                '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: COLORS.textMutedOnDark },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: COLORS.textMutedOnDark }} /> : 'Sign in'}
            </Button>
          </Box>

          <Typography sx={{ mt: 4, fontSize: '0.78rem', color: COLORS.textMutedOnDark, textAlign: 'center' }}>
            This panel is for authorized WABCASH staff only. All actions are logged.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLoginPage