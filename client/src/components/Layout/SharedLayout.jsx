// ============================================================
// SharedLayout.jsx — Fixed to match DashboardPage layout exactly
// All export names kept the same — NO breaking changes
// Only fix: isActivePath now checks full path for exact match
// ============================================================
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, Avatar, IconButton, Badge, Tooltip, Collapse,
  useTheme, useMediaQuery,
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import CloseIcon from '@mui/icons-material/Close'
import PollIcon from '@mui/icons-material/Poll'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import HistoryIcon from '@mui/icons-material/History'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

// ============================================================
// Color Palette — SAME export name
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
   { label: 'Progress', icon: TrendingUpIcon, color: '#5312bc', path: '/progress' },
]

export const MOBILE_NAV = [
  { label: 'Surveys', icon: PollIcon, path: '/earn' },
  { label: 'Games', icon: SportsEsportsIcon, path: '/earn?tab=games' },
  { label: 'Offers', icon: LocalOfferIcon, path: '/earn?tab=offers' },
  { label: 'More', icon: MoreHorizIcon, path: null, action: 'more' },
]

// ============================================================
// Sidebar — SAME export name
// FIXED: isActivePath checks full path for exact match
// ============================================================
export const Sidebar = ({ darkMode, moreExpanded, setMoreExpanded }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const COLORS = getColors(darkMode)

  // FIXED: Check full path including query params for exact match
  const isActivePath = (path) => {
    if (!path) return false
    const currentPath = location.pathname + location.search
    return currentPath === path
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', px: 2, py: 2.5 }}>
      {/* Logo */}
      <Box onClick={() => navigate('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 4, cursor: 'pointer' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(83,18,188,0.3)' }}>W</Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS.textPrimary, letterSpacing: '-0.02em' }}>WABCASH</Typography>
      </Box>

      {/* Main Nav */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
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
              <Box sx={{
                width: 32, height: 32, borderRadius: 1.5,
                bgcolor: isActive ? `${item.color}18` : `${item.color}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color,
              }}>
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              {item.label}
            </Box>
          )
        })}

        {/* More Accordion */}
        <Box>
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
            '&:hover': {
              bgcolor: `${COLORS.primary}08`,
              color: COLORS.primary,
              transform: 'translateX(4px)',
            },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: 1.5,
                bgcolor: moreExpanded ? `${COLORS.primary}18` : `${COLORS.primary}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.primary,
              }}>
                <MoreHorizIcon sx={{ fontSize: 18 }} />
              </Box>
              More
            </Box>
            {moreExpanded ? <ExpandLessIcon sx={{ fontSize: 18, color: COLORS.primary }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
          </Box>
          <Collapse in={moreExpanded} timeout={200}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, pl: 1 }}>
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
                    <Box sx={{
                      width: 28, height: 28, borderRadius: 1.2,
                      bgcolor: `${item.color}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color,
                    }}>
                      <Icon sx={{ fontSize: 16 }} />
                    </Box>
                    {item.label}
                  </Box>
                )
              })}
            </Box>
          </Collapse>
        </Box>

        {/* Logout */}
        <Box onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/' }} sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 1.5, py: 1.1, borderRadius: 2.5,
          cursor: 'pointer',
          color: COLORS.danger,
          fontWeight: 600,
          fontSize: '0.92rem',
          transition: 'all 0.2s ease',
          mt: 0.5,
          '&:hover': {
            bgcolor: '#fef2f2',
            transform: 'translateX(4px)',
          },
        }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            bgcolor: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: COLORS.danger,
          }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </Box>
          Logout
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================
// TopBar — SAME export name
// ============================================================
export const TopBar = ({ darkMode, toggleDarkMode, scrolled }) => {
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)
  const navigate = useNavigate()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good night'
  }

  return (
    <Box sx={{
      position: 'sticky', top: 0, zIndex: 1100,
      bgcolor: COLORS.headerBg,
      borderBottom: scrolled ? `1px solid ${COLORS.headerBorder}` : '1px solid transparent',
      boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      transition: 'box-shadow 0.2s ease',
      px: 4, py: 2,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {getGreeting()}, {user?.username || 'User'}! 👋
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textMuted, mt: 0.3 }}>
            Here is your earning summary
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate('/notifications')} sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.primary } }}>
              <Badge badgeContent={0} color="error">
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleDarkMode} sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.primary } }}>
              {darkMode ? <LightModeOutlinedIcon sx={{ fontSize: 24 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 24 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================
// MobileTopBar — SAME export name
// ============================================================
export const MobileTopBar = ({ darkMode, toggleDarkMode, scrolled }) => {
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      bgcolor: COLORS.headerBg,
      borderBottom: scrolled ? `1px solid ${COLORS.headerBorder}` : '1px solid transparent',
      boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      px: 2.5, py: 1.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box onClick={() => navigate('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>W</Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: COLORS.textPrimary, letterSpacing: '-0.01em' }}>WABCASH</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton onClick={() => navigate('/notifications')} size="small" sx={{ color: COLORS.textSecondary }}>
            <Badge badgeContent={0} color="error">
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
          <IconButton size="small" onClick={toggleDarkMode} sx={{ color: COLORS.textSecondary }}>
            {darkMode ? <LightModeOutlinedIcon sx={{ fontSize: 22 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 22 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================
// MobileBottomNav — SAME export name
// FIXED: Only highlight clicked item, not More when drawer opens
// ============================================================
export const MobileBottomNav = ({ darkMode, activeTab, setActiveTab, setMoreOpen }) => {
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, bgcolor: COLORS.navBg, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-around', py: 1, px: 1, height: '64px' }}>
      {MOBILE_NAV.map((item) => {
        const isActive = activeTab === item.path
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
            <Icon sx={{ fontSize: 22, color: isActive ? COLORS.primary : 'inherit' }} />
            <Typography sx={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 600 }}>{item.label}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// ============================================================
// MobileMoreDrawer — SAME export name
// ============================================================
export const MobileMoreDrawer = ({ darkMode, moreOpen, setMoreOpen, setActiveTab }) => {
  const navigate = useNavigate()
  const COLORS = getColors(darkMode)

  return (
    <Box sx={{
      position: 'fixed', bottom: moreOpen ? '64px' : '-100vh', left: 0, right: 0, zIndex: 1300,
      borderRadius: '20px 20px 0 0', p: 3, pb: 4, bgcolor: COLORS.cardBg,
      transition: 'bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: moreOpen ? '0 -4px 20px rgba(0,0,0,0.15)' : 'none',
    }}>
      <Box sx={{ width: 36, height: 3, borderRadius: 2, bgcolor: COLORS.border, mx: 'auto', mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: COLORS.textPrimary }}>More Options</Typography>
        <IconButton onClick={() => setMoreOpen(false)} sx={{ color: COLORS.textSecondary }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
        {MORE_NAV.map((item) => {
          const Icon = item.icon
          return (
            <Box key={item.label} onClick={() => { setMoreOpen(false); navigate(item.path); }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6, p: 1.2, borderRadius: 2, cursor: 'pointer', color: COLORS.textSecondary, transition: 'all 0.2s', '&:hover': { bgcolor: darkMode ? 'rgba(83,18,188,0.1)' : `${COLORS.primary}08`, color: COLORS.primary } }}>
              <Icon sx={{ fontSize: 20, color: item.color }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{item.label}</Typography>
            </Box>
          )
        })}
        <Box onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/' }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6, p: 1.2, borderRadius: 2, cursor: 'pointer', color: COLORS.danger, transition: 'all 0.2s', '&:hover': { bgcolor: '#fef2f2' } }}>
          <LogoutIcon sx={{ fontSize: 18 }} /><Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Logout</Typography>
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================
// PageWrapper — SAME export name
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
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, pb: 10, pt: '60px' }}>
        <MobileTopBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} scrolled={scrolled} />
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
      <Box sx={{ width: 260, position: 'fixed', top: 0, left: 0, bottom: 0, bgcolor: COLORS.sidebarBg, borderRight: `1px solid ${COLORS.headerBorder}`, zIndex: 1200, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: `${COLORS.primary}20`, borderRadius: 2 } }}>
        <Sidebar darkMode={darkMode} moreExpanded={moreExpanded} setMoreExpanded={setMoreExpanded} />
      </Box>
      <Box sx={{ flex: 1, ml: '260px', minHeight: '100vh' }}>
        <TopBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} scrolled={scrolled} />
        <Box sx={{ px: 4, py: 3, maxWidth: 1200 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default PageWrapper