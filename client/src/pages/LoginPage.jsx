import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Fade,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { loginUser, clearError, clearMessage } from '../slices/authSlice'
import InputField from '../components/common/InputField'
import Button from '../components/common/Button'
import ErrorAlert from '../components/common/ErrorAlert'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({ email_or_username: '', password: '' })
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '', userAnswer: '' })
  const [captchaError, setCaptchaError] = useState('')

  const searchParams = new URLSearchParams(location.search)
  const verified = searchParams.get('verified')
  const verificationError = searchParams.get('error')

  // Generate CAPTCHA on mount
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptcha({ num1, num2, answer: String(num1 + num2), userAnswer: '' })
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

 // CRITICAL: Redirect after login success
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if profile is complete
      if (user.profile_completion < 100) {
        navigate('/complete-profile', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearMessage())
    }
  }, [dispatch])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  
  const handleCaptchaChange = (e) => {
    setCaptcha({ ...captcha, userAnswer: e.target.value })
    setCaptchaError('')
  }

  const regenerateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptcha({ num1, num2, answer: String(num1 + num2), userAnswer: '' })
    setCaptchaError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (captcha.userAnswer !== captcha.answer) {
      setCaptchaError('Wrong answer. Try again.')
      regenerateCaptcha()
      return
    }
    dispatch(loginUser(formData))
  }

  const handleClose = () => {
    document.body.style.overflow = 'unset'
    navigate('/')
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        p: { xs: 2, sm: 3 },
        overflow: 'hidden',
      }}
      onClick={handleClose}
    >
      <Fade in>
        <Paper
          onClick={(e) => e.stopPropagation()}
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden',
            // Top accent border
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #059669 100%)',
            },
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: '#94a3b8',
              '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Header */}
          <Box sx={{ textAlign: 'center', pt: 4, pb: 2, px: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#ecfdf5',
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5, fontSize: '1.25rem' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              Login to continue earning
            </Typography>
          </Box>

          {/* Alerts */}
          {verified === 'true' && (
            <Box sx={{ mx: 3, mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#ecfdf5', color: '#059669', fontSize: '0.8rem', textAlign: 'center' }}>
              Email verified! You can now log in.
            </Box>
          )}
          {verificationError && (
            <Box sx={{ mx: 3, mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#fef2f2', color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>
              {verificationError}
            </Box>
          )}
          <Box sx={{ mx: 3, mb: 1 }}>
            <ErrorAlert message={error} onClose={() => dispatch(clearError())} />
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ px: 3, pb: 2 }}>
            <InputField
              label="Email or Username"
              name="email_or_username"
              placeholder="Enter email or username"
              value={formData.email_or_username}
              onChange={handleChange}
              required
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Forgot Links */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Link to="/forgot-username" style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Username?
              </Link>
              <Link to="/forgot-password" style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </Box>

            {/* CAPTCHA */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                mb: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1, fontWeight: 600 }}>
                Security Check
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '1rem',
                    letterSpacing: 1,
                    userSelect: 'none',
                    bgcolor: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  {captcha.num1} + {captcha.num2} = ?
                </Typography>
                <Typography
                  component="span"
                  onClick={regenerateCaptcha}
                  sx={{ color: '#10b981', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                >
                  Refresh
                </Typography>
              </Box>
              <InputField
                label="Your answer"
                name="captcha"
                value={captcha.userAnswer}
                onChange={handleCaptchaChange}
                required
                helperText={captchaError}
                error={!!captchaError}
                size="small"
              />
            </Box>

            <Button type="submit" loading={loading}>
              Login
            </Button>
          </Box>

          <Divider sx={{ borderColor: '#e2e8f0' }} />

          {/* Bottom */}
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              New to WABCASH?{' '}
              <Link to="/register" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  )
}

export default LoginPage