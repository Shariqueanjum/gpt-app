import { Box, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { APP_NAME, APP_TAGLINE } from '../../utils/constants'

const Hero = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Box
      id="home"
      sx={{
        bgcolor: '#ffffff',        // CHANGED: White instead of mint
        color: '#0f172a',
        pt: { xs: '120px', md: '160px' },
        pb: { xs: '60px', md: '100px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Very subtle gray decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226,232,240,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 6, md: 8 },
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* LEFT: Text */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="overline"
              sx={{
                color: '#10b981',
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: '0.8rem',
                mb: 2,
                display: 'block',
              }}
            >
              EARN REAL CASH ONLINE
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.6rem', lg: '4.2rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 3,
                letterSpacing: '-0.03em',
                color: '#0f172a',
              }}
            >
              {APP_NAME}
            </Typography>

            <Typography
              variant="h6"
              component="p"
              sx={{
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                color: '#64748b',
                maxWidth: 520,
                lineHeight: 1.6,
                mb: 4,
                mx: { xs: 'auto', md: 0 },
                fontWeight: 400,
              }}
            >
              {APP_TAGLINE}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/register"
                    size="large"
                    sx={{
                      bgcolor: '#10b981',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                      '&:hover': {
                        bgcolor: '#059669',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 28px rgba(16,185,129,0.35)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Get Started — It's Free
                  </Button>

                  <Button
                    variant="outlined"
                    component={Link}
                    to="/login"
                    size="large"
                    sx={{
                      color: '#0f172a',
                      borderColor: '#e2e8f0',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#10b981',
                        color: '#10b981',
                        bgcolor: 'rgba(16,185,129,0.04)',
                      },
                    }}
                  >
                    Already a Member?
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  to="/dashboard"
                  size="large"
                  sx={{
                    bgcolor: '#10b981',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Go to Dashboard
                </Button>
              )}
            </Box>
          </Box>

          {/* RIGHT: GIF Placeholder */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: { xs: '100%', md: 560 },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src="/images/hero-gif.gif"
              alt="WABCASH Platform Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: { xs: 300, md: 420 },
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Hero