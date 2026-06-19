import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Badge,
  Fade,
  Slide,
  Drawer,
  Fab,
  Zoom,
  Collapse,
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import PollIcon from '@mui/icons-material/Poll'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import StarIcon from '@mui/icons-material/Star'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
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
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'

const COLORS = {
  primary: '#5312bc',
  primaryLight: '#7c3aed',
  primaryDark: '#3b0f8a',
  accent: '#10b981',
  bg: '#faf8ff',
  cardBg: '#ffffff',
  textPrimary: '#1e1b4b',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  gold: '#f59e0b',
  blue: '#1e3a8a',
  blueLight: '#1d4ed8',
  blueMid: '#2563eb',
  bluePale: '#3b82f6',
}

const WALL_COLORS = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6']

const MAIN_NAV = [
  { label: 'Surveys', icon: <PollIcon fontSize="small" />, path: '/earn' },
  { label: 'Games', icon: <SportsEsportsIcon fontSize="small" />, path: '/earn?tab=games' },
  { label: 'Offers', icon: <LocalOfferIcon fontSize="small" />, path: '/earn?tab=offers' },
]

const MORE_NAV = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { label: 'Withdraw', icon: <AccountBalanceWalletIcon fontSize="small" />, path: '/withdraw' },
  { label: 'History', icon: <HistoryIcon fontSize="small" />, path: '/history' },
  { label: 'Referrals', icon: <PeopleIcon fontSize="small" />, path: '/referrals' },
  { label: 'Support', icon: <SupportAgentIcon fontSize="small" />, path: '/support' },
  { label: 'Profile', icon: <AccountCircleIcon fontSize="small" />, path: '/profile' },
  { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
]

