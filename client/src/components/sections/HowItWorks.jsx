import { Box, Typography, Container, Paper } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'

const steps = [
  {
    icon: <PersonAddIcon sx={{ fontSize: 24 }} />,
    title: 'Create Account',
    desc: 'Sign up in seconds with your email. No credit card required, no hidden fees.',
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 24 }} />,
    title: 'Complete Surveys',
    desc: 'Pick from hundreds of daily surveys and offers tailored to your profile.',
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 24 }} />,
    title: 'Cash Out',
    desc: 'Withdraw your earnings instantly via PayPal, crypto, or gift cards.',
  },
]

const HowItWorks = () => {
  return (
    <Box
      id="how-it-works"
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
            SIMPLE PROCESS
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            How It Works
          </Typography>
        </Box>

        {/* Steps */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 0, md: 4 },
          }}
        >
          {steps.map((step, idx) => (
            <Box key={idx} sx={{ flex: 1 }}>
              {/* Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#10b981',
                    boxShadow: '0 10px 30px -10px rgba(16,185,129,0.1)',
                  },
                }}
              >
                {/* Top Row: Icon Left, Number Right */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  {/* Icon Circle */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>

                  {/* Step Number Badge */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: '#10b981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    0{idx + 1}
                  </Box>
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
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </Typography>
              </Paper>

              {/* Mobile: Vertical line between cards */}
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    justifyContent: 'center',
                    py: 2,
                  }}
                >
                  <Box sx={{ width: 2, height: 32, bgcolor: '#e2e8f0' }} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default HowItWorks