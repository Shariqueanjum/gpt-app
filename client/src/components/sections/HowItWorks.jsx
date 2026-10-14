// client/src/components/sections/HowItWorks.jsx

import { Box, Typography, Paper, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PaymentsIcon from '@mui/icons-material/Payments'
import FadeInSection from '../common/FadeInSection'

const steps = [
  {
    number: '01',
    icon: <PersonAddIcon sx={{ fontSize: 22 }} />,
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email, no hidden fees. Start your earning journey instantly.',
    link: '/register',
  },
  {
    number: '02',
    icon: <AssignmentIcon sx={{ fontSize: 22 }} />,
    title: 'Complete Offers',
    desc: 'Pick from hundreds of daily surveys, games, and offers tailored to your profile. Every task pays real cash.',
    featured: true,
  },
  {
    number: '03',
    icon: <PaymentsIcon sx={{ fontSize: 22 }} />,
    title: 'Cash Out Instantly',
    desc: 'Withdraw your earnings via PayPal, UPI, Net Banking or gift cards. Most payouts processed within hours, not days.',
  },
]

const bottomCards = [
  {
    icon: '👥',
    title: 'Refer & Earn',
    desc: '+10% lifetime commission',
  },
  {
    icon: '🎁',
    title: 'Daily Lootbox',
    desc: 'Free reward every day',
  },
]

const PURPLE = '#7C3AED'
const FEATURED_LIGHT_PURPLE = '#A78BFA'
// const FEATURED_PURPLE = '#B49AF5'
// const DARK = '#171923'
const DARK = '#131b2e'
const MUTED = '#64748B'
const BORDER = '#E9E3FF'

const HowItWorks = () => (
  <Box
    component="section"
    id="how-it-works"
    sx={{
      width: '100%',
      boxSizing: 'border-box',
      bgcolor: '#F8FAFC',
      px: { xs: 2, sm: 3, md: 4 },
      pt: { xs: 6, sm: 7, md: 8 },
      pb: { xs: 8, md: 10 },
      maxWidth: '1280px',
      mx: 'auto',
    }}
  >
    
      {/* Section heading */}
      <Box sx={{ textAlign: 'center', mb: { xs: 5, sm: 6, md: 7 } }}>
        <Typography
          component="h2"
          sx={{
            fontFamily: '"Sora", sans-serif',
            fontSize: { xs: '28px', md: '36px' },
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            color: DARK,
            mb: 1.25,
          }}
        >
          How It Works
        </Typography>
        <Typography
          sx={{
            maxWidth: 500,
            mx: 'auto',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.55,
            color:'#1f2937',
          }}
        >
          Three simple steps to start earning real rewards today.
        </Typography>
      </Box>

      {/* Three steps: mobile timeline, clean desktop row */}
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'minmax(0, 1fr)',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          alignItems: 'stretch',
          gap: { xs: 2, sm: 2.25, md: 2.5 },
          pl: { xs: 5.5, sm: 5.5, md: 0 },
          '&:before': {
            content: '""',
            position: 'absolute',
            zIndex: 0,
            display: { xs: 'block', sm: 'block', md: 'none' },
            left: 15,
            top: 12,
            bottom: 12,
            borderLeft: '2px dashed #C4B5FD',
          },
        }}
      >
        {steps.map((step, index) => (
          <FadeInSection key={step.number} delay={index * 0.12} direction="zoomUp">
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                zIndex: 1,
                boxSizing: 'border-box',
                width: '100%',
                height: { xs: 'auto', md: '100%' },
                minHeight: { xs: 0, sm: 0, md: 260 },
                p: { xs: 2.5, sm: 2.75, md: 3 },
                pt: { xs: 2.5, sm: 2.75, md: 3.5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: '16px',
                border: step.featured ? '1px solid transparent' : `1px solid ${BORDER}`,
                bgcolor: step.featured ? PURPLE : '#FFFFFF',
                color: step.featured ? '#FFFFFF' : DARK,
                boxShadow: step.featured
                  ? '0 18px 34px -15px rgba(124,58,237,.38)'
                  : '0 8px 22px rgba(55,35,100,.045)',
                transition: 'transform .25s ease, box-shadow .25s ease',
                '&:hover': {
                  transform: { xs: 'none', md: 'translateY(-4px)' },
                  boxShadow: step.featured
                    ? '0 22px 38px -15px rgba(124,58,237,.42)'
                    : '0 13px 27px rgba(55,35,100,.08)',
                },
              }}
            >
              {/* Number centered on desktop; aligned to the mobile timeline */}
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 2,
                  left: { xs: -46, sm: -46, md: '50%' },
                  top: { xs: 0, sm: 0, md: -16 },
                  transform: { xs: 'none', sm: 'none', md: 'translateX(-50%)' },
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid #E9DFFF',
                  borderRadius: '10px',
                  bgcolor: '#F3EDFF',
                  color: PURPLE,
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: '0 2px 5px rgba(124,58,237,.05)',
                }}
              >
                {step.number}
              </Box>

              {/* Icon and copy intentionally leave the upper-right area uncluttered */}
              {/* <Box
                sx={{
                  width: 40,
                  height: 40,
                  mb: 2,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '12px',
                  bgcolor: step.featured ? 'rgba(255,255,255,.18)' : '#F3EDFF',
                  color: step.featured ? '#FFFFFF' : PURPLE,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </Box> */}

               {/* Icon pinned to the top-right corner of the card */}
              {/* <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 20, sm: 22, md: 24 },
                  right: { xs: 20, sm: 22, md: 24 },
                  width: 40,
                  height: 40,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '12px',
                  bgcolor: step.featured ? 'rgba(255,255,255,.18)' : '#F3EDFF',
                  color: step.featured ? '#FFFFFF' : PURPLE,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </Box>

              <Typography
                component="h3"
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: { xs: 17, sm: 18, md: 17, lg: 18 },
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: 'inherit',
                  mb: 1,
                }}
              >
                {step.title}
              </Typography>
              <Typography
                sx={{
                  // Preserve the typography from the original component.
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: step.featured ? '16px' : '15px',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: step.featured ? 'rgba(255,255,255,0.85)' : '#4b5563',
                }}
              >
                {step.desc}
              </Typography>
            </Paper>
          </FadeInSection>
        ))}
      </Box> */}
          {/* Title and icon share the same row, icon pushed to the right */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: { xs: 1.5, sm: 1.75, md: 2 },
                }}
              >
                <Typography
                  component="h3"
                  sx={{
                    m: 0,
                    flex: 1,
                    minWidth: 0,
                    fontFamily: '"Sora", sans-serif',
                    fontSize: { xs: 17, sm: 18, md: 17, lg: 18 },
                    fontWeight: 800,
                    lineHeight: 1.35,
                    color: 'inherit',
                  }}
                >
                  {step.title}
                </Typography>
                {/* <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '12px',
                    bgcolor: step.featured ? 'rgba(255,255,255,.18)' : '#F3EDFF',
                    color: step.featured ? '#FFFFFF' : PURPLE,
                  }}
                > */}
                 <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: step.featured ? '#FFFFFF' : PURPLE,
                  }}
                >
                  {step.icon}
                </Box>
              </Box>


                {/* Description grows to fill the card so the bottom never looks empty */}
              <Typography
                sx={{
                  // Preserve the typography from the original component.
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: step.featured ? '16px' : '15px',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: step.featured ? 'rgba(255,255,255,0.85)' : '#4b5563',
                  
                }}
              >
                {step.desc}
              </Typography>
            </Paper>
          </FadeInSection>
        ))}
      </Box>

      {/* Compact bonus banner */}
      {/* <Paper
        elevation={0}
        sx={{
          mt: { xs: 2.5, sm: 3, md: 3.5 },
          p: { xs: 2, sm: 2.25, md: 2.5 },
          border: `1px solid ${BORDER}`,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 8px 22px rgba(55,35,100,.045)',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'minmax(0, 1fr) minmax(0, 1fr)',
            md: 'minmax(0, 1fr) 130px 136px 155px',
          },
          alignItems: 'center',
          gap: { xs: 1.25, sm: 1.5, md: 1.5 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 800,
              color: DARK,
              mb: 0.35,
            }}
          >
            Want to earn even more?
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: { xs: 11.5, sm: 12 }, lineHeight: 1.45 }}>
            Refer friends for 10% lifetime commission + claim a free daily lootbox.
          </Typography>
        </Box>

        {bottomCards.map((card) => (
          <Box
            key={card.title}
            sx={{
              minWidth: 0,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 0.9,
              p: 1.1,
              border: '1px solid #EDE9FE',
              borderRadius: '11px',
              bgcolor: '#FAFAFF',
            }}
          >
            <Box component="span" sx={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
              {card.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: DARK, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                {card.title}
              </Typography>
              <Typography sx={{ fontSize: 9.5, color: MUTED, lineHeight: 1.4, mt: 0.25, whiteSpace: 'nowrap' }}>
                {card.desc}
              </Typography>
            </Box>
          </Box>
        ))}

        <Button
          component={Link}
          to="/register"
          variant="contained"
          disableElevation
          sx={{
            width: '100%',
            minWidth: 0,
            gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' },
            px: 1.5,
            py: 1.2,
            borderRadius: '10px',
            textTransform: 'none',
            fontFamily: '"Sora", sans-serif',
            fontSize: 11,
            fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(110deg, #8B5CF6 0%, #7C3AED 100%)',
            boxShadow: '0 8px 18px rgba(124,58,237,.25)',
            '&:hover': {
              background: 'linear-gradient(110deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 10px 22px rgba(124,58,237,.32)',
            },
          }}
        >
          Start Earning Free
        </Button>
      </Paper> */}

         {/* Compact bonus banner */}
      <Paper
        elevation={0}
        sx={{
          mt: { xs: 2.5, sm: 3, md: 3.5 },
          p: { xs: 2, sm: 2.25, md: 2.5 },
          border: `1px solid ${BORDER}`,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 8px 22px rgba(55,35,100,.045)',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'minmax(0, 1fr) minmax(0, 1fr)',
            md: 'minmax(0, 1fr) 185px 185px 145px',
          },
          alignItems: 'center',
          gap: { xs: 1.25, sm: 1.5, md: 1.5 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 800,
              color: DARK,
              mb: 0.35,
            }}
          >
            Want to earn even more?
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: { xs: 11.5, sm: 12 }, lineHeight: 1.45 }}>
            Refer friends for 10% lifetime commission + claim a free daily lootbox.
          </Typography>
        </Box>

        {bottomCards.map((card) => (
          <Box
            key={card.title}
            sx={{
              minWidth: 0,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              alignItems: { xs: 'center', md: 'stretch' },
              gap: { xs: 0.9, md: 0.75 },
              height: { md: '100%' },
              p: { xs: 1.1, md: 1.25 },
              border: '1px solid #EDE9FE',
              borderRadius: '11px',
              bgcolor: '#FAFAFF',
            }}
          >
            {/* Mobile keeps the compact horizontal layout */}
            <Box component="span" sx={{ display: { xs: 'block', md: 'none' }, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
              {card.icon}
            </Box>
            <Box sx={{ minWidth: 0, width: '100%' }}>
              {/* Desktop: title left, icon right on one line */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: DARK, lineHeight: 1.3 }}>
                  {card.title}
                </Typography>
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                  {card.icon}
                </Box>
              </Box>
              {/* Desktop: description sits on its own line below */}
              <Typography
                sx={{
                  fontSize: 9.5,
                  color: MUTED,
                  lineHeight: 1.4,
                  mt: { xs: 0.25, md: 0.75 },
                  whiteSpace: { md: 'nowrap' },
                }}
              >
                {card.desc}
              </Typography>
            </Box>
          </Box>
        ))}

        <Button
          component={Link}
          to="/register"
          variant="contained"
          disableElevation
          sx={{
            width: '100%',
            minWidth: 0,
            gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' },
            px: 1.5,
            py: 1.2,
            borderRadius: '10px',
            textTransform: 'none',
            fontFamily: '"Sora", sans-serif',
            fontSize: 11,
            fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(110deg, #8B5CF6 0%, #7C3AED 100%)',
            boxShadow: '0 8px 18px rgba(124,58,237,.25)',
            '&:hover': {
              background: 'linear-gradient(110deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 10px 22px rgba(124,58,237,.32)',
            },
          }}
        >
          Start Earning Free
        </Button>
      </Paper>
   
  </Box>
)

export default HowItWorks
