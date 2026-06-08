import { Box, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const FinalCTA = () => {
  return (
    <Box
      sx={{
        bgcolor: '#f0fdf4',        // Light mint — matches Hero, not dark
        color: '#0f172a',
        py: { xs: 12, md: 16 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle white glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.8rem', md: '2.8rem' },
            mb: 3,
            color: '#0f172a',
          }}
        >
          Ready to Start Earning?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            fontSize: { xs: '1rem', md: '1.1rem' },
            mb: 5,
            maxWidth: 480,
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          Join thousands of users earning daily rewards. It takes less than 60 seconds to get started.
        </Typography>

        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/register"
          sx={{
            bgcolor: '#10b981',
            color: 'white',
            px: 6,
            py: 1.8,
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(16,185,129,0.25)',
            '&:hover': {
              bgcolor: '#059669',
              transform: 'translateY(-3px)',
              boxShadow: '0 15px 40px rgba(16,185,129,0.35)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Create Free Account
        </Button>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 2, md: 4 },
            justifyContent: 'center',
            mt: 5,
            flexWrap: 'wrap',
          }}
        >
          {['No hidden fees', 'Instant withdrawals', '24/7 support'].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
              <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                {item}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default FinalCTA