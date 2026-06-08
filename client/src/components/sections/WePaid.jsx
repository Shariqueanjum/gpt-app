import { Box, Typography, Container, Paper } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Fake stats — replace with real API data later
const stats = [
  { label: 'Total Paid Out', value: '$0.00', color: '#10b981' },
  { label: 'Active Users', value: '0', color: '#3b82f6' },
  { label: 'Daily Payouts', value: '0', color: '#f59e0b' },
]

// Fake recent payouts — replace with real data later
const recentPayouts = [
  { user: 'User #1', amount: '$0.00', method: 'PayPal', time: 'Just now' },
  { user: 'User #2', amount: '$0.00', method: 'BTC', time: 'Just now' },
  { user: 'User #3', amount: '$0.00', method: 'Amazon GC', time: 'Just now' },
  { user: 'User #4', amount: '$0.00', method: 'PayPal', time: 'Just now' },
  { user: 'User #5', amount: '$0.00', method: 'ETH', time: 'Just now' },
]

const WePaid = () => {
  return (
    <Box
      id="we-paid"
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
            PROOF OF PAYMENT
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
            We Paid
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
            Real users, real earnings, real payouts. Join the community today.
          </Typography>
        </Box>

        {/* Stats Row */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            justifyContent: 'center',
            mb: { xs: 8, md: 10 },
          }}
        >
          {stats.map((stat, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                flex: 1,
                maxWidth: { sm: 240 },
                p: 4,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px -15px ${stat.color}15`,
                  borderColor: `${stat.color}40`,
                },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: stat.color,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                }}
              >
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Recent Payouts Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}
            >
              Recent Payouts
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {recentPayouts.map((payout, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 2.5,
                  px: { xs: 1, md: 2 },
                  borderBottom: idx < recentPayouts.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#f8fafc', px: 3 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {payout.user[0]}
                  </Box>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}
                    >
                      {payout.user}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      via {payout.method}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}
                  >
                    {payout.amount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {payout.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default WePaid