const DashboardPage = ({ darkMode, toggleDarkMode }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { user } = useSelector((state) => state.auth)
  const [dashboard, setDashboard] = useState(null)
  const [offerWalls, setOfferWalls] = useState([])
  const [streak, setStreak] = useState(null)
  const [liveActivity, setLiveActivity] = useState([])
  const [chatPanelOpen, setChatPanelOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const sseRef = useRef(null)

  useEffect(() => {
    dispatch(fetchCurrentUser())
    fetchDashboard()
    fetchOfferWalls()
    fetchStreakAndAutoCheckIn()
    fetchLiveActivity()
    connectSSE()
    return () => {
      if (sseRef.current) sseRef.current.close()
    }
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
        } catch (e) {
          console.error('Auto streak check-in failed:', e)
        }
      }
    } catch (err) {
      console.error('Streak fetch failed:', err)
    }
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
        } catch {}
      })
      sse.addEventListener('heartbeat', () => {})
      sse.onerror = () => {
        sse.close()
        setTimeout(connectSSE, 8000)
      }
    } catch (err) {
      console.error('SSE connection failed:', err)
    }
  }

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/')
      setDashboard(response.data.data)
    } catch (err) {
      console.error('Dashboard fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOfferWalls = async () => {
    try {
      const res = await axiosInstance.get('/offer-walls/')
      setOfferWalls(res.data.data || [])
    } catch (err) {
      console.error('Offer walls fetch failed:', err)
    }
  }

  const fetchLiveActivity = async () => {
    try {
      const res = await axiosInstance.get('/live-activity/recent?limit=15')
      setLiveActivity(res.data.data || [])
    } catch (err) {
      console.error('Live activity fetch failed:', err)
    }
  }

  const handleClaimStreak = async () => {
    if (!streak?.can_check_in) return
    try {
      const res = await axiosInstance.post('/streak/check-in')
      setStreak(prev => ({ ...prev, current_streak: res.data.data.streak, can_check_in: false }))
      fetchDashboard()
    } catch (err) {
      console.error('Streak claim failed:', err)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good night'
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
    <Box
      key={activity.id || idx}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.2,
        mb: 1.2,
        p: 1.2,
        borderRadius: 2,
        bgcolor: idx % 2 === 0 ? `${COLORS.primary}04` : 'transparent',
      }}
    >
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: '0.7rem',
          bgcolor: WALL_COLORS[idx % WALL_COLORS.length],
          fontWeight: 700,
        }}
      >
        {activity.username?.[0]?.toUpperCase() || 'U'}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.78rem', color: COLORS.textPrimary, lineHeight: 1.5 }}>
          {activity.type === 'user_registered' ? (
            <>
              <span style={{ color: COLORS.primary, fontWeight: 700 }}>{activity.username || 'User'}</span>
              {' '}from <span style={{ fontWeight: 600 }}>{activity.country || 'Unknown'}</span> joined WABCASH
            </>
          ) : (
            <>
              <span style={{ color: COLORS.primary, fontWeight: 700 }}>{activity.username || 'User'}</span>
              {' '}from <span style={{ fontWeight: 600 }}>{activity.country || 'Unknown'}</span>
              {' '}completed <span style={{ fontWeight: 600 }}>{activity.offer_wall || 'Survey'}</span>
              {' '}worth <span style={{ color: COLORS.accent, fontWeight: 700 }}>{formatPoints(activity.amount)} pts</span>
            </>
          )}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: COLORS.textMuted, mt: 0.3 }}>
          {timeAgo(activity.time)}
        </Typography>
      </Box>
    </Box>
  )

  // ─── SIDEBAR CONTENT (shared desktop + mobile drawer) ───
  const SidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2.5, mb: 4 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
          }}
        >
          W
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.primary }}>
          WABCASH
        </Typography>
      </Box>

      {/* Main Nav: Surveys, Games, Offers */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, px: 1.5 }}>
        {MAIN_NAV.map((item) => (
          <Box
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: 'pointer',
              color: COLORS.textSecondary,
              fontWeight: 500,
              transition: 'all 0.15s',
              '&:hover': { bgcolor: `${COLORS.primary}04`, color: COLORS.primary },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>{item.icon}</Box>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 'inherit' }}>{item.label}</Typography>
          </Box>
        ))}

        {/* More - with accordion */}
        <Box>
          <Box
            onClick={() => setMoreExpanded(!moreExpanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: 'pointer',
              color: COLORS.textSecondary,
              fontWeight: 500,
              transition: 'all 0.15s',
              '&:hover': { bgcolor: `${COLORS.primary}04`, color: COLORS.primary },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                <MoreHorizIcon fontSize="small" />
              </Box>
              <Typography sx={{ fontSize: '0.88rem' }}>More</Typography>
            </Box>
            {moreExpanded ? <ExpandLessIcon sx={{ fontSize: '1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
          </Box>
          <Collapse in={moreExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, pl: 4, mt: 0.5 }}>
              {MORE_NAV.map((item) => (
                <Box
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 2,
                    cursor: 'pointer',
                    color: COLORS.textSecondary,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: `${COLORS.primary}04`, color: COLORS.primary },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: '0.85rem' }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* Logout */}
      <Box sx={{ mt: 'auto', px: 1.5, pt: 2 }}>
        <Box
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/'
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            cursor: 'pointer',
            color: COLORS.textSecondary,
            transition: 'all 0.15s',
            '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' },
          }}
        >
          <LogoutIcon fontSize="small" sx={{ opacity: 0.8 }} />
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 500 }}>Logout</Typography>
        </Box>
      </Box>
    </Box>
  )

  // ═══════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <Box sx={{ bgcolor: darkMode ? '#0f172a' : COLORS.bg, minHeight: '100vh', pb: 10 }}>
        {/* ─── Sticky Navbar: NO hamburger, just Logo + Theme + Bell ─── */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
            borderBottom: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
            px: 2,
            py: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: COLORS.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              W
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: darkMode ? '#fff' : COLORS.primary }}>
              WABCASH
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <IconButton size="small" onClick={toggleDarkMode} sx={{ color: darkMode ? '#cbd5e1' : COLORS.textSecondary }}>
              {darkMode ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" sx={{ color: darkMode ? '#cbd5e1' : COLORS.textSecondary }}>
              <Badge badgeContent={0} color="error">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 2, pt: 2 }}>
          {/* ─── GREETING ─── */}
          <Typography sx={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary, mb: 1.5 }}>
            {getGreeting()}, {user?.username || 'User'} 👋
          </Typography>

          {/* ─── USER CARD — Matches Photo 2 Exactly ─── */}
          <Slide direction="up" in={!loading} timeout={500}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                background: `linear-gradient(160deg, ${COLORS.blueLight} 0%, ${COLORS.blueMid} 50%, ${COLORS.bluePale} 100%)`,
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                mb: 2,
              }}
            >
              {/* Header row */}
              <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {user?.username || 'User'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', opacity: 0.75 }}>
                      ID: #{user?.public_id || '---'} · Member since 2024
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={<StarIcon sx={{ fontSize: '0.75rem !important', color: '#fbbf24 !important' }} />}
                  label={user?.level_name || `Level ${user?.level_id || 1}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    border: '1px solid rgba(255,255,255,0.25)',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Box>

              {/* Divider */}
              <Box sx={{ mx: 2.5, height: '1px', bgcolor: 'rgba(255,255,255,0.15)' }} />

              {/* 4 Stats — Properly separated */}
              <Box sx={{ p: 2.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', bgcolor: 'rgba(255,255,255,0.08)' }}>
                <Box sx={{ p: 1.5, bgcolor: 'transparent' }}>
                  <Typography sx={{ fontSize: '0.58rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.2, mb: 0.5 }}>
                    ◎ Available Points
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#fbbf24' }}>
                    {loading ? <Skeleton width={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : formatPoints(dashboard?.balance?.available)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', opacity: 0.5 }}>
                    ≈ {formatDollar((dashboard?.balance?.available || 0) / 100)} value
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'transparent' }}>
                  <Typography sx={{ fontSize: '0.58rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.2, mb: 0.5 }}>
                    🔒 Locking Points
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                    {loading ? <Skeleton width={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : formatPoints(dashboard?.balance?.locked)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', opacity: 0.5 }}>
                    Clears in 7 days
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'transparent' }}>
                  <Typography sx={{ fontSize: '0.58rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.2, mb: 0.5 }}>
                    💵 Payments Received
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                    {loading ? <Skeleton width={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : formatDollar(dashboard?.lifetime?.total_withdrawn)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', opacity: 0.5 }}>
                    Lifetime total
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'transparent' }}>
                  <Typography sx={{ fontSize: '0.58rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.2, mb: 0.5 }}>
                    📈 This Month
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                    {loading ? <Skeleton width={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : formatPoints(dashboard?.lifetime?.total_earned)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', opacity: 0.5 }}>
                    ≈ {formatDollar((dashboard?.lifetime?.total_earned || 0) / 100)} value
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Slide>

          {/* ─── STREAK ─── */}
          <Fade in={!loading} timeout={600}>
            <Paper
              elevation={0}
              onClick={streak?.can_check_in ? handleClaimStreak : undefined}
              sx={{
                borderRadius: 3,
                p: 2,
                mb: 2,
                border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                bgcolor: streak?.can_check_in ? `${COLORS.accent}08` : darkMode ? '#1e293b' : COLORS.cardBg,
                cursor: streak?.can_check_in ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.2s',
                '&:active': streak?.can_check_in && { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '14px',
                  bgcolor: streak?.can_check_in ? `${COLORS.accent}12` : `${COLORS.gold}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: streak?.can_check_in ? COLORS.accent : COLORS.gold,
                }}
              >
                <WhatshotIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                  {streak?.current_streak || 0} Day Streak
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>
                  {streak?.can_check_in
                    ? 'Tap to claim your daily bonus!'
                    : streak?.current_streak > 0
                    ? 'Keep it going for bonus rewards!'
                    : 'Start your streak today!'}
                </Typography>
              </Box>
              {streak?.can_check_in && (
                <Box sx={{ bgcolor: COLORS.accent, color: '#fff', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.7rem', fontWeight: 700 }}>
                  Claim
                </Box>
              )}
            </Paper>
          </Fade>

          {/* ─── SURVEY ACTIVITY — REAL API ─── */}
          <Fade in={!loading} timeout={700}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: darkMode ? '#94a3b8' : COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, mb: 1.5 }}>
                Survey Activity
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Paper elevation={0} sx={{ flex: 1, borderRadius: 3, p: 2, border: `1px solid ${darkMode ? '#334155' : COLORS.border}`, bgcolor: darkMode ? '#1e293b' : COLORS.cardBg }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.primary, mb: 1 }}>
                    <PollIcon fontSize="small" />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                    {loading ? <Skeleton width={40} /> : dashboard?.lifetime?.total_surveys_completed || 0}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>Surveys clicked</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, borderRadius: 3, p: 2, border: `1px solid ${darkMode ? '#334155' : COLORS.border}`, bgcolor: darkMode ? '#1e293b' : COLORS.cardBg }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${COLORS.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.accent, mb: 1 }}>
                    <TrendingUpIcon fontSize="small" />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                    {loading ? <Skeleton width={40} /> : formatPoints(dashboard?.lifetime?.total_earned)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>Total earnings</Typography>
                </Paper>
              </Box>
            </Box>
          </Fade>

          {/* ─── OUR PARTNERS ─── */}
          <Fade in={!loading} timeout={800}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: darkMode ? '#94a3b8' : COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Our Partners
                </Typography>
                <Link to="/earn" style={{ textDecoration: 'none' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    View All <ArrowForwardIosIcon sx={{ fontSize: '0.55rem' }} />
                  </Typography>
                </Link>
              </Box>

              {offerWalls.length === 0 ? (
                <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: `1px solid ${darkMode ? '#334155' : COLORS.border}`, bgcolor: darkMode ? '#1e293b' : COLORS.cardBg, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>
                    No partners available yet. Check back soon!
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {offerWalls.slice(0, 6).map((wall, idx) => {
                    const color = WALL_COLORS[idx % WALL_COLORS.length]
                    const isLocked = wall.min_level && user?.level_id < wall.min_level
                    return (
                      <Paper
                        key={wall.id}
                        elevation={0}
                        onClick={() => !isLocked && navigate(`/earn?wall=${wall.id}`)}
                        sx={{
                          borderRadius: 3,
                          p: 2.2,
                          border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                          bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          opacity: isLocked ? 0.5 : 1,
                          transition: 'all 0.2s',
                          '&:active': !isLocked && { transform: 'scale(0.97)' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                            <PollIcon fontSize="small" />
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                            {wall.name}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary, mb: 0.8, lineHeight: 1.4 }}>
                          {wall.description || 'High paying surveys and offers'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: '0.7rem', color: COLORS.gold }} />
                          <Typography sx={{ fontSize: '0.68rem', color: darkMode ? '#64748b' : COLORS.textMuted }}>
                            {wall.rating || '4.5'} ({wall.review_count || '120'})
                          </Typography>
                        </Box>
                      </Paper>
                    )
                  })}
                </Box>
              )}
            </Box>
          </Fade>
        </Box>

        {/* ─── CHAT FAB ─── */}
        <Zoom in={!chatPanelOpen}>
          <Fab
            color="primary"
            size="medium"
            onClick={() => setChatPanelOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: 1200,
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.primaryDark },
            }}
          >
            <ChatOutlinedIcon />
          </Fab>
        </Zoom>

        {/* ─── CHAT PANEL ─── */}
        <Slide direction="up" in={chatPanelOpen} mountOnEnter unmountOnExit>
          <Paper
            elevation={4}
            sx={{
              position: 'fixed',
              bottom: 72,
              left: 8,
              right: 8,
              maxHeight: '60vh',
              borderRadius: 3,
              border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
              bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
              zIndex: 1300,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: COLORS.primary, color: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', animation: 'pulse 2s infinite' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Live Earnings</Typography>
                <Typography sx={{ fontSize: '0.7rem', opacity: 0.7 }}>({liveActivity.length})</Typography>
              </Box>
              <IconButton size="small" onClick={() => setChatPanelOpen(false)} sx={{ color: '#fff' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 1.5 }}>
              {liveActivity.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: darkMode ? '#64748b' : COLORS.textMuted, fontSize: '0.8rem', py: 3 }}>
                  No activity yet. Start earning!
                </Typography>
              )}
              {liveActivity.map((activity, idx) => renderActivityItem(activity, idx))}
            </Box>
          </Paper>
        </Slide>

        {/* ─── BOTTOM NAV ─── */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
            borderTop: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-around',
            py: 0.8,
            px: 1,
            zIndex: 1200,
          }}
        >
          {[
            { label: 'Surveys', icon: <PollIcon />, path: '/earn' },
            { label: 'Games', icon: <SportsEsportsIcon />, path: '/earn?tab=games' },
            { label: 'Offers', icon: <LocalOfferIcon />, path: '/earn?tab=offers' },
            { label: 'More', icon: <MoreHorizIcon />, path: null, action: () => setMoreOpen(true) },
          ].map((item) => (
            <Box
              key={item.label}
              onClick={() => item.path ? navigate(item.path) : item.action?.()}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.2,
                cursor: 'pointer',
                color: darkMode ? '#94a3b8' : COLORS.textSecondary,
                transition: 'color 0.2s',
                '&:hover': { color: COLORS.primary },
              }}
            >
              <Box sx={{ fontSize: '1.3rem' }}>{item.icon}</Box>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 600 }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* ─── MORE PANEL (slide up from bottom) ─── */}
        <Slide direction="up" in={moreOpen} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 56,
              left: 0,
              right: 0,
              borderRadius: '16px 16px 0 0',
              border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
              borderBottom: 'none',
              bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
              zIndex: 1300,
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle bar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
              <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: darkMode ? '#475569' : COLORS.border }} />
            </Box>
            {/* Header */}
            <Box sx={{ px: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                More Options
              </Typography>
              <IconButton size="small" onClick={() => setMoreOpen(false)} sx={{ color: darkMode ? '#cbd5e1' : COLORS.textSecondary }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {/* Grid of options */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, px: 2.5, pb: 3 }}>
              {MORE_NAV.map((item) => (
                <Box
                  key={item.label}
                  onClick={() => { setMoreOpen(false); navigate(item.path); }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.8,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    color: darkMode ? '#cbd5e1' : COLORS.textSecondary,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: `${COLORS.primary}08`, color: COLORS.primary },
                  }}
                >
                  <Box sx={{ color: COLORS.primary, opacity: 0.9 }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.label}</Typography>
                </Box>
              ))}
              {/* Logout */}
              <Box
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  window.location.href = '/'
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.8,
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  color: '#ef4444',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#fef2f2' },
                }}
              >
                <Box><LogoutIcon fontSize="small" /></Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Logout</Typography>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Box>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ═══════════════════════════════════════════════════════════════
  return (
    <Box sx={{ bgcolor: darkMode ? '#0f172a' : COLORS.bg, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', maxWidth: 1400, mx: 'auto' }}>
        {/* ─── LEFT SIDEBAR — Fixed, Clean ─── */}
        <Box
          sx={{
            width: 240,
            minHeight: '100vh',
            bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
            borderRight: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            py: 3,
            px: 2,
            zIndex: 100,
          }}
        >
          <SidebarContent />
        </Box>

        {/* ─── MAIN CONTENT — offset for fixed sidebar ─── */}
        <Box sx={{ flex: 1, ml: '240px', p: 3, maxWidth: 'calc(100% - 240px)' }}>
          {/* Top bar with greeting */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : COLORS.textMuted }}>
                {getGreeting()}, {user?.username || 'User'} 👋
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: darkMode ? '#64748b' : COLORS.textSecondary }}>
                Here is your earning summary
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={toggleDarkMode} sx={{ color: darkMode ? '#cbd5e1' : COLORS.textSecondary }}>
                {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
              <IconButton size="small" sx={{ color: darkMode ? '#cbd5e1' : COLORS.textSecondary }}>
                <Badge badgeContent={0} color="error">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Box>
          </Box>

          {/* ─── USER CARD — Desktop, Properly Spaced ─── */}
          <Slide direction="up" in={!loading} timeout={500}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(160deg, ${COLORS.blueLight} 0%, ${COLORS.blueMid} 50%, ${COLORS.bluePale} 100%)`,
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                mb: 3,
              }}
            >
              {/* Header */}
              <Box sx={{ p: 3, pb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1.3rem',
                      border: '2px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                      {user?.username || 'User'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      ID: #{user?.public_id || '---'} · Member since 2024
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={<StarIcon sx={{ fontSize: '0.9rem !important', color: '#fbbf24 !important' }} />}
                  label={user?.level_name || `Level ${user?.level_id || 1}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '& .MuiChip-label': { px: 1.5 },
                  }}
                />
              </Box>

              {/* Divider */}
              <Box sx={{ mx: 3, height: '1px', bgcolor: 'rgba(255,255,255,0.12)' }} />

              {/* 4 Stats — Properly spaced with clear separation */}
              <Box sx={{ p: 3, pt: 2.5, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
                {[
                  { label: 'Available Points', value: formatPoints(dashboard?.balance?.available), sub: `≈ ${formatDollar((dashboard?.balance?.available || 0) / 100)} value`, color: '#fbbf24', icon: '◎' },
                  { label: 'Locking Points', value: formatPoints(dashboard?.balance?.locked), sub: 'Clears in 7 days', color: '#fff', icon: '🔒' },
                  { label: 'Payments Received', value: formatDollar(dashboard?.lifetime?.total_withdrawn), sub: 'Lifetime total', color: '#fff', icon: '💵' },
                  { label: 'This Month', value: formatPoints(dashboard?.lifetime?.total_earned), sub: `≈ ${formatDollar((dashboard?.lifetime?.total_earned || 0) / 100)} value`, color: '#fff', icon: '📈' },
                ].map((stat, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.62rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1, mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ fontSize: '0.75rem' }}>{stat.icon}</span> {stat.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: stat.color, mb: 0.3 }}>
                      {loading ? <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} /> : stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', opacity: 0.4 }}>{stat.sub}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Slide>

          {/* ─── STREAK ─── */}
          <Fade in={!loading} timeout={600}>
            <Paper
              elevation={0}
              onClick={streak?.can_check_in ? handleClaimStreak : undefined}
              sx={{
                borderRadius: 3,
                p: 2.5,
                mb: 3,
                border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                bgcolor: streak?.can_check_in ? `${COLORS.accent}06` : darkMode ? '#1e293b' : COLORS.cardBg,
                cursor: streak?.can_check_in ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                transition: 'all 0.2s',
                '&:hover': streak?.can_check_in && { boxShadow: '0 4px 20px rgba(16,185,129,0.15)' },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  bgcolor: streak?.can_check_in ? `${COLORS.accent}12` : `${COLORS.gold}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: streak?.can_check_in ? COLORS.accent : COLORS.gold,
                }}
              >
                <WhatshotIcon sx={{ fontSize: '1.5rem' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                  {streak?.current_streak || 0} Day Streak
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>
                  {streak?.can_check_in
                    ? 'Tap to claim your daily bonus!'
                    : streak?.current_streak > 0
                    ? 'Keep it going for bonus rewards!'
                    : 'Start your streak today!'}
                </Typography>
              </Box>
              {streak?.can_check_in && (
                <Box sx={{ bgcolor: COLORS.accent, color: '#fff', px: 2, py: 0.7, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700 }}>
                  Claim Now
                </Box>
              )}
            </Paper>
          </Fade>

          {/* ─── SURVEY ACTIVITY — Desktop ─── */}
          <Fade in={!loading} timeout={700}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: darkMode ? '#94a3b8' : COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, mb: 1.5 }}>
                Survey Activity
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[
                  { icon: <PollIcon />, label: 'Surveys clicked', value: dashboard?.lifetime?.total_surveys_completed || 0, color: COLORS.primary },
                  { icon: <TrendingUpIcon />, label: 'Total earnings', value: formatPoints(dashboard?.lifetime?.total_earned), color: COLORS.accent },
                ].map((stat, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      flex: 1,
                      borderRadius: 3,
                      p: 2.5,
                      border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                      bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>
                        {loading ? <Skeleton width={50} /> : stat.value}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>{stat.label}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Fade>

          {/* ─── PARTNERS + LIVE ACTIVITY ─── */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Partners */}
            <Box sx={{ flex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: darkMode ? '#94a3b8' : COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Our Partners
                </Typography>
                <Link to="/earn" style={{ textDecoration: 'none' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    View All <ArrowForwardIosIcon sx={{ fontSize: '0.65rem' }} />
                  </Typography>
                </Link>
              </Box>

              {offerWalls.length === 0 ? (
                <Paper elevation={0} sx={{ borderRadius: 3, p: 4, border: `1px solid ${darkMode ? '#334155' : COLORS.border}`, bgcolor: darkMode ? '#1e293b' : COLORS.cardBg, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary }}>
                    No partners available yet. Check back soon!
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {offerWalls.map((wall, idx) => {
                    const color = WALL_COLORS[idx % WALL_COLORS.length]
                    const isLocked = wall.min_level && user?.level_id < wall.min_level
                    return (
                      <Paper
                        key={wall.id}
                        elevation={0}
                        onClick={() => !isLocked && navigate(`/earn?wall=${wall.id}`)}
                        sx={{
                          borderRadius: 3,
                          p: 2.5,
                          border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                          bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          opacity: isLocked ? 0.5 : 1,
                          transition: 'all 0.2s',
                          '&:hover': !isLocked && {
                            boxShadow: '0 4px 20px rgba(83,18,188,0.08)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                            <PollIcon />
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: darkMode ? '#fff' : COLORS.textPrimary }}>{wall.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary, mb: 1, lineHeight: 1.4 }}>
                          {wall.description || 'High paying surveys and offers'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: '0.8rem', color: COLORS.gold }} />
                          <Typography sx={{ fontSize: '0.75rem', color: darkMode ? '#64748b' : COLORS.textMuted }}>
                            {wall.rating || '4.5'} ({wall.review_count || '120'})
                          </Typography>
                        </Box>
                      </Paper>
                    )
                  })}
                </Box>
              )}
            </Box>

            {/* Right Panel */}
            <Box sx={{ width: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                  bgcolor: darkMode ? '#1e293b' : COLORS.cardBg,
                  overflow: 'hidden',
                  flex: 1,
                }}
              >
                <Box sx={{ p: 2, borderBottom: `1px solid ${darkMode ? '#334155' : COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1, bgcolor: COLORS.primary, color: '#fff' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', animation: 'pulse 2s infinite' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Earnings</Typography>
                  <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, ml: 'auto' }}>{liveActivity.length} online</Typography>
                </Box>
                <Box sx={{ maxHeight: 420, overflowY: 'auto', p: 1.5 }}>
                  {liveActivity.length === 0 && (
                    <Typography sx={{ textAlign: 'center', color: darkMode ? '#64748b' : COLORS.textMuted, fontSize: '0.85rem', py: 3 }}>
                      No activity yet. Start earning!
                    </Typography>
                  )}
                  {liveActivity.map((activity, idx) => renderActivityItem(activity, idx))}
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  border: `1px solid ${darkMode ? '#334155' : COLORS.border}`,
                  bgcolor: darkMode ? '#1e293b' : `${COLORS.accent}05`,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: COLORS.primary, mb: 0.5 }}>
                  🎁 Refer & Earn
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : COLORS.textSecondary, mb: 1.5 }}>
                  Invite friends and earn 10% of their earnings forever!
                </Typography>
                <Box
                  sx={{
                    bgcolor: COLORS.primary,
                    color: '#fff',
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: COLORS.primaryDark },
                  }}
                  onClick={() => navigate('/referrals')}
                >
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
