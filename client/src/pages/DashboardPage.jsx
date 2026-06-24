import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, Paper, Avatar, Chip, Skeleton, useTheme, useMediaQuery,
  IconButton, Badge, Fab, Zoom, Collapse, Tooltip,
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
import LockIcon from '@mui/icons-material/Lock'
import PaymentIcon from '@mui/icons-material/Payment'
import BarChartIcon from '@mui/icons-material/BarChart'
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'

const getColors = (darkMode) => ({
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

const WALL_COLORS = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6']

const MAIN_NAV = [
  { label: 'Surveys', icon: PollIcon, color: '#5312bc', path: '/earn' },
  { label: 'Games', icon: SportsEsportsIcon, color: '#10b981', path: '/earn?tab=games' },
  { label: 'Offers', icon: LocalOfferIcon, color: '#f59e0b', path: '/earn?tab=offers' },
]

const MORE_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, color: '#7c3aed', path: '/dashboard' },
  { label: 'Withdraw', icon: AccountBalanceWalletIcon, color: '#2563eb', path: '/withdraw' },
  { label: 'History', icon: HistoryIcon, color: '#14b8a6', path: '/history' },
  { label: 'Referrals', icon: PeopleIcon, color: '#ec4899', path: '/referrals' },
  { label: 'Support', icon: SupportAgentIcon, color: '#f59e0b', path: '/support' },
  { label: 'Profile', icon: AccountCircleIcon, color: '#8b5cf6', path: '/profile' },
  { label: 'Settings', icon: SettingsIcon, color: '#6b7280', path: '/settings' },
]

const MOBILE_NAV = [
  { label: 'Surveys', icon: PollIcon, path: '/earn' },
  { label: 'Games', icon: SportsEsportsIcon, path: '/earn?tab=games' },
  { label: 'Offers', icon: LocalOfferIcon, path: '/earn?tab=offers' },
  { label: 'More', icon: MoreHorizIcon, path: null, action: 'more' },
]

