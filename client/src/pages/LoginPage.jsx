// client/src/pages/LoginPage.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../slices/authSlice'
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Paper,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloseIcon from '@mui/icons-material/Close'

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [securityQuestion, setSecurityQuestion] = useState({
    num1: 0,
    num2: 0,
    operator: '+',
    answer: '',
    userAnswer: '',
  })

  // Generate random math question
  const generateSecurityQuestion = () => {
    const operators = ['+', '-']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    let num1 = Math.floor(Math.random() * 20) + 1
    let num2 = Math.floor(Math.random() * 20) + 1

    // Ensure no negative answers for subtraction
    if (operator === '-' && num2 > num1) {
      [num1, num2] = [num2, num1]
    }

    let answer
    if (operator === '+') answer = num1 + num2
    else answer = num1 - num2

    setSecurityQuestion({
      num1,
      num2,
      operator,
      answer,
      userAnswer: '',
    })
  }

  useEffect(() => {
    generateSecurityQuestion()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSecurityAnswer = (e) => {
    setSecurityQuestion({
      ...securityQuestion,
      userAnswer: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (parseInt(securityQuestion.userAnswer) !== securityQuestion.answer) {
      alert('Incorrect security answer. Please try again.')
      generateSecurityQuestion()
      return
    }

    dispatch(loginUser(formData))
  }

  const handleClose = () => {
    navigate('/')
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // NO blur — homepage visible but darkened slightly
        bgcolor: 'rgba(0, 0, 0, 0.5)',
      }}
      // Prevent scrolling on the background
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 2,
          p: { xs: 4, md: 5 },
          borderRadius: '24px',
          bgcolor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#7b7486',
            '&:hover': { color: '#131b2e' },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontSize: '28px',
              fontWeight: 800,
              color: '#131b2e',
              mb: 1,
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '15px',
              color: '#7b7486',
            }}
          >
            Sign in to continue earning rewards
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                bgcolor: '#f8fafc',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#5312bc' },
                '&.Mui-focused fieldset': { borderColor: '#5312bc' },
              },
              '& .MuiInputLabel-root': {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                color: '#7b7486',
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#7b7486' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                bgcolor: '#f8fafc',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#5312bc' },
                '&.Mui-focused fieldset': { borderColor: '#5312bc' },
              },
              '& .MuiInputLabel-root': {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                color: '#7b7486',
              },
            }}
          />

          {/* Security Question */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '12px',
              bgcolor: '#f2f3ff',
              border: '1px solid rgba(83, 18, 188, 0.1)',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#5312bc',
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Security Check
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#131b2e',
                  whiteSpace: 'nowrap',
                }}
              >
                {securityQuestion.num1} {securityQuestion.operator} {securityQuestion.num2} = ?
              </Typography>
              <TextField
                size="small"
                type="number"
                value={securityQuestion.userAnswer}
                onChange={handleSecurityAnswer}
                required
                placeholder="?"
                sx={{
                  width: 80,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontFamily: '"Sora", sans-serif',
                    fontWeight: 700,
                    textAlign: 'center',
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#5312bc' },
                  },
                }}
              />
              <IconButton
                onClick={generateSecurityQuestion}
                sx={{
                  color: '#5312bc',
                  bgcolor: 'rgba(83, 18, 188, 0.08)',
                  '&:hover': { bgcolor: 'rgba(83, 18, 188, 0.15)' },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              bgcolor: '#5312bc',
              color: '#fff',
              borderRadius: '9999px',
              py: 1.8,
              fontFamily: '"Sora", sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(83, 18, 188, 0.3)',
              '&:hover': { bgcolor: '#6b38d4' },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography
              component={Link}
              to="/forgot-password"
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '14px',
                color: '#5312bc',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot password?
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              pt: 2,
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '14px',
                color: '#7b7486',
              }}
            >
              Don't have an account?{' '}
              <Box
                component={Link}
                to="/register"
                sx={{
                  color: '#5312bc',
                  textDecoration: 'none',
                  fontWeight: 700,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create one
              </Box>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage