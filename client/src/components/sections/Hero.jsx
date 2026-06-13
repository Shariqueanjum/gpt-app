// client/src/components/sections/Hero.jsx
import { Box, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const words = ['cash', 'rewards', 'gift cards', 'crypto']

const HeroTypingWord = () => {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]
    let timeout

    if (!isDeleting) {
      if (text.length < currentWord.length) {
        timeout = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1))
        }, 90)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 1500)
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(currentWord.slice(0, text.length - 1))
        }, 45)
      } else {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % words.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex])

  return (
    <Typography
      component="span"
      sx={{
        color: '#5312bc',
        fontFamily: '"Sora", sans-serif',
        fontWeight: 800,
        lineHeight: 1.05,
        letterSpacing: '-0.03em',
        fontSize: { xs: '2.3rem', sm: '2.8rem', md: '3.4rem', lg: '4rem' },
        minWidth: { xs: '6ch', md: '12ch' },
        textAlign: 'left',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      <Box component="span" sx={{ animation: 'blink 1s infinite', '@keyframes blink': { '50%': { opacity: 0 } } }}>
        |
      </Box>
    </Typography>
  )
}

// Simple dashboard preview — NOT a phone frame, just a floating UI card
const HeroVisual = () => {
  const [balance, setBalance] = useState(0)
  const targetBalance = 142.5

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = targetBalance / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= targetBalance) {
        setBalance(targetBalance)
        clearInterval(timer)
      } else {
        setBalance(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Soft glow behind */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 280, md: 400 },
          height: { xs: 280, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(83,18,188,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Main floating card — looks like a dashboard preview, NOT a phone */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          bgcolor: '#ffffff',
          borderRadius: '24px',
          p: { xs: 3, md: 4 },
          boxShadow: '0 25px 80px -20px rgba(83,18,188,0.15), 0 10px 30px -10px rgba(0,0,0,0.1)',
          border: '1px solid rgba(203,195,215,0.3)',
          animation: 'floatCard 6s ease-in-out infinite',
          '@keyframes floatCard': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        {/* Card Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography sx={{ fontFamily: '"Sora", sans-serif', fontSize: '12px', fontWeight: 600, color: '#7b7486', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Balance
            </Typography>
            <Typography sx={{ fontFamily: '"Sora", sans-serif', fontSize: '32px', fontWeight: 800, color: '#131b2e', lineHeight: 1.2 }}>
              ${balance.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: 'rgba(83,18,188,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5312bc',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.93c1.86.43 2.98 1.81 3.15 3.47H14.5c-.12-.95-.72-1.87-2.44-1.87-1.57 0-2.39.74-2.39 1.54 0 .78.56 1.39 2.67 1.91 2.49.63 4.18 1.71 4.18 3.91 0 1.92-1.43 3.08-3.11 3.4z" fill="currentColor" />
            </svg>
          </Box>
        </Box>

        {/* Mini chart bars */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 3, height: 60 }}>
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: `${h}%`,
                borderRadius: '4px',
                bgcolor: i === 11 ? '#5312bc' : 'rgba(83,18,188,0.15)',
                transition: 'height 0.3s ease',
              }}
            />
          ))}
        </Box>

        {/* Recent activity items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: 'A.I Survey ', amount: '+$2.50', color: '#006e2f' },
            { label: 'Daily Offer', amount: '+$5.00', color: '#006e2f' },
            { label: 'Daily Bonus', amount: '+$0.50', color: '#623c00' },
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: '#131b2e' }}>
                  {item.label}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Sora", sans-serif', fontSize: '13px', fontWeight: 700, color: item.color }}>
                {item.amount}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Floating badge — payout notification */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -16,
            left: -16,
            bgcolor: '#ffffff',
            borderRadius: '16px',
            p: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            border: '1px solid rgba(203,195,215,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            animation: 'floatBadge 4s ease-in-out infinite',
            '@keyframes floatBadge': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-6px)' },
            },
          }}
        >
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(0,110,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006e2f' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '11px', color: '#7b7486', fontWeight: 500 }}>
              Instant Payout
            </Typography>
            <Typography sx={{ fontFamily: '"Sora", sans-serif', fontSize: '13px', fontWeight: 700, color: '#131b2e' }}>
              +$25.00 Received
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const Hero = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Box
      id="home"
      sx={{
        backgroundColor: '#faf8ff',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(107,56,212,0.07) 0px, transparent 52%),
          radial-gradient(at 100% 100%, rgba(151,244,165,0.06) 0px, transparent 52%)
        `,
        // REDUCED padding — less empty space
        pt: { xs: '80px', sm: '90px', md: '100px' },
        pb: { xs: '60px', sm: '70px', md: '90px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 6, md: 8, lg: 10 },
            alignItems: 'center',
          }}
        >
          {/* LEFT: Copy */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              gap: 0,
            }}
          >
            {/* Pill badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(83,18,188,0.07)',
                border: '1px solid rgba(83,18,188,0.12)',
                borderRadius: 99,
                px: 2,
                py: 0.9,
                mb: 3,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#006e2f' }} />
              <Typography
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#5312bc',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Surveys Paying Right Now
              </Typography>
            </Box>

            {/* H1 */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: '#131b2e',
                  fontSize: { xs: '2.3rem', sm: '2.8rem', md: '3.4rem', lg: '4rem' },
                }}
              >
                Turn Your Opinions
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  mt: 0.5,
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Sora", sans-serif',
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    color: '#131b2e',
                    fontSize: { xs: '2.3rem', sm: '2.8rem', md: '3.4rem', lg: '4rem' },
                  }}
                >
                  into
                </Typography>
                <HeroTypingWord />
              </Box>
            </Box>

            {/* Body */}
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: { xs: '1.1rem', md: '1.2rem' },     // bigger
                lineHeight: 1.5,
                color: '#1f2937',                               // almost black — maximum readability
                maxWidth: 500,
                mb: 4,
                fontWeight: 500,
              }}
            >Complete short surveys, test products, and share your feedback — then cash out to PayPal, UPI, crypto, or gift cards. No experience needed.
            </Typography>

            {/* CTA buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' },
                mb: 4,
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
                      background: 'linear-gradient(135deg, #5312bc 0%, #6b38d4 100%)',
                      color: 'white',
                      px: { xs: 3, md: 4 },
                      py: 1.7,
                      fontSize: '1rem',
                      fontFamily: '"Sora", sans-serif',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 99,
                      boxShadow: '0 8px 28px rgba(83,18,188,0.38)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6b38d4 0%, #5312bc 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 14px 36px rgba(83,18,188,0.45)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Start Earning Free
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/login"
                    size="large"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.7)',
                      color: '#131b2e',
                      borderColor: '#cbc3d7',
                      px: { xs: 3, md: 4 },
                      py: 1.7,
                      fontSize: '1rem',
                      fontFamily: '"Sora", sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 99,
                      '&:hover': {
                        bgcolor: '#f2f3ff',
                        borderColor: '#5312bc',
                        color: '#5312bc',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  to="/dashboard"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #5312bc 0%, #6b38d4 100%)',
                    color: 'white',
                    px: 4,
                    py: 1.7,
                    fontSize: '1rem',
                    fontFamily: '"Sora", sans-serif',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 99,
                    boxShadow: '0 8px 28px rgba(83,18,188,0.38)',
                    '&:hover': { background: 'linear-gradient(135deg, #6b38d4 0%, #5312bc 100%)' },
                  }}
                >
                  Go to Dashboard
                </Button>
              )}
            </Box>

            {/* Trust signals */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, md: 3 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
                pt: 2.5,
                borderTop: '1px solid rgba(203,195,215,0.35)',
                width: '100%',
              }}
            >
              {['No credit card needed', 'Instant withdrawals', 'Free forever'].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#006e2f' }} />
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '0.75rem',
                      color: '#494454',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* RIGHT: Dashboard visual */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <HeroVisual />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Hero