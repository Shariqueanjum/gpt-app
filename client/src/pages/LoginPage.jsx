import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Alert,
  Fade,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { loginUser, clearError, clearMessage } from '../slices/authSlice'
import InputField from '../components/common/InputField'
import Button from '../components/common/Button'
import ErrorAlert from '../components/common/ErrorAlert'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({ email: '', password: '' })

  const searchParams = new URLSearchParams(location.search)
  const verified = searchParams.get('verified')
  const verificationError = searchParams.get('error')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    return () => { dispatch(clearError()); dispatch(clearMessage()) }
  }, [isAuthenticated, navigate, dispatch])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleSubmit = (e) => { e.preventDefault(); dispatch(loginUser(formData)) }

  const handleClose = () => navigate('/')

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
            Welcome Back
          </Typography>

          <Typography variant="body2" align="center" sx={{ mb: 4, color: '#64748b' }}>
            Login to continue earning rewards.
          </Typography>

          {verified === 'true' && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Email verified successfully. You can now login.
            </Alert>
          )}

          {verificationError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {verificationError}
            </Alert>
          )}

          <ErrorAlert message={error} onClose={() => dispatch(clearError())} />

          <Box component="form" onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" loading={loading}>
              Login
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  )
}

export default LoginPage