// ============================================================
// AdminLayout.jsx — Shared Admin Sidebar + Top Bar + Mobile Drawer
// Same color/typography system as the user-facing app, single
// responsive layout for all screen sizes (hamburger on mobile).
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { logoutAdmin } from '../../slices/adminAuthSlice'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  Box, Typography, Avatar, IconButton, useTheme, useMediaQuery,
  Badge, Drawer, Popover, Divider, Tooltip,
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
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import TrafficOutlinedIcon from '@mui/icons-material/TrafficOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuIcon from '@mui/icons-material/Menu'
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { getColors } from './SharedLayout'

const ADMIN_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, color: '#7c3aed', path: '/admin' },
  { label: 'Users', icon: PeopleIcon, color: '#2563eb', path: '/admin/users' },
  { label: 'Withdrawals', icon: AccountBalanceWalletIcon, color: '#10b981', path: '/admin/withdrawals' },
  { label: 'Tickets', icon: SupportAgentIcon, color: '#f59e0b', path: '/admin/tickets' },
  { label: 'Payment Proofs', icon: ReceiptLongOutlinedIcon, color: '#14b8a6', path: '/admin/payment-proofs' },
  { label: 'Offer Walls', icon: LocalOfferIcon, color: '#ec4899', path: '/admin/offer-walls' },
  { label: 'Transactions', icon: ReceiptIcon, color: '#14b8a6', path: '/admin/transactions' },
  { label: 'Traffic Logs', icon: TrafficOutlinedIcon, color: '#0ea5e9', path: '/admin/traffic-logs' },
  { label: 'Fraud Detection', icon: GppMaybeOutlinedIcon, color: '#ef4444', path: '/admin/fraud' },
  { label: 'Reversals', icon: GavelOutlinedIcon, color: '#f97316', path: '/admin/reversals' },
  { label: 'Announcements', icon: CampaignOutlinedIcon, color: '#8b5cf6', path: '/admin/announcements' },
  { label: 'Audit Logs', icon: HistoryOutlinedIcon, color: '#64748b', path: '/admin/audit-logs' },
  { label: 'Settings', icon: SettingsIcon, color: '#6b7280', path: '/admin/settings' },
]

// ---- Shared nav content (used inside both the fixed sidebar and the drawer) ----
const NavContent = ({ darkMode, onNavigate }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const COLORS = getColors(darkMode)
  const isActivePath = (path) => location.pathname === path

  const goTo = (path) => {
    navigate(path)
    if (onNavigate) onNavigate()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => goTo('/dashboard')} size="small" sx={{
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {ADMIN_NAV.map((item) => {
          const isActive = isActivePath(item.path)
          const Icon = item.icon
          return (
            <Box key={item.label} onClick={() => goTo(item.path)} sx={{
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
              },
            }}>
              <Icon sx={{ fontSize: '1.3rem' }} />
              {item.label}
            </Box>
          )
        })}
      </Box>

      <Box onClick={() => {
        dispatch(logoutAdmin())
        navigate('/admin/login')
      }} sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.1, borderRadius: 2.5,
        cursor: 'pointer',
        color: COLORS.danger,
        fontWeight: 600,
        fontSize: '0.92rem',
        mt: 'auto',
        '&:hover': { bgcolor: '#fef2f2' },
      }}>
        <LogoutIcon sx={{ fontSize: '1.3rem' }} />
        Logout
      </Box>
    </Box>
  )
}

// Fixed desktop sidebar
export const AdminSidebar = ({ darkMode }) => {
  const COLORS = getColors(darkMode)
  return (
    <Box sx={{
      width: 260, minWidth: 260, height: '100vh',
      bgcolor: COLORS.sidebarBg, borderRight: `1px solid ${COLORS.headerBorder}`,
      position: 'fixed', left: 0, top: 0, zIndex: 100,
      overflowY: 'auto',
    }}>
      <NavContent darkMode={darkMode} />
    </Box>
  )
}

// Slide-in drawer for mobile/tablet (hamburger trigger)
export const AdminMobileDrawer = ({ darkMode, open, onClose }) => {
  const COLORS = getColors(darkMode)
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { width: 270, bgcolor: COLORS.sidebarBg } }}
    >
      <NavContent darkMode={darkMode} onNavigate={onClose} />
    </Drawer>
  )
}

// ---- Real, data-driven notification bell ----
// Pulls live counts of things that need admin attention. No fake numbers,
// no fake feed — if an endpoint fails it's just omitted, never invented.
const NOTIF_CONFIG = [
  { key: 'withdrawals', label: 'Pending withdrawals', icon: AccountBalanceWalletOutlinedIcon, color: '#10b981', path: '/admin/withdrawals' },
  { key: 'tickets', label: 'Open support tickets', icon: SupportAgentOutlinedIcon, color: '#f59e0b', path: '/admin/tickets' },
  { key: 'proofs', label: 'Payment proofs to review', icon: ReceiptLongOutlinedIcon, color: '#2563eb', path: '/admin/payment-proofs' },
  { key: 'fraud', label: 'High-risk fraud flags', icon: GppMaybeOutlinedIcon, color: '#ef4444', path: '/admin/fraud' },
]

