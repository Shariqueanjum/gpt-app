// ============================================================
// Shared Layout Components — Extracted from DashboardPage
// DashboardPage.jsx is NOT modified. These are COPIES of its layout code.
// ============================================================

// File: client/src/components/Layout/SharedLayout.jsx
import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, Avatar, IconButton, Badge, Fab, Zoom, Collapse, Tooltip,
  useTheme, useMediaQuery, Paper, Skeleton
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import CloseIcon from '@mui/icons-material/Close'
import PollIcon from '@mui/icons-material/Poll'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import StarIcon from '@mui/icons-material/Star'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import HistoryIcon from '@mui/icons-material/History'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import axiosInstance from '../../utils/axiosInstance'

// ============================================================
// Color Palette (matches DashboardPage exactly)
// ============================================================
export const getColors = (darkMode) => ({
  primary: '#5312bc',
  primaryLight: '#7c3aed',
  primaryDark: '#3b0f8a',
  accent: '#10b981',
  bg: darkMode ? '#0f172a' : '#faf8ff',
  cardBg: darkMode ? '#1e293b' : '#ffffff',
  textPrimary: darkMode ? '#f1f5f9' : '#1e1b4b',
  textSecondary: darkMode ? '#94a3b8' : '#6b7280',
  textMuted: darkMode ? '#64748b' : '#9ca3af',
  border: darkMode ? '#334155' : '#e5e7eb',
  gold: '#f59e0b',
  danger: '#ef4444',
  sidebarBg: darkMode ? '#1e293b' : '#f5f3ff',
  headerBg: darkMode ? '#1e293b' : '#f0eeff',
  headerBorder: darkMode ? '#334155' : '#e2e0f0',
  navBg: darkMode ? '#1e293b' : '#ffffff',
})

export const WALL_COLORS = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6']

// ============================================================
// Navigation Config (matches DashboardPage exactly)
// ============================================================
export const MAIN_NAV = [
  { label: 'Surveys', icon: PollIcon, color: '#5312bc', path: '/earn' },
  { label: 'Games', icon: SportsEsportsIcon, color: '#10b981', path: '/earn?tab=games' },
  { label: 'Offers', icon: LocalOfferIcon, color: '#f59e0b', path: '/earn?tab=offers' },
]

export const MORE_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, color: '#7c3aed', path: '/dashboard' },
  { label: 'Withdraw', icon: AccountBalanceWalletIcon, color: '#2563eb', path: '/withdraw' },
  { label: 'History', icon: HistoryIcon, color: '#14b8a6', path: '/history' },
  { label: 'Referrals', icon: PeopleIcon, color: '#ec4899', path: '/referrals' },
  { label: 'Support', icon: SupportAgentIcon, color: '#f59e0b', path: '/support' },
  { label: 'Profile', icon: AccountCircleIcon, color: '#8b5cf6', path: '/profile' },
  { label: 'Settings', icon: SettingsIcon, color: '#6b7280', path: '/settings' },
]

export const MOBILE_NAV = [
  { label: 'Surveys', icon: PollIcon, path: '/earn' },
  { label: 'Games', icon: SportsEsportsIcon, path: '/earn?tab=games' },
  { label: 'Offers', icon: LocalOfferIcon, path: '/earn?tab=offers' },
  { label: 'More', icon: MoreHorizIcon, path: null, action: 'more' },
]

// ============================================================
// Sidebar Component (Desktop Left Sidebar)
// ============================================================
export const Sidebar = ({ darkMode, moreExpanded, setMoreExpanded }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const COLORS = getColors(darkMode)

  const isActivePath = (path) => {
    if (!path) return false
    return location.pathname === path.split('?')[0]
  }

  return (
    <Box sx={{
      width: 260, minWidth: 260, height: '100vh',
      bgcolor: COLORS.sidebarBg, borderRight: `1px solid ${COLORS.headerBorder}`,
      display: 'flex', flexDirection: 'column', p: 2.5,
      position: 'fixed', left: 0, top: 0, zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <Box onClick={() => navigate('/dashboard')} sx={{
        display: 'flex', alignItems: 'center', gap: 1.2, mb: 4, cursor: 'pointer'
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.85rem'
        }}>
          W
        </Box>
        <Typography sx={{
          fontWeight: 800, fontSize: '1.15rem', color: COLORS.textPrimary,
          letterSpacing: '-0.5px'
        }}>
          WWABCASH
        </Typography>
      </Box>

      {/* Main Nav */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {MAIN_NAV.map((item) => {
          const isActive = isActivePath(item.path)
          const Icon = item.icon
          return (
            <Box key={item.label} onClick={() => navigate(item.path)} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 1.5, py: 1.1, borderRadius: 2.5,
              cursor: 'pointer',
              bgcolor: isActive ? `${item.color}12` : 'transparent',
              color: isActive ? item.color : COLORS.textSecondary,
              fontWeight: isActive ? 700 : 600,
              fontSize: '0.92rem',
              transition: 'all 0.2s ease',
              border: isActive ? `1px solid ${item.color}25` : '1px solid transparent',
              '&:hover': {
                bgcolor: isActive ? `${item.color}15` : `${item.color}08`,
                color: item.color,
                transform: 'translateX(4px)',
              },
            }}>
              <Icon sx={{ fontSize: '1.3rem' }} />
              {item.label}
            </Box>
          )
        })}
      </Box>

      {/* More Accordion */}
      <Box onClick={() => setMoreExpanded(!moreExpanded)} sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1.5, py: 1.1, borderRadius: 2.5,
        cursor: 'pointer',
        bgcolor: moreExpanded ? `${COLORS.primary}10` : 'transparent',
        color: moreExpanded ? COLORS.primary : COLORS.textSecondary,
        fontWeight: 600,
        fontSize: '0.92rem',
        transition: 'all 0.2s ease',
        border: moreExpanded ? `1px solid ${COLORS.primary}20` : '1px solid transparent',
        mt: 0.6,
        '&:hover': {
          bgcolor: `${COLORS.primary}08`,
          color: COLORS.primary,
          transform: 'translateX(4px)',
        },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MoreHorizIcon sx={{ fontSize: '1.3rem' }} />
          More
        </Box>
        {moreExpanded ? <ExpandLessIcon sx={{ fontSize: '1.1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1.1rem' }} />}
      </Box>

      <Collapse in={moreExpanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mt: 0.5 }}>
          {MORE_NAV.map((item) => {
            const isActive = isActivePath(item.path)
            const Icon = item.icon
            return (
              <Box key={item.label} onClick={() => navigate(item.path)} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 1.5, py: 0.9, pl: 4,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: isActive ? `${item.color}10` : 'transparent',
                color: isActive ? item.color : COLORS.textSecondary,
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: `${item.color}08`,
                  color: item.color,
                  transform: 'translateX(4px)',
                },
              }}>
                <Icon sx={{ fontSize: '1.15rem' }} />
                {item.label}
              </Box>
            )
          })}
        </Box>
      </Collapse>

      {/* Logout */}
      <Box onClick={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
      }} sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.1, borderRadius: 2.5,
        cursor: 'pointer',
        color: COLORS.danger,
        fontWeight: 600,
        fontSize: '0.92rem',
        transition: 'all 0.2s ease',
        mt: 'auto',
        '&:hover': {
          bgcolor: '#fef2f2',
          transform: 'translateX(4px)',
        },
      }}>
        <LogoutIcon sx={{ fontSize: '1.3rem' }} />
        Logout
      </Box>
    </Box>
  )
}

