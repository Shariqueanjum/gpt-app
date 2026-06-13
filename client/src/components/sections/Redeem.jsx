// client/src/components/sections/Redeem.jsx
import { Box, Typography, Paper, Container } from '@mui/material'
import { useState } from 'react'

const UPIIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#5312bc"/>
    <text x="50" y="58" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="32">UPI</text>
  </svg>
)

const NetBankingIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#006e2f"/>
    <path d="M50 20L20 40H30V75H45V55H55V75H70V40H80L50 20Z" fill="white"/>
  </svg>
)

const PayPalIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#003087"/>
    <text x="50" y="62" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28">PP</text>
  </svg>
)

const CryptoIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#F7931A"/>
    <text x="50" y="65" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="42">₿</text>
  </svg>
)

const GooglePlayIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="url(#playGrad)"/>
    <defs>
      <linearGradient id="playGrad" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#34a853"/>
        <stop offset="50%" stopColor="#fbbc04"/>
        <stop offset="100%" stopColor="#ea4335"/>
      </linearGradient>
    </defs>
    <polygon points="35,25 75,50 35,75 35,25" fill="white"/>
  </svg>
)

const GiftCardIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#E03110"/>
    <rect x="20" y="35" width="60" height="40" rx="6" fill="white" fillOpacity="0.9"/>
    <rect x="20" y="25" width="60" height="15" rx="6" fill="white" fillOpacity="0.6"/>
    <circle cx="50" cy="55" r="8" fill="#E03110" fillOpacity="0.2"/>
    <path d="M46 55L49 58L54 52" stroke="#E03110" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const paymentMethods = [
  { name: 'UPI', min: '$1.00', Icon: UPIIcon, color: '#5312bc' },
  { name: 'NetBanking', min: '$5.00', Icon: NetBankingIcon, color: '#006e2f' },
  { name: 'PayPal', min: '$5.00', Icon: PayPalIcon, color: '#003087' },
  { name: 'Crypto', min: '$10.00', Icon: CryptoIcon, color: '#F7931A' },
  { name: 'Google Play', min: '$1.00', Icon: GooglePlayIcon, color: '#34a853' },
  { name: 'Gift Card', min: '$1.00', Icon: GiftCardIcon, color: '#E03110' },
]

const stats = [
  { value: '$0.50', label: 'Min. Withdrawal', color: '#5312bc' },
  { value: '24h', label: 'Avg. Processing', color: '#006e2f' },
  { value: '0%', label: 'Hidden Fees', color: '#623c00' },
]

const Redeem = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <Box
      component="section"
      id="redeem"
      sx={{
        position: 'relative',
        pt: { xs: 6, md: 8 },
        pb: { xs: 8, md: 10 },
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 60% 50% at 10% 80%, rgba(0, 110, 47, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 90% 20%, rgba(83, 18, 188, 0.05) 0%, transparent 50%),
          #f2f3ff
        `,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107, 56, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '8%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 110, 47, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header — Centered */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontSize: { xs: '28px', md: '36px' },
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#131b2e',
              mb: 2,
            }}
          >
            How to Withdraw
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              lineHeight: 1.5,
              color: '#1f2937',
              fontWeight: 500,
              maxWidth: 560,
              mx: 'auto',
              mb: 3,
            }}
          >
            Instant payouts through the world's most trusted platforms. No waiting, no hidden fees.
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              px: 4,
              py: 2,
              borderRadius: '9999px',
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: '#006e2f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}
            >
              ✓
            </Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#131b2e',
              }}
            >
              Payout Verified
            </Typography>
          </Box>
        </Box>

        {/* Horizontal Carousel — NO NUMBERS */}
        <Box
          sx={{
            position: 'relative',
            mx: { xs: -2, md: 0 },
            mb: 6,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 3 },
              overflowX: 'auto',
              overflowY: 'hidden',
              px: { xs: 2, md: 0 },
              py: 2,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              cursor: 'grab',
              scrollBehavior: 'smooth',
              touchAction: 'pan-x',
            }}
          >
            {paymentMethods.map((method, idx) => {
              const IconComponent = method.Icon
              return (
                <Paper
                  key={idx}
                  elevation={0}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  sx={{
                    flex: '0 0 auto',
                    width: { xs: 160, sm: 180, md: 200 },
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(203, 195, 215, 0.25)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredIndex === idx ? 'translateY(-8px) scale(1.05)' : 'none',
                    boxShadow: hoveredIndex === idx
                      ? '0 20px 40px -12px rgba(83, 18, 188, 0.15)'
                      : '0 4px 12px rgba(0,0,0,0.04)',
                    '&:hover': {
                      borderColor: 'rgba(83, 18, 188, 0.15)',
                      '& .method-icon': {
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  {/* Icon area — clean, no numbers */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: { xs: 140, sm: 160, md: 180 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                    }}
                  >
                    <Box
                      className="method-icon"
                      sx={{
                        width: { xs: 60, md: 72 },
                        height: { xs: 60, md: 72 },
                        bgcolor: '#fff',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        p: 1,
                      }}
                    >
                      <IconComponent />
                    </Box>
                  </Box>

                  {/* Text */}
                  <Box sx={{ p: { xs: 2, md: 2.5 }, pt: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Sora", sans-serif',
                        fontSize: { xs: '13px', md: '14px' },
                        fontWeight: 700,
                        color: '#131b2e',
                        mb: 0.5,
                      }}
                    >
                      {method.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#7b7486',
                      }}
                    >
                      {method.min} Min
                    </Typography>
                  </Box>
                </Paper>
              )
            })}
          </Box>
        </Box>

        {/* Stats Row */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 2, md: 4 },
          }}
        >
          {stats.map((stat, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2.5,
                borderRadius: '9999px',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(203, 195, 215, 0.2)',
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: stat.color,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: '"Sora", sans-serif',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#7b7486',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default Redeem