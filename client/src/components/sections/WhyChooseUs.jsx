// client/src/components/sections/WhyChooseUs.jsx
import { useRef, useState, useEffect } from 'react'
import { Box, Typography, Paper, Container } from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import SecurityIcon from '@mui/icons-material/Security'
import PaymentsIcon from '@mui/icons-material/Payments'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'

const features = [
  {
    icon: <SpeedIcon sx={{ fontSize: 28 }} />,
    title: 'Lightning Fast',
    desc: 'Offers credit instantly. No more waiting days for approval.',
    color: '#5312bc',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 28 }} />,
    title: 'Bank-Grade Security',
    desc: '256-bit encryption and fraud detection keep your data safe.',
    color: '#006e2f',
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 28 }} />,
    title: 'Highest Payouts',
    desc: 'We negotiate directly with advertisers for top rates.',
    color: '#623c00',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
    title: 'Daily Bonuses',
    desc: 'Streak rewards, leaderboard prizes, and surprise lootboxes.',
    color: '#be185d',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    title: 'Level Up System',
    desc: 'Earn XP with every task. Unlock exclusive high-paying offers.',
    color: '#1e40af',
  },
  {
    icon: <HeadsetMicIcon sx={{ fontSize: 28 }} />,
    title: '24/7 Live Support',
    desc: 'Real humans, not bots. Get help whenever you need it.',
    color: '#701a75',
  },
]

const WhyChooseUs = () => {
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Drag support
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  // Touch support
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <Box
      component="section"
      id="why-choose-us"
      sx={{
        position: 'relative',
        pt: { xs: 6, md: 8 },
        pb: { xs: 8, md: 10 },
        overflow: 'hidden',
        bgcolor: '#faf8ff',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontSize: { xs: '24px', md: '32px' },
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#131b2e',
              mb: 1.5,
            }}
          >
            Why Thousands Trust Us
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.5,
              color: '#4b5563',
              fontWeight: 500,
              maxWidth: 480,
            }}
          >
            Built for earners, by earners. Every feature tested by real users.
          </Typography>
        </Box>

        {/* Netflix-style Carousel */}
        <Box
          sx={{
            position: 'relative',
            mx: { xs: -2, md: 0 },
          }}
        >
          <Box
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            sx={{
              display: 'flex',
              gap: { xs: 1.5, md: 2 },
              overflowX: 'auto',
              overflowY: 'hidden',
              px: { xs: 2, md: 0 },
              // Hide scrollbar completely
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
              // Smooth scroll behavior
              scrollBehavior: 'smooth',
              // Prevent vertical scroll on touch
              touchAction: 'pan-x',
            }}
          >
            {features.map((feature, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  flex: '0 0 auto',
                  // Netflix card ratio — wider than tall
                  width: { xs: 260, sm: 280, md: 300 },
                  // Height auto based on content
                  p: { xs: 3, md: 3.5 },
                  borderRadius: '16px',
                  border: '1px solid rgba(203, 195, 215, 0.25)',
                  bgcolor: '#ffffff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    zIndex: 2,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    '& .feature-icon': {
                      bgcolor: feature.color,
                      color: '#fff',
                    },
                    '& .feature-bar': {
                      width: '100%',
                    },
                  },
                  // Active/pressed state
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                {/* Top accent bar — subtle */}
                <Box
                  className="feature-bar"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '3px',
                    width: '30%',
                    bgcolor: feature.color,
                    borderRadius: '0 0 4px 0',
                    transition: 'width 0.4s ease',
                  }}
                />

                {/* Icon */}
                <Box
                  className="feature-icon"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: 'rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    mb: 2.5,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {feature.icon}
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontFamily: '"Sora", sans-serif',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#131b2e',
                    mb: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#6b7280',
                    fontWeight: 500,
                  }}
                >
                  {feature.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default WhyChooseUs