// ============================================================
// TopBar Component (Desktop Sticky Header)
// ============================================================
export const TopBar = ({ darkMode, toggleDarkMode, scrolled }) => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good night'
  }

  return (
    <Box sx={{
      position: 'sticky', top: 0, zIndex: 50,
      px: { xs: 2, md: 3 }, py: 2,
      bgcolor: scrolled ? `${COLORS.headerBg}ee` : COLORS.headerBg,
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: `1px solid ${COLORS.headerBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    }}>
      <Box>
        <Typography sx={{
          fontWeight: 700, fontSize: '1.15rem', color: COLORS.textPrimary
        }}>
          {getGreeting()}, {user?.username || 'User'}! 👋
        </Typography>
        <Typography sx={{
          fontSize: '0.82rem', color: COLORS.textSecondary, mt: 0.2
        }}>
          Here is your earning summary
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton onClick={toggleDarkMode} sx={{
          color: COLORS.textSecondary,
          '&:hover': { bgcolor: `${COLORS.primary}10` }
        }}>
          {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
        <IconButton sx={{
          color: COLORS.textSecondary,
          '&:hover': { bgcolor: `${COLORS.primary}10` }
        }}>
          <Badge badgeContent={0} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <Avatar onClick={() => navigate('/profile')} sx={{
          width: 38, height: 38, cursor: 'pointer',
          bgcolor: COLORS.primary, color: '#fff', fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </Box>
    </Box>
  )
}

// ============================================================
// MobileTopBar Component
// ============================================================
export const MobileTopBar = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 110,
      px: 2, py: 1.5,
      bgcolor: COLORS.headerBg,
      borderBottom: `1px solid ${COLORS.headerBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Box onClick={() => navigate('/dashboard')} sx={{
        display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer'
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1.5,
          bgcolor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.8rem'
        }}>
          W
        </Box>
        <Typography sx={{
          fontWeight: 800, fontSize: '1rem', color: COLORS.textPrimary
        }}>
          WWABCASH
        </Typography>
      </Box>
      <IconButton onClick={toggleDarkMode} size="small" sx={{ color: COLORS.textSecondary }}>
        {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Box>
  )
}

// ============================================================
// MobileBottomNav Component
// ============================================================
export const MobileBottomNav = ({ darkMode, activeTab, setActiveTab, setMoreOpen }) => {
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 110,
      bgcolor: COLORS.navBg,
      borderTop: `1px solid ${COLORS.headerBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      px: 1, py: 0.8,
    }}>
      {MOBILE_NAV.map((item) => {
        const isActive = activeTab === item.path || (item.action === 'more' && setMoreOpen)
        const Icon = item.icon
        return (
          <Box key={item.label} onClick={() => {
            if (item.action === 'more') {
              setMoreOpen(true)
            } else {
              setActiveTab(item.path)
              navigate(item.path)
            }
          }} sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3,
            cursor: 'pointer',
            color: isActive ? COLORS.primary : COLORS.textSecondary,
            transition: 'color 0.2s',
            flex: 1,
          }}>
            <Icon sx={{ fontSize: '1.4rem' }} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// ============================================================
// MobileMoreDrawer Component
// ============================================================
export const MobileMoreDrawer = ({ darkMode, moreOpen, setMoreOpen, setActiveTab }) => {
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  if (!moreOpen) return null

  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 130,
      bgcolor: COLORS.navBg,
      borderTop: `1px solid ${COLORS.headerBorder}`,
      borderRadius: '20px 20px 0 0',
      p: 2.5, pb: 8,
      boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
    }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2
      }}>
        <Typography sx={{
          fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary
        }}>
          More Options
        </Typography>
        <IconButton onClick={() => setMoreOpen(false)} size="small" sx={{ color: COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5
      }}>
        {MORE_NAV.map((item) => {
          const Icon = item.icon
          return (
            <Box key={item.label} onClick={() => {
              setMoreOpen(false)
              navigate(item.path)
            }} sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6,
              p: 1.2, borderRadius: 2,
              cursor: 'pointer',
              color: COLORS.textSecondary,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(83,18,188,0.1)' : `${COLORS.primary}08`,
                color: COLORS.primary
              }
            }}>
              <Icon sx={{ fontSize: '1.5rem', color: item.color }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>
                {item.label}
              </Typography>
            </Box>
          )
        })}
        <Box onClick={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/'
        }} sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6,
          p: 1.2, borderRadius: 2,
          cursor: 'pointer',
          color: COLORS.danger,
          transition: 'all 0.2s',
          '&:hover': { bgcolor: '#fef2f2' }
        }}>
          <LogoutIcon sx={{ fontSize: '1.5rem' }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Logout</Typography>
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================
// PageWrapper — Wraps any page with shared layout
// ============================================================
export const PageWrapper = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [scrolled, setScrolled] = useState(false)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('/earn')
  const COLORS = getColors(darkMode)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mobile Layout
  if (isMobile) {
    return (
      <Box sx={{
        minHeight: '100vh', bgcolor: COLORS.bg,
        pt: '56px', pb: '64px', // space for fixed top bar + bottom nav
      }}>
        <MobileTopBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        {children}
        <MobileBottomNav
          darkMode={darkMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMoreOpen={setMoreOpen}
        />
        <MobileMoreDrawer
          darkMode={darkMode}
          moreOpen={moreOpen}
          setMoreOpen={setMoreOpen}
          setActiveTab={setActiveTab}
        />
      </Box>
    )
  }

  // Desktop Layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.bg }}>
      <Sidebar
        darkMode={darkMode}
        moreExpanded={moreExpanded}
        setMoreExpanded={setMoreExpanded}
      />
      <Box sx={{
        flex: 1, ml: '260px', // sidebar width
        display: 'flex', flexDirection: 'column',
      }}>
        <TopBar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          scrolled={scrolled}
        />
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default PageWrapper