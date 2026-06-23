// ============================================================
// ProgressPage.jsx — Level & Progress + Performance Analytics
// FIXED: Speedometer value below, equal cards, proper phone layout
// APIs: GET /api/levels/progress, GET /api/performance/
// ============================================================
import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Paper, Chip, Skeleton, useTheme, useMediaQuery,
  Tabs, Tab, LinearProgress, Tooltip, Fade, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import MouseIcon from '@mui/icons-material/Mouse'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SpeedIcon from '@mui/icons-material/Speed'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import LockIcon from '@mui/icons-material/Lock'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

// ─── Helpers ─────────────────────────────────────────────────
const formatPts = (v) => Math.floor(v || 0).toLocaleString()
const formatDollar = (v) => `$${(parseFloat(v || 0) / 100).toFixed(2)}`
const formatPct = (v) => `${parseFloat(v || 0).toFixed(2)}%`

// ─── Arc Speedometer (0-100, car-style) ──────────────────────
// VALUE IS BELOW THE GAUGE, NOT ON TOP
const ArcSpeedometer = ({ value, size = 180, darkMode }) => {
  const COLORS = getColors(darkMode)
  const val = Math.min(Math.max(value || 0, 0), 100)
  const isHigh = val > 5
  const color = isHigh ? '#ef4444' : '#10b981'
  const radius = (size - 24) / 2
  const center = size / 2
  const startAngle = 135
  const endAngle = 405
  const totalAngle = endAngle - startAngle
  const progressAngle = startAngle + (val / 100) * totalAngle

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = (Math.PI / 180) * angleDeg
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
  }

  const describeArc = (cx, cy, r, start, end) => {
    const startPt = polarToCartesian(cx, cy, r, end)
    const endPt = polarToCartesian(cx, cy, r, start)
    const largeArc = end - start <= 180 ? 0 : 1
    return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 0 ${endPt.x} ${endPt.y}`
  }

  const bgPath = describeArc(center, center, radius, startAngle, endAngle)
  const progressPath = describeArc(center, center, radius, startAngle, progressAngle)

  const ticks = []
  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (i / 10) * totalAngle
    const inner = polarToCartesian(center, center, radius - 14, angle)
    const outer = polarToCartesian(center, center, radius - 4, angle)
    ticks.push({ inner, outer, label: i * 10, angle })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Gauge SVG only — NO TEXT ON TOP */}
      <Box sx={{ width: size, height: size * 0.72, position: 'relative' }}>
        <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
          <path d={bgPath} fill="none" stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={14} strokeLinecap="round" />
          <path d={progressPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" style={{ transition: 'all 0.8s ease-out' }} />
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y} stroke={darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth={1.5} />
              <text x={polarToCartesian(center, center, radius - 26, t.angle).x} y={polarToCartesian(center, center, radius - 26, t.angle).y}
                textAnchor="middle" dominantBaseline="middle" fill={COLORS.textMuted} fontSize="8" fontWeight="600">
                {t.label}
              </text>
            </g>
          ))}
          <line x1={center} y1={center} x2={polarToCartesian(center, center, radius - 10, progressAngle).x} y2={polarToCartesian(center, center, radius - 10, progressAngle).y}
            stroke={color} strokeWidth={3} strokeLinecap="round" style={{ transition: 'all 0.8s ease-out' }} />
          <circle cx={center} cy={center} r={7} fill={color} />
        </svg>
      </Box>
      {/* VALUE BELOW GAUGE — clean separation */}
      <Box sx={{ textAlign: 'center', mt: 0.5 }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: color, lineHeight: 1 }}>
          {formatPct(val)}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Reversal Rate
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Level Badge ─────────────────────────────────────────────
const LevelBadge = ({ level, size = 56 }) => {
  const colors = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#8b5cf6']
  const color = colors[(level - 1) % colors.length]
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 20px ${color}40`, border: `3px solid ${color}30`,
    }}>
      <Typography sx={{ fontSize: size > 50 ? '1.4rem' : '1rem', fontWeight: 900, color: '#fff' }}>{level}</Typography>
    </Box>
  )
}

// ─── Simple SVG Bar Chart ──────────────────────────────────
const SimpleBarChart = ({ data, darkMode, labelKey, valueKey, height = 180 }) => {
  const COLORS = getColors(darkMode)
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'flex-end', gap: 1, px: 1, pb: 3 }}>
      {data.map((item, idx) => {
        const val = item[valueKey] || 0
        const h = Math.max((val / maxVal) * (height - 30), 4)
        return (
          <Tooltip key={idx} title={`${item[labelKey]}: ${formatPts(val)} pts`} arrow placement="top">
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: '100%', height: h, bgcolor: COLORS.primary, borderRadius: '6px 6px 0 0', opacity: 0.85, transition: 'all 0.4s ease', '&:hover': { opacity: 1, transform: 'scaleY(1.05)' }, transformOrigin: 'bottom' }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.textMuted, textAlign: 'center', lineHeight: 1.1 }}>{item[labelKey]}</Typography>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}

// ─── Stat Card (equal height via flex) ─────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent, delay = 0, darkMode }) => {
  const COLORS = getColors(darkMode)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <Fade in={visible} timeout={400}>
      <Paper sx={{
        p: { xs: 1.2, sm: 2 }, borderRadius: 3,
        height: { xs: 100, sm: 120 },
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        transition: 'all 0.3s ease',
        '&:hover': { boxShadow: `0 8px 30px ${accent}15`, borderColor: `${accent}30`, transform: 'translateY(-2px)' },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ fontSize: 14, color: accent }} />
          </Box>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {sub && (
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 500, color: COLORS.textSecondary, mt: 0.3, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sub}
            </Typography>
          )}
        </Box>
      </Paper>
    </Fade>
  )
}

// ─── Main Component ──────────────────────────────────────────
const ProgressPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [activeTab, setActiveTab] = useState(0)
  const [levelData, setLevelData] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [levelRes, perfRes] = await Promise.all([
        axiosInstance.get('/levels/progress'),
        axiosInstance.get('/performance/')
      ])
      setLevelData(levelRes.data?.data || null)
      setPerformanceData(perfRes.data?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  const handleTabChange = (e, newValue) => setActiveTab(newValue)

  // DATA
  const currentLevel = levelData?.current_level || 1
  const progress = levelData?.progress || null
  const allLevels = levelData?.all_levels || []

  const perf = performanceData || {}
  const surveys = perf.surveys || {}
  const earnings = perf.earnings || {}

  const totalClicks = surveys.total_clicks || 0
  const completed = surveys.completed || 0
  const failed = surveys.failed || 0
  const quotaFull = surveys.quota_full || 0
  const securityTerminated = surveys.security_terminated || 0
  const reversed = surveys.reversed || 0
  const completionRate = surveys.completion_rate || 0
  const reversalRate = surveys.reversal_rate || 0
  const isReversalHigh = reversalRate > 5

  const totalCompleted = completed
  const totalReversed = reversed

  const monthlyData = (perf.monthly_breakdown || [])
    .slice().reverse()
    .map(m => ({ label: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }), value: m.earnings || 0 }))

  const wallData = (perf.offer_walls || [])
    .slice(0, 6)
    .map(w => ({ label: w.offer_wall_name?.substring(0, 8) || 'Wall', value: w.total_earned || 0 }))

  // ─── LOADING ───────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
          <Skeleton variant="text" width={280} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width={180} height={24} sx={{ borderRadius: 1, mb: 3 }} />
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: 3, mb: 3 }} />
          <Grid container spacing={1.5}>
            {[1,2,3].map(i => (
              <Grid item xs={4} key={i}>
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            {[1,2].map(i => (
              <Grid item xs={6} key={i}>
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3, mt: 2 }} />
        </Box>
      </PageWrapper>
    )
  }

  // ─── ERROR ─────────────────────────────────────────────────
  if (error) {
    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3, textAlign: 'center' }}>
          <WarningAmberIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary' }}>{error}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 0.5 }}>Please try refreshing the page.</Typography>
        </Box>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
            My Progress
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mt: 0.3 }}>
            Track your level, achievements, and earning performance
          </Typography>
        </Box>

        {/* ── TABS ───────────────────────────────────────────── */}
        <Paper sx={{
          borderRadius: 3, mb: 3, overflow: 'hidden',
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{ '& .MuiTabs-flexContainer': { px: { md: 2 } }, '& .MuiTabs-indicator': { bgcolor: COLORS.primary, height: 3, borderRadius: '3px 3px 0 0' } }}>
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}><EmojiEventsIcon sx={{ fontSize: 20 }} /><Typography sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'none' }}>Level & Progress</Typography></Box>}
              sx={{ color: 'text.secondary', '&.Mui-selected': { color: COLORS.primary, fontWeight: 800 }, textTransform: 'none', minHeight: 52 }} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}><BarChartIcon sx={{ fontSize: 20 }} /><Typography sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'none' }}>Performance</Typography></Box>}
              sx={{ color: 'text.secondary', '&.Mui-selected': { color: COLORS.primary, fontWeight: 800 }, textTransform: 'none', minHeight: 52 }} />
          </Tabs>
        </Paper>

        {/* ═══════════════════════════════════════════════════════
            TAB 1: LEVEL & PROGRESS
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 0 && (
          <Box>
            {/* Hero Card */}
            <Paper sx={{
              p: { xs: 2.5, md: 3.5 }, borderRadius: 3, mb: 3,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              background: darkMode
                ? 'linear-gradient(135deg, rgba(83,18,188,0.06) 0%, rgba(37,99,235,0.03) 100%)'
                : 'linear-gradient(135deg, rgba(83,18,188,0.03) 0%, rgba(37,99,235,0.015) 100%)',
            }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <LevelBadge level={currentLevel} size={80} />
                  <Chip label={`Level ${currentLevel}`} sx={{ bgcolor: `${COLORS.primary}15`, color: COLORS.primary, fontWeight: 800, fontSize: '0.75rem', height: 26 }} />
                </Box>

                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: 'text.primary', mb: 1 }}>
                    {currentLevel === 20
                      ? 'Congratulations! You have reached the maximum level.'
                      : progress
                        ? `Complete ${progress.surveys_remaining} more surveys to unlock Level ${progress.next_level}`
                        : 'Keep completing surveys to level up and earn rewards.'
                    }
                  </Typography>

                  {progress && (
                    <Box sx={{ width: '100%', mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                          {progress.surveys_completed} / {progress.surveys_required} surveys
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.primary }}>
                          {progress.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress.percentage}
                        sx={{ height: 10, borderRadius: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary, borderRadius: 5, transition: 'transform 1s ease-out' } }} />
                    </Box>
                  )}

                  {reversalRate > 5 && (
                    <Box sx={{
                      mt: 1.5, p: 1.5, borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                      border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 1,
                    }}>
                      <WarningAmberIcon sx={{ fontSize: 18, color: '#dc2626', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626' }}>
                        Your reversal rate is {formatPct(reversalRate)}. Keep it below 5% or your account may be banned.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* Level Roadmap Table */}
            <Paper sx={{
              borderRadius: 3, overflow: 'hidden',
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              <Box sx={{ p: 2.5, borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>Level Roadmap</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Your journey through all 20 levels</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>Level</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>Surveys Required</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>Max Reversal</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>Reward</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allLevels.map((lvl) => {
                      const isCurrent = lvl.level === currentLevel
                      return (
                        <TableRow key={lvl.level} sx={{
                          bgcolor: isCurrent ? (darkMode ? 'rgba(83,18,188,0.06)' : 'rgba(83,18,188,0.03)') : 'transparent',
                          transition: 'background 0.2s',
                          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                        }}>
                          <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, py: 1.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LevelBadge level={lvl.level} size={32} />
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? COLORS.primary : 'text.primary' }}>
                                Level {lvl.level} {isCurrent && <span style={{ fontSize: '0.7rem', marginLeft: 6, color: COLORS.textMuted }}>(You)</span>}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, fontSize: '0.85rem', color: 'text.primary', fontWeight: 600 }}>{formatPts(lvl.surveys_required)}</TableCell>
                          <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, fontSize: '0.85rem', color: 'text.primary', fontWeight: 600 }}>≤ {lvl.reversal_rate_max}%</TableCell>
                          <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, fontSize: '0.85rem', color: 'text.primary', fontWeight: 700 }}>+{formatPts(lvl.reward)} pts</TableCell>
                          <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                            {lvl.unlocked ? (
                              <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Unlocked" size="small"
                                sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: '0.7rem', height: 24 }} />
                            ) : (
                              <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Locked" size="small"
                                sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: PERFORMANCE
            PHONE: Row1=3 cards, Row2=2 cards
            DESKTOP: Row1=5 cards
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 1 && (
          <Box>
            {/* ═══ PERFORMANCE STATS ROW ═══ */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="stretch">
              <Grid item xs={4} md={2.4} sx={{ display: 'flex' }}>
                <StatCard icon={MouseIcon} label="Clicks" value={formatPts(totalClicks)} sub="Total clicks" accent="#2563eb" delay={0} darkMode={darkMode} />
              </Grid>
              <Grid item xs={4} md={2.4} sx={{ display: 'flex' }}>
                <StatCard icon={CheckCircleIcon} label="Completed" value={formatPts(completed)} sub="Surveys finished" accent="#10b981" delay={100} darkMode={darkMode} />
              </Grid>
              <Grid item xs={4} md={2.4} sx={{ display: 'flex' }}>
                <StatCard icon={CancelIcon} label="Reversed" value={formatPts(reversed)} sub="Lost surveys" accent="#ef4444" delay={200} darkMode={darkMode} />
              </Grid>
            </Grid>
            <Grid container spacing={1.5} sx={{ mb: 3 }} alignItems="stretch">
              <Grid item xs={6} md={2.4} sx={{ display: 'flex' }}>
                <StatCard icon={TrendingUpIcon} label="Completion Rate" value={formatPct(completionRate)} sub="Click → Complete" accent="#2563eb" delay={300} darkMode={darkMode} />
              </Grid>
              <Grid item xs={6} md={2.4} sx={{ display: 'flex' }}>
                <StatCard icon={TrendingDownIcon} label="Reversal Rate" value={formatPct(reversalRate)} sub={isReversalHigh ? 'Above 5%' : 'Healthy'} accent={isReversalHigh ? '#ef4444' : '#10b981'} delay={400} darkMode={darkMode} />
              </Grid>
            </Grid>

            {/* ═══ SPEEDOMETER + EARNINGS ═══ */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
              {/* Speedometer Card */}
              <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <Paper sx={{
                  p: { xs: 2.5, md: 3 }, borderRadius: 3,
                  flex: 1,
                  bgcolor: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                  background: `linear-gradient(135deg, ${COLORS.primary}08 0%, ${COLORS.primary}02 100%)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ArcSpeedometer value={reversalRate} darkMode={darkMode} />
                  <Box sx={{ textAlign: 'center', mt: 2, px: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: isReversalHigh ? '#ef4444' : '#10b981' }}>
                      {isReversalHigh ? 'High Risk!' : 'Healthy Rate'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textSecondary, mt: 0.5, lineHeight: 1.4 }}>
                      {isReversalHigh
                        ? 'Keep it below 5% or your account may be banned.'
                        : 'Your reversal rate is within safe limits. Keep it up!'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Earnings Overview Card */}
              <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <Paper sx={{
                  p: { xs: 2.5, md: 3 }, borderRadius: 3,
                  flex: 1,
                  bgcolor: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2.5 }}>
                    Earnings Overview
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { icon: AccountBalanceWalletIcon, label: 'Total Earned', value: formatDollar(earnings.total_earned), color: COLORS.primary },
                      { icon: TrendingDownIcon, label: 'Reversed', value: formatDollar(earnings.total_reversed), color: '#ef4444' },
                      { icon: LocalAtmIcon, label: 'Withdrawn', value: formatDollar(earnings.total_withdrawn), color: '#f59e0b' },
                      { icon: PeopleIcon, label: 'Referrals', value: formatDollar(earnings.referral_earnings), color: '#ec4899' },
                      { icon: AccountBalanceWalletIcon, label: 'Available', value: formatDollar(earnings.balance_available), color: '#2563eb' },
                      { icon: LockIcon, label: 'Locked', value: formatDollar(earnings.balance_locked), color: '#6b7280' },
                    ].map((item, idx) => (
                      <Grid item xs={6} sm={4} md={2} key={idx}>
                        <Box sx={{
                          textAlign: 'center', p: 1.5, borderRadius: 2,
                          bgcolor: darkMode ? `${item.color}08` : `${item.color}04`,
                          border: `1px solid ${darkMode ? `${item.color}15` : `${item.color}10`}`,
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${item.color}15` },
                        }}>
                          <item.icon sx={{ fontSize: 22, color: item.color, mb: 0.8 }} />
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: COLORS.textPrimary }}>{item.value}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.textSecondary, mt: 0.3 }}>{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* ═══ MONTHLY EARNINGS CHART ═══ */}
            <Paper sx={{
              p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 3,
              bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
            }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2.5 }}>
                Monthly Earnings (Last 12 Months)
              </Typography>
              {monthlyData.length > 0 ? (
                <SimpleBarChart data={monthlyData} darkMode={darkMode} labelKey="label" valueKey="value" height={220} />
              ) : (
                <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>No monthly data available yet</Typography>
                </Box>
              )}
            </Paper>

            {/* ═══ EARNINGS BY OFFER WALL ═══ */}
            <Paper sx={{
              p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 3,
              bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
            }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2.5 }}>
                Earnings by Offer Wall
              </Typography>
              {wallData.length > 0 ? (
                <SimpleBarChart data={wallData} darkMode={darkMode} labelKey="label" valueKey="value" height={200} />
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>No offer wall data available yet</Typography>
                </Box>
              )}
            </Paper>

            {/* ═══ DETAILED PERFORMANCE STATS ═══ */}
            <Paper sx={{
              borderRadius: 3, overflow: 'hidden',
              bgcolor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
            }}>
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: COLORS.textPrimary }}>Detailed Performance Stats</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>Metric</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }} align="right">Value</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }} align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: 'Total Clicks', value: formatPts(totalClicks), pct: '100%', color: COLORS.primary },
                      { label: 'Completed', value: formatPts(completed), pct: formatPct(completionRate), color: '#10b981' },
                      { label: 'Failed', value: formatPts(failed), pct: formatPct((failed / totalClicks) * 100), color: '#ef4444' },
                      { label: 'Quota Full', value: formatPts(quotaFull), pct: formatPct((quotaFull / totalClicks) * 100), color: '#f59e0b' },
                      { label: 'Security Terminated', value: formatPts(securityTerminated), pct: formatPct((securityTerminated / totalClicks) * 100), color: '#dc2626' },
                      { label: 'Reversed', value: formatPts(reversed), pct: formatPct((reversed / totalClicks) * 100), color: '#6b7280' },
                    ].map((row, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                        <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, py: 1.2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>{row.label}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, fontSize: '0.85rem', fontWeight: 700, color: 'text.primary' }} align="right">{row.value}</TableCell>
                        <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }} align="right">
                          <Chip label={row.pct} size="small" sx={{ bgcolor: `${row.color}15`, color: row.color, fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Box>
    </PageWrapper>
  )
}

export default ProgressPage