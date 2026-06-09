import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Fade,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import { registerUser, clearError, clearMessage } from '../slices/authSlice'
import InputField from '../components/common/InputField'
import Button from '../components/common/Button'
import ErrorAlert from '../components/common/ErrorAlert'

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    referred_by_code: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [agreeError, setAgreeError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearMessage())
    }
  }, [dispatch])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleAgreeChange = (e) => {
    setAgreed(e.target.checked)
    setAgreeError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!agreed) {
      setAgreeError('You must agree to continue.')
      return
    }
    dispatch(registerUser(formData))
  }

  const handleClose = () => {
    document.body.style.overflow = 'unset'
    navigate('/')
  }

  // SUCCESS STATE
  if (message) {
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
              textAlign: 'center',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #059669 100%)',
              },
              position: 'relative',
              pt: 4,
              pb: 3,
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#ecfdf5',
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </Box>

            <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>
              Check Your Email
            </Typography>

            <Typography variant="body2" sx={{ color: '#64748b', mb: 4, lineHeight: 1.6 }}>
              We sent a verification link to <strong>{formData.email}</strong>. Click it to activate your account.
            </Typography>

            <Button
              onClick={() => {
                dispatch(clearMessage())
                window.location.reload()
              }}
              variant="outlined"
              sx={{
                color: '#10b981',
                borderColor: '#10b981',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.2,
                '&:hover': {
                  bgcolor: 'rgba(16,185,129,0.04)',
                  borderColor: '#059669',
                },
              }}
            >
              Resend Email
            </Button>

            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 2 }}>
              Check spam folder if not found.
            </Typography>
          </Paper>
        </Fade>
      </Box>
    )
  }

  // FORM STATE
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
              <PersonAddOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5, fontSize: '1.25rem' }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              Start earning in 60 seconds
            </Typography>
          </Box>

          <Box sx={{ mx: 3, mb: 1 }}>
            <ErrorAlert message={error} onClose={() => dispatch(clearError())} />
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ px: 3, pb: 2 }}>
            <InputField
              label="Username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <InputField
              label="Email Address"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Min 8 chars, uppercase, number, symbol"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <InputField
              label="Referral Code (Optional)"
              name="referred_by_code"
              placeholder="Have a code?"
              value={formData.referred_by_code}
              onChange={handleChange}
            />

            {/* Terms Checkbox */}
            <Box sx={{ mt: 1, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreed}
                    onChange={handleAgreeChange}
                    sx={{
                      color: '#cbd5e1',
                      '&.Mui-checked': { color: '#10b981' },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
                  </Typography>
                }
                sx={{ alignItems: 'flex-start' }}
              />
              {agreeError && (
                <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
                  {agreeError}
                </Typography>
              )}
            </Box>

            <Button type="submit" loading={loading}>
              Create Account
            </Button>
          </Box>

          <Divider sx={{ borderColor: '#e2e8f0' }} />

          {/* Bottom */}
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  )
}

export default RegisterPage