const DashboardPage = ({ darkMode, toggleDarkMode }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const COLORS = getColors(darkMode)

  const { user } = useSelector((state) => state.auth)
  const [dashboard, setDashboard] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [offerWalls, setOfferWalls] = useState([])
  const [streak, setStreak] = useState(null)
  const [liveActivity, setLiveActivity] = useState([])
  const [chatPanelOpen, setChatPanelOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('/earn')
  const sseRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    dispatch(fetchCurrentUser())
    fetchDashboard()
    fetchPerformance()
    fetchOfferWalls()
    fetchStreakAndAutoCheckIn()
    fetchLiveActivity()
    connectSSE()
    return () => { if (sseRef.current) sseRef.current.close() }
  }, [dispatch])

  const fetchStreakAndAutoCheckIn = async () => {
    try {
      const res = await axiosInstance.get('/streak/status')
      const streakData = res.data.data
      setStreak(streakData)
      if (streakData.can_check_in) {
        try {
          const checkRes = await axiosInstance.post('/streak/check-in')
          setStreak(prev => ({ ...prev, current_streak: checkRes.data.data.streak, can_check_in: false }))
          fetchDashboard()
        } catch (e) { console.error('Auto streak check-in failed:', e) }
      }
    } catch (err) { console.error('Streak fetch failed:', err) }
  }

  const connectSSE = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const sseUrl = baseURL.replace('/api', '') + '/api/live-activity/stream'
    try {
      const sse = new EventSource(sseUrl)
      sseRef.current = sse
      sse.addEventListener('activity', (e) => {
        try {
          const data = JSON.parse(e.data)
          setLiveActivity(prev => {
            const exists = prev.find(p => p.id === data.id)
            if (exists) return prev
            return [data, ...prev].slice(0, 20)
          })
        } catch { }
      })
      sse.addEventListener('heartbeat', () => { })
      sse.onerror = () => { sse.close(); setTimeout(connectSSE, 8000) }
    } catch (err) { console.error('SSE connection failed:', err) }
  }

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/')
      setDashboard(response.data.data)
    } catch (err) { console.error('Dashboard fetch failed:', err) }
    finally { setLoading(false) }
  }

  const fetchPerformance = async () => {
    try {
      const response = await axiosInstance.get('/performance/')
      setPerformance(response.data.data)
    } catch (err) { console.error('Performance fetch failed:', err) }
  }

  const fetchOfferWalls = async () => {
    try {
      const res = await axiosInstance.get('/offer-walls/')
      setOfferWalls(res.data.data || [])
    } catch (err) { console.error('Offer walls fetch failed:', err) }
  }

  const fetchLiveActivity = async () => {
    try {
      const res = await axiosInstance.get('/live-activity/recent?limit=15')
      setLiveActivity(res.data.data || [])
    } catch (err) { console.error('Live activity fetch failed:', err) }
  }

  const handleClaimStreak = async () => {
    if (!streak?.can_check_in) return
    try {
      const res = await axiosInstance.post('/streak/check-in')
      setStreak(prev => ({ ...prev, current_streak: res.data.data.streak, can_check_in: false }))
      fetchDashboard()
    } catch (err) { console.error('Streak claim failed:', err) }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good night'
  }

  const getMemberSince = () => {
    if (!user?.created_at) return 'New member'
    const date = new Date(user.created_at)
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `Member since ${month} ${year}`
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const formatDollar = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return `$${parseFloat(val).toFixed(2)}`
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Just now'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const renderActivityItem = (activity, idx) => (
    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(83,18,188,0.03)', mb: 1 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: activity.type === 'user_registered' ? COLORS.primary : COLORS.accent, fontSize: '0.75rem', fontWeight: 700 }}>
        {activity.username ? activity.username[0].toUpperCase() : 'U'}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {activity.type === 'user_registered' ? (
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textPrimary, lineHeight: 1.4 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>{activity.username || 'User'}</Box>{' '}from {activity.country || 'Unknown'} joined
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textPrimary, lineHeight: 1.4 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>{activity.username || 'User'}</Box>{' '}from {activity.country || 'Unknown'} completed{' '}
            <Box component="span" sx={{ color: COLORS.primary, fontWeight: 600 }}>{activity.offer_wall || 'Survey'}</Box>{' '}worth{' '}
            <Box component="span" sx={{ color: COLORS.accent, fontWeight: 700 }}>{formatPoints(activity.amount)} pts</Box>
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.3 }}>{timeAgo(activity.time)}</Typography>
      </Box>
    </Box>
  )

  const isActivePath = (path) => {
    if (!path) return false
    return location.pathname === path.split('?')[0]
  }

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', px: 2, py: 2.5 }}>
      {/* Logo */}
      <Box onClick={() => navigate('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 4, cursor: 'pointer' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(83,18,188,0.3)' }}>W</Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS.textPrimary, letterSpacing: '-0.02em' }}>WABCASH</Typography>
      </Box>

      {/* Main Nav - Attractive like SuperPay.Me */}
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

        {/* More Accordion - styled like SuperPay.Me */}
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

  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, pb: 10, pt: '60px' }}>
        {/* FIXED Top Bar - no vibration, content starts below it */}
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
                <Badge badgeContent={0} color="error"><NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} /></Badge>
              </IconButton>
              <IconButton size="small" onClick={toggleDarkMode} sx={{ color: COLORS.textSecondary }}>
                {darkMode ? <LightModeOutlinedIcon sx={{ fontSize: 22 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 22 }} />}
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Greeting */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{getGreeting()},</Typography>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: COLORS.primary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{user?.username || 'User'}! 👋</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted, mt: 0.5 }}>Here is your earning summary</Typography>
        </Box>

        {/* TOP CARD - Purple theme with THIN LINES between stats */}
        <Box sx={{ px: 2.5, mt: 2 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
            {/* Top section - darker purple */}
            <Box sx={{ bgcolor: '#3b0f8a', p: 3, pb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 42, height: 42, bgcolor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', fontWeight: 700, fontSize: '1rem' }}>{user?.username?.[0]?.toUpperCase() || 'U'}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{user?.username || 'User'}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>ID: #{user?.public_id || '---'} · {getMemberSince()}</Typography>
                </Box>
                <Chip size="small" label={user?.level_name || `Level ${user?.level_id || 1}`} sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', '& .MuiChip-label': { px: 1 } }} />
              </Box>
            </Box>
            {/* Bottom section - lighter purple with THIN VERTICAL LINES */}
            <Box sx={{ bgcolor: '#5312bc', p: 2.5, pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 0, rowGap: 2.5 }}>
                {/* Row 1: Available | Line | Locked */}
                <Box sx={{ px: 1 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>Available Points</Typography>
                  <Typography sx={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={55} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} /> : formatPoints(dashboard?.balance?.available)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', mt: 0.2 }}>≈ {formatDollar((dashboard?.balance?.available || 0) / 100)}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: '1px', height: '100%', mx: 'auto' }} />
                <Box sx={{ px: 1 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>Locking Points</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={55} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} /> : formatPoints(dashboard?.balance?.locked)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', mt: 0.2 }}>Pending</Typography>
                </Box>
                {/* Row 2: Payments | Line | This Month */}
                <Box sx={{ px: 1 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>Payments Received</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={55} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} /> : formatDollar(dashboard?.lifetime?.total_withdrawn)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', mt: 0.2 }}>Lifetime</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: '1px', height: '100%', mx: 'auto' }} />
                <Box sx={{ px: 1 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>This Month</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={55} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} /> : formatDollar((performance?.monthly_breakdown?.[0]?.earnings || 0) / 100)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', mt: 0.2 }}>Earnings</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Streak */}
        <Box sx={{ px: 2.5, mt: 2.5 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: streak?.can_check_in ? `${COLORS.accent}12` : `${COLORS.gold}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WhatshotIcon sx={{ fontSize: 22, color: streak?.can_check_in ? COLORS.accent : COLORS.gold }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>{streak?.current_streak || 0} Day Streak</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>{streak?.can_check_in ? 'Tap to claim your daily bonus!' : streak?.current_streak > 0 ? 'Keep it going for bonus rewards!' : 'Start your streak today!'}</Typography>
              </Box>
            </Box>
            {streak?.can_check_in && (
              <Box onClick={handleClaimStreak} sx={{ px: 2.5, py: 0.7, borderRadius: 2, bgcolor: COLORS.accent, color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', '&:active': { transform: 'scale(0.95)' } }}>Claim</Box>
            )}
          </Paper>
        </Box>

        {/* SURVEY ACTIVITY */}
        <Box sx={{ px: 2.5, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary }}>Survey Activity</Typography>
            <Typography onClick={() => navigate('/history')} sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>See All</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
              <PollIcon sx={{ fontSize: 24, color: COLORS.primary, mb: 0.8 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : (performance?.surveys?.total_clicks || 0)}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mt: 0.3 }}>Surveys clicked</Typography>
            </Paper>
            {/* <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
              <MonetizationOnIcon sx={{ fontSize: 24, color: COLORS.accent, mb: 0.8 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : formatPoints(dashboard?.lifetime?.total_earned)}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.accent, fontWeight: 700, mt: 0.2 }}>≈ {formatDollar((dashboard?.lifetime?.total_earned || 0) / 100)}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.2 }}>Total earnings</Typography>
            </Paper> */}
            <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
              <PollIcon sx={{ fontSize: 24, color: COLORS.primary, mb: 0.8 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : (performance?.surveys?.completed || 0)}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.2 }}>Surveys Completed</Typography>
            </Paper>
          </Box>
        </Box>

        {/* OUR PARTNERS - HERO */}
        <Box sx={{ px: 2.5, mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.primary }} />
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.01em' }}>Our Partners</Typography>
            </Box>
            <Typography onClick={() => navigate('/earn')} sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>View All</Typography>
          </Box>
          {offerWalls.length === 0 ? (
            <Paper elevation={0} sx={{ borderRadius: 3, p: 4, textAlign: 'center', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>No partners available yet. Check back soon!</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {offerWalls.slice(0, 5).map((wall, idx) => {
                const color = WALL_COLORS[idx % WALL_COLORS.length]
                const isLocked = wall.min_level && user?.level_id < wall.min_level
                return (
                  <Paper key={wall.id} elevation={0} onClick={() => !isLocked && navigate(`/earn?wall=${wall.internal_id || wall.id}`)} sx={{ borderRadius: 3, p: 2.5, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg, cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1, transition: 'all 0.2s', '&:active': !isLocked && { transform: 'scale(0.98)' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <StarIcon sx={{ fontSize: 24, color }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary }}>{wall.name}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted, mt: 0.2, lineHeight: 1.4 }}>{wall.description || 'High paying surveys and offers'}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.6 }}>
                          <StarIcon sx={{ fontSize: 14, color: COLORS.gold }} />
                          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary, fontWeight: 600 }}>{wall.rating || '4.5'}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>({wall.review_count || '120'} reviews)</Typography>
                        </Box>
                      </Box>
                      <ArrowForwardIosIcon sx={{ fontSize: 16, color: COLORS.textMuted, flexShrink: 0 }} />
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>

        {/* Chat FAB */}
        <Zoom in={true}>
          <Fab onClick={() => setChatPanelOpen(true)} sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1200, bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark }, width: 48, height: 48 }}>
            <ChatOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Fab>
        </Zoom>

        {/* Chat Panel */}
        <Box sx={{
          position: 'fixed', bottom: chatPanelOpen ? '64px' : '-100vh', left: 0, right: 0, zIndex: 1300,
          borderRadius: '20px 20px 0 0', maxHeight: '60vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', bgcolor: COLORS.cardBg,
          transition: 'bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: chatPanelOpen ? '0 -4px 20px rgba(0,0,0,0.15)' : 'none',
        }}>
          <Box sx={{ p: 2, bgcolor: COLORS.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Earnings</Typography>
              <Typography sx={{ fontSize: '0.72rem', opacity: 0.8 }}>{liveActivity.length} users online</Typography>
            </Box>
            <IconButton onClick={() => setChatPanelOpen(false)} sx={{ color: '#fff' }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
          </Box>
          <Box sx={{ p: 2, overflowY: 'auto', flex: 1, maxHeight: '45vh', bgcolor: COLORS.bg }}>
            {liveActivity.length === 0 && <Typography sx={{ textAlign: 'center', color: COLORS.textMuted, py: 4, fontSize: '0.85rem' }}>No activity yet. Start earning!</Typography>}
            {liveActivity.map((activity, idx) => renderActivityItem(activity, idx))}
          </Box>
        </Box>

        {/* BOTTOM NAV - Active tab turns purple */}
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, bgcolor: COLORS.navBg, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-around', py: 1, px: 1, height: '64px' }}>
          {MOBILE_NAV.map((item) => {
            const isActive = activeTab === item.path || (item.action === 'more' && moreOpen)
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

        {/* More Panel */}
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
      </Box>
    )
  }

  // DESKTOP LAYOUT
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.bg }}>
      {/* LEFT SIDEBAR */}
      <Box sx={{ width: 260, position: 'fixed', top: 0, left: 0, bottom: 0, bgcolor: COLORS.sidebarBg, borderRight: `1px solid ${COLORS.headerBorder}`, zIndex: 1200, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: `${COLORS.primary}20`, borderRadius: 2 } }}>
        <SidebarContent />
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, ml: '260px', minHeight: '100vh' }}>
        {/* STICKY TOP BAR */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: COLORS.headerBg, borderBottom: scrolled ? `1px solid ${COLORS.headerBorder}` : '1px solid transparent', boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'box-shadow 0.2s ease', px: 4, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{getGreeting()}, {user?.username || 'User'}! 👋</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: COLORS.textMuted, mt: 0.3 }}>Here is your earning summary</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton onClick={() => navigate('/notifications')} sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.primary } }}>
                  <Badge badgeContent={0} color="error"><NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} /></Badge>
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

        {/* CONTENT AREA */}
        <Box sx={{ px: 4, py: 3, maxWidth: 1200 }}>
          {/* USER STATS CARD - Purple with THIN VERTICAL LINES between stats */}
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative', mb: 3 }}>
            {/* Top section - darker purple */}
            <Box sx={{ bgcolor: '#3b0f8a', p: 4, pb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '1.1rem' }}>{user?.username?.[0]?.toUpperCase() || 'U'}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{user?.username || 'User'}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>ID: #{user?.public_id || '---'} · {getMemberSince()}</Typography>
                </Box>
                <Chip label={user?.level_name || `Level ${user?.level_id || 1}`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', '& .MuiChip-label': { px: 1.5 } }} />
              </Box>
            </Box>
            {/* Bottom section - lighter purple with THIN VERTICAL LINES */}
            <Box sx={{ bgcolor: '#5312bc', p: 3.5, pt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr 1px 1fr', gap: 0, alignItems: 'stretch' }}>
                {/* Available Points */}
                <Box sx={{ px: 2, py: 0.5 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.6 }}>Available Points</Typography>
                  <Typography sx={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={90} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} /> : formatPoints(dashboard?.balance?.available)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mt: 0.4 }}>≈ {formatDollar((dashboard?.balance?.available || 0) / 100)} value</Typography>
                </Box>
                {/* Thin line */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: '1px', my: 1 }} />
                {/* Locking Points */}
                <Box sx={{ px: 2, py: 0.5 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.6 }}>Locking Points</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={90} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} /> : formatPoints(dashboard?.balance?.locked)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mt: 0.4 }}>Pending clearance</Typography>
                </Box>
                {/* Thin line */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: '1px', my: 1 }} />
                {/* Payments Received */}
                <Box sx={{ px: 2, py: 0.5 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.6 }}>Payments Received</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={90} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} /> : formatDollar(dashboard?.lifetime?.total_withdrawn)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mt: 0.4 }}>Lifetime total</Typography>
                </Box>
                {/* Thin line */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: '1px', my: 1 }} />
                {/* This Month */}
                <Box sx={{ px: 2, py: 0.5 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.6 }}>This Month</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.2 }}>{loading ? <Skeleton width={90} height={30} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} /> : formatDollar((performance?.monthly_breakdown?.[0]?.earnings || 0) / 100)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mt: 0.4 }}>Earnings this month</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* STREAK */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: streak?.can_check_in ? `${COLORS.accent}12` : `${COLORS.gold}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WhatshotIcon sx={{ fontSize: 24, color: streak?.can_check_in ? COLORS.accent : COLORS.gold }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: COLORS.textPrimary }}>{streak?.current_streak || 0} Day Streak</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textMuted, mt: 0.3 }}>{streak?.can_check_in ? 'Tap to claim your daily bonus!' : streak?.current_streak > 0 ? 'Keep it going for bonus rewards!' : 'Start your streak today!'}</Typography>
              </Box>
            </Box>
            {streak?.can_check_in && (
              <Box onClick={handleClaimStreak} sx={{ px: 3, py: 0.8, borderRadius: 2.5, bgcolor: COLORS.accent, color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#059669', transform: 'translateY(-1px)' } }}>Claim Now</Box>
            )}
          </Paper>

          {/* SURVEY ACTIVITY */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary }}>Survey Activity</Typography>
              <Typography onClick={() => navigate('/history')} sx={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.primary, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>See All</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2.5, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
                <PollIcon sx={{ fontSize: 26, color: COLORS.primary, mb: 0.8 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: COLORS.textPrimary }}>{loading ? <Skeleton width={50} sx={{ mx: 'auto' }} /> : (performance?.surveys?.total_clicks || 0)}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mt: 0.3 }}>Surveys clicked</Typography>
              </Paper>
              {/* <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2.5, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
                <MonetizationOnIcon sx={{ fontSize: 26, color: COLORS.accent, mb: 0.8 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: COLORS.textPrimary }}>{loading ? <Skeleton width={50} sx={{ mx: 'auto' }} /> : formatPoints(dashboard?.lifetime?.total_earned)}</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.accent, fontWeight: 700, mt: 0.2 }}>≈ {formatDollar((performance?.monthly_breakdown?.[0]?.earnings || 0) / 100)}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mt: 0.2 }}>Total earnings</Typography>
              </Paper> */}
              <Paper elevation={0} sx={{ borderRadius: 2.5, p: 2, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
                <PollIcon sx={{ fontSize: 24, color: COLORS.primary, mb: 0.8 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : (performance?.surveys?.completed || 0)}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.2 }}>Surveys Completed</Typography>
              </Paper>
            </Box>
          </Box>

          {/* PARTNERS + LIVE ACTIVITY + REFERRAL */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 3 }}>
            {/* Partners - HERO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.primary }} />
                  <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.01em' }}>Our Partners</Typography>
                </Box>
                <Typography onClick={() => navigate('/earn')} sx={{ fontSize: '0.82rem', fontWeight: 600, color: COLORS.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>View All <ArrowForwardIosIcon sx={{ fontSize: 11 }} /></Typography>
              </Box>
              {offerWalls.length === 0 ? (
                <Paper elevation={0} sx={{ borderRadius: 3, p: 5, textAlign: 'center', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                  <Typography sx={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>No partners available yet. Check back soon!</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {offerWalls.map((wall, idx) => {
                    const color = WALL_COLORS[idx % WALL_COLORS.length]
                    const isLocked = wall.min_level && user?.level_id < wall.min_level
                    return (
                      <Paper key={wall.id} elevation={0} onClick={() => !isLocked && navigate(`/earn?wall=${wall.internal_id || wall.id}`)} sx={{ borderRadius: 3, p: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg, cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1, transition: 'all 0.25s ease', '&:hover': !isLocked && { boxShadow: '0 8px 30px rgba(83,18,188,0.08)', transform: 'translateY(-2px)', borderColor: `${COLORS.primary}30` } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <StarIcon sx={{ fontSize: 26, color }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary }}>{wall.name}</Typography>
                            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textMuted, mt: 0.3, lineHeight: 1.4 }}>{wall.description || 'High paying surveys and offers'}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                              <StarIcon sx={{ fontSize: 14, color: COLORS.gold }} />
                              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, fontWeight: 600 }}>{wall.rating || '4.5'}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>({wall.review_count || '120'} reviews)</Typography>
                            </Box>
                          </Box>
                          <ArrowForwardIosIcon sx={{ fontSize: 18, color: COLORS.textMuted, flexShrink: 0 }} />
                        </Box>
                      </Paper>
                    )
                  })}
                </Box>
              )}
            </Box>

            {/* Right Column: Live Activity + Referral */}
            <Box>
              {/* Live Activity */}
              <Paper elevation={0} sx={{ borderRadius: 3, p: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, position: 'sticky', top: 90 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: COLORS.textPrimary }}>Live Earnings</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, fontWeight: 600 }}>{liveActivity.length} online</Typography>
                </Box>
                <Box sx={{ maxHeight: 320, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: `${COLORS.primary}20`, borderRadius: 2 } }}>
                  {liveActivity.length === 0 && <Typography sx={{ textAlign: 'center', color: COLORS.textMuted, py: 4, fontSize: '0.82rem' }}>No activity yet. Start earning!</Typography>}
                  {liveActivity.map((activity, idx) => renderActivityItem(activity, idx))}
                </Box>
              </Paper>

              {/* Referral CTA - dark mode safe */}
              <Paper elevation={0} sx={{ borderRadius: 3, p: 2.5, mt: 2, bgcolor: darkMode ? 'rgba(83,18,188,0.08)' : `${COLORS.primary}04`, border: `1px dashed ${darkMode ? 'rgba(124,58,237,0.4)' : `${COLORS.primary}25`}`, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: darkMode ? '#a78bfa' : COLORS.primary, mb: 0.5 }}>Refer & Earn</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: COLORS.textSecondary, mb: 1.5, lineHeight: 1.4 }}>Invite friends and earn 10% of their earnings forever!</Typography>
                <Box onClick={() => navigate('/referrals')} sx={{ px: 2.5, py: 0.7, borderRadius: 2, bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: COLORS.primaryDark, transform: 'translateY(-1px)' }, display: 'inline-block' }}>
                  Get Referral Link
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardPage