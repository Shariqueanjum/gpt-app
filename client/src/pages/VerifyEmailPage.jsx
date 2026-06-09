import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Container, Paper, Typography, Box, Button, Fade } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import EmailIcon from '@mui/icons-material/Email'
import LoginIcon from '@mui/icons-material/Login'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const success = searchParams.get('success')  // BACKEND USES "success"
  const error = searchParams.get('error')
  const isSuccess = success === 'true'

  // Auto-redirect to login after 5 seconds on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login?verified=true')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px -15px rgba(0,0,0,0.08)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: isSuccess
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #059669 100%)'
                  : 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #dc2626 100%)',
              },
            }}
          >
            {isSuccess ? (
              <>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: '50%',
                      border: '2px solid #10b981',
                      opacity: 0.3,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                        '50%': { transform: 'scale(1.1)', opacity: 0.1 },
                      },
                    }}
                  />
                </Box>

                <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  You're All Set!
                </Typography>

                <Typography variant="body1" sx={{ color: '#64748b', mb: 1, lineHeight: 1.7, maxWidth: 360, mx: 'auto' }}>
                  Your email has been verified successfully. Your account is now active.
                </Typography>

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#ecfdf5',
                    color: '#059669',
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    mb: 3,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 16 }} />
                  Ready to earn rewards
                </Box>

                <Button
                  component={Link}
                  to="/login?verified=true"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<LoginIcon />}
                  sx={{
                    bgcolor: '#10b981',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                    '&:hover': {
                      bgcolor: '#059669',
                      boxShadow: '0 12px 28px rgba(16,185,129,0.35)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Continue to Login
                </Button>

                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 2 }}>
                  Redirecting automatically in 5 seconds...
                </Typography>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: '#fef2f2',
                    color: '#ef4444',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <ErrorIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  Verification Failed
                </Typography>

                <Typography variant="body1" sx={{ color: '#64748b', mb: 2, lineHeight: 1.7, maxWidth: 360, mx: 'auto' }}>
                  {decodeURIComponent(error || '') || 'This verification link is invalid or has expired.'}
                </Typography>

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#fef2f2',
                    color: '#dc2626',
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    mb: 3,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <ErrorIcon sx={{ fontSize: 16 }} />
                  Link expired or invalid
                </Box>

                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    bgcolor: '#10b981',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  Register Again
                </Button>
              </>
            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}

export default VerifyEmailPage