const useAdminNotifications = () => {
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      adminAxiosInstance.get('/admin/withdrawals/pending', { params: { limit: 1 } }),
      adminAxiosInstance.get('/admin/tickets', { params: { status: 'open', limit: 1 } }),
      adminAxiosInstance.get('/admin/payment-proofs', { params: { limit: 1 } }),
      adminAxiosInstance.get('/admin/fraud/dashboard', { params: { risk_level: 'critical' } }),
    ])

    const next = {}
    if (results[0].status === 'fulfilled') next.withdrawals = results[0].value.data?.meta?.total ?? 0
    if (results[1].status === 'fulfilled') next.tickets = results[1].value.data?.meta?.total ?? 0
    if (results[2].status === 'fulfilled') next.proofs = results[2].value.data?.meta?.total ?? (results[2].value.data?.data?.length ?? 0)
    if (results[3].status === 'fulfilled') next.fraud = results[3].value.data?.meta?.flagged_count ?? 0

    setCounts(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [load])

  return { counts, loading }
}

const NotificationBell = ({ darkMode }) => {
  const COLORS = getColors(darkMode)
  const navigate = useNavigate()
  const { counts, loading } = useAdminNotifications()
  const [anchorEl, setAnchorEl] = useState(null)

  const items = NOTIF_CONFIG.map((cfg) => ({ ...cfg, count: counts?.[cfg.key] ?? 0 }))
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{
        color: COLORS.textSecondary,
        '&:hover': { bgcolor: `${COLORS.primary}10` }
      }}>
        <Badge badgeContent={loading ? 0 : total} color="error" max={99}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1, width: 300, borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: COLORS.textPrimary }}>
            Needs your attention
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: COLORS.textMuted }}>
            Live counts, refreshed every minute
          </Typography>
        </Box>
        <Divider sx={{ borderColor: COLORS.border }} />
        <Box sx={{ p: 1 }}>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Box key={item.key} onClick={() => { setAnchorEl(null); navigate(item.path) }} sx={{
                display: 'flex', alignItems: 'center', gap: 1.4,
                px: 1.5, py: 1.2, borderRadius: 2, cursor: 'pointer',
                '&:hover': { bgcolor: `${item.color}0c` },
              }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: 1.8, bgcolor: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0,
                }}>
                  <Icon sx={{ fontSize: '1.1rem' }} />
                </Box>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, flex: 1 }}>
                  {item.label}
                </Typography>
                <Typography sx={{
                  fontWeight: 800, fontSize: '0.85rem',
                  color: item.count > 0 ? item.color : COLORS.textMuted,
                }}>
                  {loading ? '—' : item.count}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Popover>
    </>
  )
}

export const AdminTopBar = ({ darkMode, toggleDarkMode, scrolled, onMenuClick }) => {
  const { admin } = useSelector((state) => state.adminAuth)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isMobile && (
          <IconButton onClick={onMenuClick} sx={{ color: COLORS.textPrimary, mr: 0.5 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Box>
          <Typography sx={{
            fontWeight: 700, fontSize: { xs: '1rem', md: '1.15rem' }, color: COLORS.textPrimary
          }}>
            Admin Dashboard
          </Typography>
          <Typography sx={{
            fontSize: '0.8rem', color: COLORS.textSecondary, mt: 0.2,
            display: { xs: 'none', sm: 'block' },
          }}>
            Welcome back, {admin?.username || 'Admin'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
        <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={toggleDarkMode} sx={{
            color: COLORS.textSecondary,
            '&:hover': { bgcolor: `${COLORS.primary}10` }
          }}>
            {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>
        <NotificationBell darkMode={darkMode} />
        <Avatar sx={{
          width: 38, height: 38,
          bgcolor: COLORS.danger, color: '#fff', fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {admin?.username?.[0]?.toUpperCase() || 'A'}
        </Avatar>
      </Box>
    </Box>
  )
}

export const AdminPageWrapper = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const COLORS = getColors(darkMode)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.bg }}>
      {!isMobile && <AdminSidebar darkMode={darkMode} />}
      {isMobile && (
        <AdminMobileDrawer darkMode={darkMode} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
      <Box sx={{
        flex: 1, ml: { xs: 0, md: '260px' },
        display: 'flex', flexDirection: 'column',
        minWidth: 0,
      }}>
        <AdminTopBar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          scrolled={scrolled}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <Box sx={{ flex: 1, p: { xs: 2, sm: 2.5, md: 3 }, minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default AdminPageWrapper