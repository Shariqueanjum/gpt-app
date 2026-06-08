import { Box, Typography, Container, Paper } from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import SecurityIcon from '@mui/icons-material/Security'
import PaymentsIcon from '@mui/icons-material/Payments'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

const features = [
  {
    icon: <SpeedIcon sx={{ fontSize: 28 }} />,
    title: 'Instant Rewards',
    desc: 'No waiting weeks for your money. Most withdrawals processed within hours, not days.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 28 }} />,
    title: 'Bank-Level Security',
    desc: 'Your data is encrypted end-to-end. We never sell your information to third parties.',
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 28 }} />,
    title: 'High Payouts',
    desc: 'Industry-leading rewards per survey. Earn more with every task you complete.',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
    title: 'Daily Bonuses',
    desc: 'Earn bonus coins with daily streaks, giveaways, and referral rewards.',
  },
]

const WhyChooseUs = () => {
  return (
    <Box
      id="why-choose-us"
      sx={{
        bgcolor: '#ffffff',
        py: { xs: 10, md: 14 },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
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
            TRUSTED PLATFORM
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              mb: 2,
            }}
          >
            Why Choose WABCASH?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: { xs: '1rem', md: '1.1rem' },
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Trusted by thousands of users worldwide since 2024.
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          {features.map((feature, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#10b981',
                  boxShadow: '0 10px 30px -10px rgba(16,185,129,0.1)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  bgcolor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                {feature.icon}
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  mb: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  lineHeight: 1.7,
                }}
              >
                {feature.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default WhyChooseUs