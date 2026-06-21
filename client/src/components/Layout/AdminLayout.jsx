// ============================================================
// AdminLayout.jsx — Shared Admin Sidebar + Top Bar
// Uses same design system as user pages but with admin nav
// ============================================================
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, Avatar, IconButton, useTheme, useMediaQuery,
  Badge
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ReceiptIcon from '@mui/icons-material/Receipt'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getColors } from './SharedLayout'

const ADMIN_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, color: '#7c3aed', path: '/admin' },
  { label: 'Users', icon: PeopleIcon, color: '#2563eb', path: '/admin/users' },
  { label: 'Withdrawals', icon: AccountBalanceWalletIcon, color: '#10b981', path: '/admin/withdrawals' },
  { label: 'Tickets', icon: SupportAgentIcon, color: '#f59e0b', path: '/admin/tickets' },
  { label: 'Offer Walls', icon: LocalOfferIcon, color: '#ec4899', path: '/admin/offer-walls' },
  { label: 'Transactions', icon: ReceiptIcon, color: '#14b8a6', path: '/admin/transactions' },
  { label: 'Settings', icon: SettingsIcon, color: '#6b7280', path: '/admin/settings' },
]

export const AdminSidebar = ({ darkMode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const COLORS = getColors(darkMode)

  const isActivePath = (path) => location.pathname === path

  return (
    <Box sx={{
      width: 260, minWidth: 260, height: '100vh',
      bgcolor: COLORS.sidebarBg, borderRight: `1px solid ${COLORS.headerBorder}`,
      display: 'flex', flexDirection: 'column', p: 2.5,
      position: 'fixed', left: 0, top: 0, zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo + Back */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{
          color: COLORS.textSecondary, '&:hover': { color: COLORS.primary }
        }}>
          <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
        </IconButton>
        <Typography sx={{
          fontWeight: 800, fontSize: '0.85rem', color: COLORS.textMuted,
          textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          Back to App
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 4 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: COLORS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.85rem'
        }}>
          A
        </Box>
        <Typography sx={{
          fontWeight: 800, fontSize: '1.15rem', color: COLORS.textPrimary,
          letterSpacing: '-0.5px'
        }}>
          Admin Panel
        </Typography>
      </Box>

      {/* Nav Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {ADMIN_NAV.map((item) => {
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

export const AdminTopBar = ({ darkMode, toggleDarkMode, scrolled }) => {
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)

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
          Admin Dashboard
        </Typography>
        <Typography sx={{
          fontSize: '0.82rem', color: COLORS.textSecondary, mt: 0.2
        }}>
          Welcome back, {user?.username || 'Admin'}
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
        <Avatar sx={{
          width: 38, height: 38,
          bgcolor: COLORS.danger, color: '#fff', fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </Avatar>
      </Box>
    </Box>
  )
}

export const AdminPageWrapper = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [scrolled, setScrolled] = useState(false)
  const COLORS = getColors(darkMode)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Admin pages are desktop-first, but handle mobile gracefully
  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.1rem', color: COLORS.textPrimary
          }}>
            Admin Panel
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
            Please use a desktop for admin features
          </Typography>
        </Box>
        {children}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.bg }}>
      <AdminSidebar darkMode={darkMode} />
      <Box sx={{
        flex: 1, ml: '260px',
        display: 'flex', flexDirection: 'column',
      }}>
        <AdminTopBar
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

export default AdminPageWrapper