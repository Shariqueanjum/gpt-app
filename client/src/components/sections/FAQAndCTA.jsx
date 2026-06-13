// client/src/components/sections/FAQAndCTA.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Paper,
  Container,
  Collapse,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const faqs = [
  {
    question: 'How do I start earning on WABCASH?',
    answer: 'Simply create a free account, verify your email, and complete your profile. Once done, browse available offers, surveys, and tasks. Each completed task credits your balance instantly.',
  },
  {
    question: 'What is the minimum withdrawal amount?',
    answer: 'The minimum withdrawal starts at just $0.50 for UPI and Google Play gift cards. PayPal and NetBanking require $5.00 minimum, while crypto withdrawals start at $10.00.',
  },
  {
    question: 'Is my personal data safe with WABCASH?',
    answer: 'Absolutely. We use 256-bit SSL encryption, bank-grade security protocols, and device fingerprinting. We are GDPR compliant and never sell your information.',
  },
  {
    question: 'How does the referral program work?',
    answer: 'Share your unique referral link with friends. You earn 10% of everything they make — forever. There is no cap on referral earnings.',
  },
]

const FAQAndCTA = () => {
  const [openIndexes, setOpenIndexes] = useState([])
  const { isAuthenticated } = useSelector((state) => state.auth)

  const handleToggle = (idx) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  return (
    <Box id='faq' component="section">
      {/* ========== FAQ SECTION ========== */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
          overflow: 'hidden',
          bgcolor: '#faf8ff',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: { xs: '28px', md: '40px' },
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#131b2e',
                mb: 2,
              }}
            >
              Frequently Asked Questions
            </Typography>

            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                lineHeight: 1.5,
                color: '#1f2937',
                maxWidth: 560,
                mx: 'auto',
                fontWeight: 500,
              }}
            >
              Everything you need to know about earning with WABCASH.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openIndexes.includes(idx)

              return (
                <Paper
                  key={idx}
                  elevation={0}
                  onClick={() => handleToggle(idx)}
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isOpen
                      ? 'rgba(83, 18, 188, 0.2)'
                      : 'rgba(203, 195, 215, 0.25)',
                    bgcolor: isOpen
                      ? 'rgba(255, 255, 255, 0.9)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'rgba(83, 18, 188, 0.15)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: { xs: 3, md: 4 },
                      py: 3,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Sora", sans-serif',
                        fontSize: '16px',
                        fontWeight: isOpen ? 700 : 600,
                        color: isOpen ? '#5312bc' : '#131b2e',
                        pr: 2,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {faq.question}
                    </Typography>

                    <IconButton
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        bgcolor: isOpen ? '#5312bc' : 'rgba(83, 18, 188, 0.08)',
                        color: isOpen ? '#fff' : '#5312bc',
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: isOpen ? '#5312bc' : 'rgba(83, 18, 188, 0.12)',
                        },
                      }}
                    >
                      {isOpen ? (
                        <RemoveIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <AddIcon sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={isOpen} timeout={300}>
                    <Box
                      sx={{
                        px: { xs: 3, md: 4 },
                        pb: 3,
                        pt: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: '15px',
                          lineHeight: 1.7,
                          color: '#4b5563',
                          fontWeight: 500,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </Box>
                  </Collapse>
                </Paper>
              )
            })}
          </Box>
        </Container>
      </Box>

      {/* ========== FINAL CTA — EXACTLY AS BEFORE, DO NOT TOUCH ========== */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          mb: { xs: 8, md: 10 },
          bgcolor: '#faf8ff',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              bgcolor: '#283044',
              borderRadius: '48px',
              overflow: 'hidden',
              textAlign: 'center',
              p: { xs: 6, md: 8 },
            }}
          >
            {/* Grid overlay — ONLY top portion, stops before text */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: { xs: '35%', md: '40%' },
                opacity: 0.1,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gridTemplateRows: 'repeat(5, 1fr)',
                  height: '100%',
                  width: '100%',
                }}
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                position: 'relative',
                zIndex: 10,
                maxWidth: '768px',
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: { xs: '36px', md: '48px' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Ready to Join the Elite?
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '18px',
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Join 120,000+ members who have turned their free time into a wealth engine. Sign up in 30 seconds.
              </Typography>

              <Box sx={{ pt: '24px' }}>
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  <Box
                    component="button"
                    sx={{
                      bgcolor: '#5312bc',
                      color: '#ffffff',
                      px: 5,
                      py: 2,
                      borderRadius: '9999px',
                      fontFamily: '"Sora", sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 25px 50px -12px rgba(83, 18, 188, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#6b38d4',
                      },
                    }}
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                  </Box>
                </Link>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default FAQAndCTA