// client/src/components/sections/HowItWorks.jsx
import { Box, Typography, Paper } from '@mui/material'
import { Link } from 'react-router-dom'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'

const steps = [
  {
    icon: <PersonAddIcon sx={{ fontSize: 28 }} />,
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email. No credit card required, no hidden fees. Start your earning journey instantly.',
    avgEarning: 'Free',
    color: '#5312bc',
    bgHover: '#5312bc',
    textColor: '#ffffff',
    action: 'Start',
    link: '/register',
    clickable: true,
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
    title: 'Complete Offers',
    desc: 'Pick from hundreds of daily surveys, games, and offers tailored to your profile. Every task pays real cash.',
    avgEarning: '$5.00+ Avg.',
    color: '#006e2f',
    bgHover: '#006e2f',
    textColor: '#ffffff',
    action: 'Browse',
    clickable: false,
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 28 }} />,
    title: 'Cash Out Instantly',
    desc: 'Withdraw your earnings via PayPal, crypto, or gift cards. Most payouts processed within hours, not days.',
    avgEarning: '24h Avg.',
    color: '#623c00',
    bgHover: '#623c00',
    textColor: '#ffffff',
    action: 'Withdraw',
    clickable: false,
  },
]

const bottomCards = [
  {
    icon: '👥',
    title: 'Refer & Earn',
    desc: 'Invite friends and earn 10% of everything they make. Forever. Build your passive income stream.',
    stat: '+10% Lifetime',
    statColor: '#006e2f',
    action: 'Invite',
    color: '#006e2f',
    clickable: false,
  },
  {
    icon: '🎁',
    title: 'Daily Lootbox',
    desc: 'Log in daily to claim your free reward crate. Odds of winning $50.00 inside every single day.',
    stat: 'Free Daily',
    statColor: '#653e00',
    action: 'Claim',
    color: '#653e00',
    clickable: false,
  },
]

const HowItWorks = () => {
  return (
    <Box
      component="section"
      id="how-it-works"
      sx={{
        // TIGHTER padding top — less space after Hero
        pt: { xs: 6, md: 8 },
        pb: { xs: 8, md: 10 },
        px: { xs: 2, md: 4 },
        maxWidth: '1280px',
        mx: 'auto',
      }}
    >
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        {/* <Typography
          sx={{
            fontFamily: '"Sora", sans-serif',
            fontSize: { xs: '12px', md: '13px' },
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#5312bc',
            mb: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1,
            borderRadius: '9999px',
            border: '1px solid rgba(83, 18, 188, 0.15)',
            bgcolor: 'rgba(83, 18, 188, 0.04)',
          }}
        >
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#006e2f',
              display: 'inline-block',
            }}
          />
          Simple Process
        </Typography> */}

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
          How It Works
        </Typography>

        {/* IMPROVED subtitle — bolder, darker, bigger */}
        <Typography
          sx={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: { xs: '1.1rem', md: '1.2rem' },
            lineHeight: 1.5,
            color: '#1f2937',
            maxWidth: 500,
            mx: 'auto',
            fontWeight: 500,
          }}
        >
          Three simple steps to start earning real rewards today.
        </Typography>
      </Box>

      {/* Top 3 Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {/* Card 1 — Create Account */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '16px',
            border: '1px solid rgba(203, 195, 215, 0.3)',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px -15px rgba(107, 56, 212, 0.15)',
              '& .icon-circle': {
                bgcolor: '#5312bc',
                color: '#ffffff',
              },
              '& .arrow-icon': {
                transform: 'translateX(8px)',
              },
            },
          }}
        >
          <Box>
            <Box
              className="icon-circle"
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(83, 18, 188, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5312bc',
                mb: 3,
                transition: 'all 0.3s ease',
              }}
            >
              {steps[0].icon}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.3,
                color: '#131b2e',
                mb: 1.5,
              }}
            >
              {steps[0].title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#4b5563',
                fontWeight: 500,
              }}
            >
              {steps[0].desc}
            </Typography>
          </Box>
          <Box
            sx={{
              pt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                color: '#006e2f',
              }}
            >
              {steps[0].avgEarning}
            </Typography>
            <Link
              to={steps[0].link}
              style={{
                textDecoration: 'none',
                color: '#5312bc',
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {steps[0].action}
              <Box
                className="arrow-icon"
                component="span"
                sx={{
                  display: 'inline-flex',
                  transition: 'transform 0.3s ease',
                }}
              >
                →
              </Box>
            </Link>
          </Box>
        </Paper>

        {/* Card 2 — Complete Offers (Featured) */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '16px',
            bgcolor: '#6b38d4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: { xs: '280px', md: '100%' },
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px -15px rgba(107, 56, 212, 0.3)',
              '& .featured-bg': {
                transform: 'scale(1.1)',
              },
            },
          }}
        >
          <Box
            className="featured-bg"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.1,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 70%)',
              transition: 'transform 0.7s ease',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 2, spaceY: 'md' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                mb: 3,
              }}
            >
              {steps[1].icon}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: { xs: '28px', md: '32px' },
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#ffffff',
                mb: 2,
              }}
            >
              {steps[1].title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 500,
                mb: 4,
              }}
            >
              {steps[1].desc}
            </Typography>
            {/* DUMMY button — not clickable, just text */}
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: '#ffffff',
                color: '#5312bc',
                px: 4,
                py: 1.5,
                borderRadius: '9999px',
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                opacity: 0.9,
              }}
            >
              {steps[1].action}
            </Box>
          </Box>
        </Paper>

        {/* Card 3 — Cash Out */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '16px',
            border: '1px solid rgba(203, 195, 215, 0.3)',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px -15px rgba(107, 56, 212, 0.15)',
              '& .icon-circle-3': {
                bgcolor: '#623c00',
                color: '#ffffff',
              },
              '& .arrow-icon-3': {
                transform: 'translateX(8px)',
              },
            },
          }}
        >
          <Box>
            <Box
              className="icon-circle-3"
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(98, 60, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#623c00',
                mb: 3,
                transition: 'all 0.3s ease',
              }}
            >
              {steps[2].icon}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.3,
                color: '#131b2e',
                mb: 1.5,
              }}
            >
              {steps[2].title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#4b5563',
                fontWeight: 500,
              }}
            >
              {steps[2].desc}
            </Typography>
          </Box>
          <Box
            sx={{
              pt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                color: '#623c00',
              }}
            >
              {steps[2].avgEarning}
            </Typography>
            {/* DUMMY text — not a link */}
            <Box
              sx={{
                color: '#5312bc',
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'default',
                opacity: 0.7,
              }}
            >
              {steps[2].action}
              <Box
                className="arrow-icon-3"
                component="span"
                sx={{
                  display: 'inline-flex',
                  transition: 'transform 0.3s ease',
                }}
              >
                →
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Bottom Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Refer & Earn — DUMMY */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '16px',
            bgcolor: 'rgba(0, 110, 47, 0.08)',
            border: '1px solid rgba(0, 110, 47, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '200px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px -15px rgba(0, 110, 47, 0.15)',
              '& .ref-icon': {
                bgcolor: '#006e2f',
                color: '#ffffff',
              },
            },
          }}
        >
          <Box>
            <Box
              className="ref-icon"
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(0, 110, 47, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#006e2f',
                mb: 3,
                transition: 'all 0.3s ease',
                fontSize: '28px',
              }}
            >
              {bottomCards[0].icon}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.3,
                color: '#131b2e',
                mb: 1.5,
              }}
            >
              {bottomCards[0].title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#4b5563',
                fontWeight: 500,
              }}
            >
              {bottomCards[0].desc}
            </Typography>
          </Box>
          <Box
            sx={{
              pt: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 800,
                color: bottomCards[0].statColor,
              }}
            >
              {bottomCards[0].stat}
            </Typography>
            {/* DUMMY text */}
            <Box
              sx={{
                color: bottomCards[0].color,
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'default',
                opacity: 0.7,
              }}
            >
              {bottomCards[0].action}
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  transition: 'transform 0.3s ease',
                }}
              >
                →
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Daily Lootbox — DUMMY */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid rgba(203, 195, 215, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '200px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px -15px rgba(107, 56, 212, 0.15)',
              '& .bonus-icon': {
                bgcolor: '#653e00',
                color: '#ffffff',
              },
            },
          }}
        >
          <Box>
            <Box
              className="bonus-icon"
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(101, 62, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#653e00',
                mb: 3,
                transition: 'all 0.3s ease',
                fontSize: '28px',
              }}
            >
              {bottomCards[1].icon}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.3,
                color: '#131b2e',
                mb: 1.5,
              }}
            >
              {bottomCards[1].title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#4b5563',
                fontWeight: 500,
              }}
            >
              {bottomCards[1].desc}
            </Typography>
          </Box>
          <Box
            sx={{
              pt: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                color: bottomCards[1].statColor,
              }}
            >
              {bottomCards[1].stat}
            </Typography>
            {/* DUMMY text */}
            <Box
              sx={{
                color: '#5312bc',
                fontFamily: '"Sora", sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'default',
                opacity: 0.7,
              }}
            >
              {bottomCards[1].action}
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  transition: 'transform 0.3s ease',
                }}
              >
                →
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default HowItWorks