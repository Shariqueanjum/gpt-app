import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Chip,
  Fade,
  Skeleton,
  useTheme,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import LockIcon from '@mui/icons-material/Lock'
import PaymentIcon from '@mui/icons-material/Payment'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import StarIcon from '@mui/icons-material/Star'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PeopleIcon from '@mui/icons-material/People'
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'

const offerWalls = [
  { name: 'AdGate Media', color: '#ff6b35', earnings: 'Up to $5/survey' },
  { name: 'OfferToro', color: '#00d4aa', earnings: 'Up to $3/offer' },
  { name: 'Adscend Media', color: '#6366f1', earnings: 'Up to $10/video' },
  { name: 'Persona.ly', color: '#ec4899', earnings: 'Up to $2/task' },
  { name: 'ayeT-Studios', color: '#f59e0b', earnings: 'Up to $15/app' },
  { name: 'Revenue Universe', color: '#3b82f6', earnings: 'Up to $8/offer' },
]

const liveActivity = [
  { user: 'Alex M.', action: 'completed AdGate survey', amount: '+$2.50', time: '2 min ago' },
  { user: 'Sarah K.', action: 'redeemed PayPal', amount: '$25.00', time: '5 min ago' },
  { user: 'Mike R.', action: 'completed OfferToro task', amount: '+$1.80', time: '8 min ago' },
  { user: 'Emma L.', action: 'redeemed Crypto', amount: '$50.00', time: '12 min ago' },
  { user: 'John D.', action: 'completed ayeT offer', amount: '+$5.00', time: '15 min ago' },
]

const DashboardPage = () => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  
  const { user } = useSelector((state) => state.auth)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchCurrentUser())
    fetchDashboard()
  }, [dispatch])

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

  const getGreeting = () => {
    const hour = new Date().getUTCHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good night'
  }

  // Theme-aware colors
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a'
  const textSecondary = isDark ? '#94a3b8' : '#64748b'
  const textMuted = isDark ? '#64748b' : '#94a3b8'
  const hoverBg = isDark ? '#334155' : '#f1f5f9'

  const StatCard = ({ title, value, icon, color, subtitle, link }) => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: `1px solid ${cardBorder}`,
        bgcolor: cardBg,
        transition: 'all 0.2s ease',
        cursor: link ? 'pointer' : 'default',
        '&:hover': link ? { transform: 'translateY(-2px)', boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' } : {},
      }}
      component={link ? Link : Box}
      to={link || undefined}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {link && <ArrowForwardIcon sx={{ color: textMuted, fontSize: 18 }} />}
      </Box>
      <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, mb: 0.5 }}>
        {loading ? <Skeleton width={80} /> : value}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color: textSecondary, mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: textMuted }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  )

  return (
    <Box>
      {/* Greeting + Level */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, md: 3 },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: textPrimary, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 0.5 }}
          >
            {getGreeting()}, {user?.username || 'User'} 👋
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Here's your earning summary for today
          </Typography>
        </Box>
        <Chip
          icon={<StarIcon sx={{ fontSize: 16, color: '#f59e0b !important' }} />}
          label={`Level ${user?.level_id || 1}`}
          sx={{
            bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
            color: isDark ? '#fcd34d' : '#b45309',
            fontWeight: 700,
            borderRadius: 2,
            px: 1,
            border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : '#fcd34d'}`,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Available Balance"
            value={`$${dashboard?.balance?.available?.toFixed(2) || '0.00'}`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 22 }} />}
            color="#10b981"
            subtitle="Ready to withdraw"
            link="/withdraw"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Locked Balance"
            value={`$${dashboard?.balance?.locked?.toFixed(2) || '0.00'}`}
            icon={<LockIcon sx={{ fontSize: 22 }} />}
            color="#f59e0b"
            subtitle="Pending clearance"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Total Paid"
            value={`$${dashboard?.lifetime?.total_withdrawn?.toFixed(2) || '0.00'}`}
            icon={<PaymentIcon sx={{ fontSize: 22 }} />}
            color="#3b82f6"
            subtitle="Lifetime withdrawals"
            link="/history"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Total Earned"
            value={`$${dashboard?.lifetime?.total_earned?.toFixed(2) || '0.00'}`}
            icon={<CalendarMonthIcon sx={{ fontSize: 22 }} />}
            color="#ec4899"
            subtitle="All time earnings"
          />
        </Grid>
      </Grid>

      {/* Offer Walls Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary }}>
            💰 Earn Now
          </Typography>
          <Button
            component={Link}
            to="/earn"
            endIcon={<ArrowForwardIcon />}
            sx={{ color: '#10b981', fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={2}>
          {offerWalls.map((wall) => (
            <Grid item xs={6} sm={4} md={2} key={wall.name}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${cardBorder}`,
                  bgcolor: cardBg,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: isDark ? `0 8px 24px ${wall.color}30` : `0 8px 24px ${wall.color}20`,
                    borderColor: wall.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${wall.color}15`,
                    color: wall.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    fontWeight: 800,
                    fontSize: '1.2rem',
                  }}
                >
                  {wall.name[0]}
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: textPrimary, mb: 0.5 }}>
                  {wall.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {wall.earnings}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Live Activity + Streak */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${cardBorder}`,
              bgcolor: cardBg,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WhatshotIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary }}>
                Live Activity
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  ml: 'auto',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {liveActivity.map((item, index) => (
                <Fade in key={index} timeout={500 + index * 100}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? '#0f172a' : '#f8fafc',
                      '&:hover': { bgcolor: hoverBg },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: isDark ? '#334155' : '#e2e8f0',
                        color: textSecondary,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.user[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>
                        {item.user}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textSecondary }}>
                        {item.action}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#10b981' }}>
                        {item.amount}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textMuted }}>
                        {item.time}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${cardBorder}`,
              bgcolor: cardBg,
              mb: 2,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <WhatshotIcon sx={{ color: '#f59e0b', fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary }}>
                {dashboard?.streak?.current_streak || 0} Day Streak
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, mb: 2 }}>
                Keep it going for bonus rewards!
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#f59e0b',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1.2,
                  '&:hover': { bgcolor: '#d97706' },
                }}
              >
                Claim Daily Bonus
              </Button>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${cardBorder}`,
              bgcolor: cardBg,
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ color: textPrimary, mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                component={Link}
                to="/earn"
                fullWidth
                startIcon={<TrendingUpIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: textPrimary,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', color: '#10b981' },
                }}
              >
                Start Earning
              </Button>
              <Button
                component={Link}
                to="/referrals"
                fullWidth
                startIcon={<PeopleIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: textPrimary,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', color: '#10b981' },
                }}
              >
                Invite Friends
              </Button>
              <Button
                component={Link}
                to="/withdraw"
                fullWidth
                startIcon={<AccountBalanceWalletIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: textPrimary,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', color: '#10b981' },
                }}
              >
                Withdraw
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage