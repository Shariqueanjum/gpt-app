import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Fade,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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

  useEffect(() => { if (isAuthenticated) navigate('/dashboard') }, [isAuthenticated, navigate])
  useEffect(() => { return () => { dispatch(clearError()); dispatch(clearMessage()) } }, [dispatch])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleSubmit = (e) => { e.preventDefault(); dispatch(registerUser(formData)) }

  const handleClose = () => navigate('/')

  // SUCCESS STATE — Show "Check Your Email" instead of form
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
          bgcolor: 'rgba(15, 23, 42, 0.5)',
          p: 2,
        }}
        onClick={handleClose}
      >
        <Fade in>
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 440,
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </Box>

            <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#0f172a' }}>
              Check Your Email
            </Typography>

            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, lineHeight: 1.7 }}>
              We've sent a verification link to <strong>{formData.email}</strong>. Click the link to activate your account.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
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
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(16,185,129,0.04)',
                    borderColor: '#059669',
                  },
                }}
              >
                Resend Email
              </Button>

              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                Check your spam folder if you don't see it.
              </Typography>
            </Box>
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
        bgcolor: 'rgba(15, 23, 42, 0.5)',
        p: 2,
        overflow: 'auto',
      }}
      onClick={handleClose}
    >
      <Fade in>
        <Paper
          onClick={(e) => e.stopPropagation()}
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#94a3b8',
              '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 1, color: '#0f172a' }}>
            Create Account
          </Typography>

          <Typography variant="body2" align="center" sx={{ mb: 4, color: '#64748b' }}>
            Start earning rewards by completing surveys and offers.
          </Typography>

          <ErrorAlert message={error} onClose={() => dispatch(clearError())} />

          <Box component="form" onSubmit={handleSubmit}>
            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} required />
            <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <InputField label="Referral Code (Optional)" name="referred_by_code" value={formData.referred_by_code} onChange={handleChange} />

            <Button type="submit" loading={loading}>
              Create Account
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
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