import { Link, useSearchParams } from 'react-router-dom'
import { Container, Paper, Typography, Box, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const error = searchParams.get('error')
  const isSuccess = success === 'true'

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
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
          }}
        >
          {isSuccess ? (
            <>
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
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Box>

              <Typography variant="h4" fontWeight={800} sx={{ mb: 2, color: '#0f172a' }}>
                Email Verified!
              </Typography>

              <Typography variant="body1" sx={{ color: '#64748b', mb: 4, lineHeight: 1.7 }}>
                Your email has been successfully verified. You can now login and start earning rewards.
              </Typography>

              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: '#10b981',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1.5,
                  boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                  '&:hover': {
                    bgcolor: '#059669',
                    boxShadow: '0 12px 28px rgba(16,185,129,0.35)',
                  },
                }}
              >
                Continue to Login
              </Button>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <ErrorIcon sx={{ fontSize: 40 }} />
              </Box>

              <Typography variant="h4" fontWeight={800} sx={{ mb: 2, color: '#0f172a' }}>
                Verification Failed
              </Typography>

              <Typography variant="body1" sx={{ color: '#64748b', mb: 2, lineHeight: 1.7 }}>
                {error || 'This verification link is invalid or has expired.'}
              </Typography>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>
                Please try registering again or request a new verification email.
              </Typography>

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
                Go to Register
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default VerifyEmailPage