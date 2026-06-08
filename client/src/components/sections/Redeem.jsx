import { Box, Typography, Container, Paper } from '@mui/material'

const paymentMethods = [
  { name: 'PayPal', color: '#003087', bg: '#eff6ff' },
  { name: 'Bitcoin', color: '#f7931a', bg: '#fffbeb' },
  { name: 'Gift Cards', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Bank Transfer', color: '#6366f1', bg: '#eef2ff' },
  { name: 'Ethereum', color: '#627eea', bg: '#eff6ff' },
  { name: 'Litecoin', color: '#345d9d', bg: '#f0f5ff' },
]

const Redeem = () => {
  return (
    <Box
      id="redeem"
      sx={{
        bgcolor: '#f8fafc',
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
            CASHOUT OPTIONS
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
            Redeem Your Earnings
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
            Choose from multiple payout options. Your earnings, your rules.
          </Typography>
        </Box>

        {/* Main Content: Mobile = GIF first, Desktop = Text left + GIF right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: 'center',
            gap: { xs: 8, md: 10 },
          }}
        >
          {/* LEFT: Payment Methods Grid */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              {paymentMethods.map((method, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px -8px rgba(0,0,0,0.08)',
                      borderColor: method.color + '40',
                    },
                  }}
                >
                  {/* Icon Placeholder — replace with actual image later */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: method.bg,
                      color: method.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: '1.3rem',
                      fontWeight: 800,
                    }}
                  >
                    {method.name[0]}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      fontSize: '0.9rem',
                    }}
                  >
                    {method.name}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Stats row */}
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                mt: 4,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                  $0.50
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Min. Withdrawal
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                  24h
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Avg. Processing
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* RIGHT: GIF Placeholder */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: { xs: '100%', md: 480 },
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: 4,
                bgcolor: '#e2e8f0',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '0.9rem',
              }}
            >
              Redeem GIF Here
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Redeem