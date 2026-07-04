import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, useTheme, useMediaQuery,
  Tabs, Tab, LinearProgress, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import EmojiEventsIcon          from '@mui/icons-material/EmojiEvents'
import TrendingUpIcon           from '@mui/icons-material/TrendingUp'
import TrendingDownIcon         from '@mui/icons-material/TrendingDown'
import MouseIcon                from '@mui/icons-material/Mouse'
import CheckCircleIcon          from '@mui/icons-material/CheckCircle'
import CancelIcon               from '@mui/icons-material/Cancel'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import LocalAtmIcon             from '@mui/icons-material/LocalAtm'
import PeopleIcon               from '@mui/icons-material/People'
import BarChartIcon             from '@mui/icons-material/BarChart'
import WarningAmberIcon         from '@mui/icons-material/WarningAmber'
import LockIcon                 from '@mui/icons-material/Lock'
import axiosInstance            from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const formatPts    = (v) => Math.floor(v || 0).toLocaleString()
const formatDollar = (v) => `$${(parseFloat(v || 0) / 100).toFixed(2)}`
const formatPct    = (v) => `${parseFloat(v || 0).toFixed(2)}%`

// ─── Arc Speedometer ──────────────────────────────────────────────────────────
const ArcSpeedometer = ({ value, darkMode }) => {
  const COLORS = getColors(darkMode)
  const size   = 200
  const val    = Math.min(Math.max(value || 0, 0), 100)
  const isHigh = val > 5
  const color  = isHigh ? '#ef4444' : '#10b981'
  const radius = (size - 28) / 2
  const center = size / 2
  const startAngle = 135
  const endAngle   = 405
  const totalAngle = endAngle - startAngle
  const progressAngle = startAngle + (val / 100) * totalAngle

  const polar = (cx, cy, r, deg) => {
    const rad = (Math.PI / 180) * deg
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const arc = (cx, cy, r, start, end) => {
    const s = polar(cx, cy, r, end)
    const e = polar(cx, cy, r, start)
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${end - start <= 180 ? 0 : 1} 0 ${e.x} ${e.y}`
  }

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = startAngle + (i / 10) * totalAngle
    return { inner: polar(center, center, radius - 16, angle), outer: polar(center, center, radius - 4, angle), label: i * 10, angle }
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: size, height: size * 0.72 }}>
        <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
          <path d={arc(center, center, radius, startAngle, endAngle)} fill="none"
            stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={16} strokeLinecap="round" />
          <path d={arc(center, center, radius, startAngle, progressAngle)} fill="none"
            stroke={color} strokeWidth={16} strokeLinecap="round" style={{ transition: 'all 0.8s ease-out' }} />
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y}
                stroke={darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth={1.5} />
              <text x={polar(center, center, radius - 28, t.angle).x} y={polar(center, center, radius - 28, t.angle).y}
                textAnchor="middle" dominantBaseline="middle" fill={COLORS.textMuted} fontSize="8" fontWeight="600">
                {t.label}
              </text>
            </g>
          ))}
          <line x1={center} y1={center}
            x2={polar(center, center, radius - 12, progressAngle).x}
            y2={polar(center, center, radius - 12, progressAngle).y}
            stroke={color} strokeWidth={3} strokeLinecap="round" style={{ transition: 'all 0.8s ease-out' }} />
          <circle cx={center} cy={center} r={8} fill={color} />
        </svg>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{formatPct(val)}</Typography>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.3 }}>
          Reversal Rate
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Level Badge ──────────────────────────────────────────────────────────────
const LevelBadge = ({ level, size = 56 }) => {
  const colors = ['#5312bc','#2563eb','#10b981','#f59e0b','#ec4899','#14b8a6','#ef4444','#8b5cf6']
  const color  = colors[(level - 1) % colors.length]
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px ${color}40`, border: `3px solid ${color}30`,
    }}>
      <Typography sx={{ fontSize: size > 50 ? '1.4rem' : '1rem', fontWeight: 900, color: '#fff' }}>{level}</Typography>
    </Box>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const SimpleBarChart = ({ data, darkMode, labelKey, valueKey, height = 180 }) => {
  const COLORS = getColors(darkMode)
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'flex-end', gap: 1, px: 1, pb: 3 }}>
      {data.map((item, idx) => {
        const h = Math.max((( item[valueKey] || 0) / maxVal) * (height - 30), 4)
        return (
          <Tooltip key={idx} title={`${item[labelKey]}: ${formatPts(item[valueKey])} pts`} arrow placement="top">
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: '100%', height: h, bgcolor: COLORS.primary,
                borderRadius: '6px 6px 0 0', opacity: 0.85,
                transition: 'all 0.4s ease', transformOrigin: 'bottom',
                '&:hover': { opacity: 1, transform: 'scaleY(1.05)' },
              }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: COLORS.textMuted, textAlign: 'center', lineHeight: 1.1 }}>
                {item[labelKey]}
              </Typography>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProgressPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS   = getColors(darkMode)
  const theme    = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [activeTab,        setActiveTab]        = useState(0)
  const [levelData,        setLevelData]        = useState(null)
  const [performanceData,  setPerformanceData]  = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [levelRes, perfRes] = await Promise.all([
        axiosInstance.get('/levels/progress'),
        axiosInstance.get('/performance/'),
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

  const currentLevel = levelData?.current_level || 1
  const progress     = levelData?.progress || null
  const allLevels    = levelData?.all_levels || []

  const perf      = performanceData || {}
  const surveys   = perf.surveys   || {}
  const earnings  = perf.earnings  || {}

  const totalClicks          = surveys.total_clicks          || 0
  const completed            = surveys.completed             || 0
  const failed               = surveys.failed                || 0
  const quotaFull            = surveys.quota_full            || 0
  const securityTerminated   = surveys.security_terminated   || 0
  const reversed             = surveys.reversed              || 0
  const completionRate       = surveys.completion_rate       || 0
  const reversalRate         = surveys.reversal_rate         || 0
  const isReversalHigh       = reversalRate > 5

  // Note: own_reversal_count / referral_commission_reversed require backend deploy of dashboard.repository.js changes

  const monthlyData = (perf.monthly_breakdown || []).slice().reverse().map(m => ({
    label: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }),
    value: m.total_earnings || 0,
  }))
  const wallData = (perf.offer_walls || []).slice(0, 6).map(w => ({
    label: w.offer_wall_name?.substring(0, 8) || 'Wall', value: w.total_earned || 0,
  }))

  if (loading) return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        <Skeleton variant="text" width={260} height={44} sx={{ borderRadius: 1, mb: 0.5 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ borderRadius: 1, mb: 3 }} />
        <Skeleton variant="rounded" height={52} sx={{ borderRadius: 3, mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 3 }} />)}
        </Box>
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
      </Box>
    </PageWrapper>
  )

  if (error) return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3, textAlign: 'center', pt: 8 }}>
        <WarningAmberIcon sx={{ fontSize: 48, color: '#ef4444', mb: 1 }} />
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.textPrimary }}>{error}</Typography>
      </Box>
    </PageWrapper>
  )

  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const tbCell = { borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }
  const thCell = { fontWeight: 800, color: COLORS.textMuted, fontSize: '0.72rem', borderBottom: `1px solid ${borderColor}` }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>

        {/* Header */}
        <Box sx={{ mb: 3, mt: { xs: 1, md: 0 } }}>
          <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.02em' }}>
            My Progress
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: COLORS.textMuted, mt: 0.3 }}>
            Track your level, achievements, and earning performance
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, mb: 3, overflow: 'hidden', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              '& .MuiTabs-flexContainer': { px: { md: 2 } },
              '& .MuiTabs-indicator': { bgcolor: COLORS.primary, height: 3, borderRadius: '3px 3px 0 0' },
            }}>
            {[
              { label: 'Level & Progress', icon: EmojiEventsIcon },
              { label: 'Performance',      icon: BarChartIcon },
            ].map((tab, i) => (
              <Tab key={i} sx={{ color: COLORS.textSecondary, '&.Mui-selected': { color: COLORS.primary }, textTransform: 'none', minHeight: 52 }}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <tab.icon sx={{ fontSize: 19 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'none' }}>{tab.label}</Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* ═══ TAB 1: LEVEL & PROGRESS ════════════════════════════════════════ */}
        {activeTab === 0 && (
          <Box>
            <Paper sx={{
              p: { xs: 2.5, md: 3.5 }, borderRadius: 3, mb: 3,
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
              background: `linear-gradient(135deg, ${COLORS.primary}10 0%, ${COLORS.primary}03 100%)`,
            }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <LevelBadge level={currentLevel} size={80} />
                  <Chip label={`Level ${currentLevel}`} sx={{ bgcolor: `${COLORS.primary}15`, color: COLORS.primary, fontWeight: 800, fontSize: '0.75rem', height: 26 }} />
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: COLORS.textPrimary, mb: 1.5 }}>
                    {currentLevel === 20
                      ? 'You have reached the maximum level!'
                      : progress
                        ? `Complete ${progress.surveys_remaining} more surveys to unlock Level ${progress.next_level}`
                        : 'Keep completing surveys to level up and earn rewards.'}
                  </Typography>
                  {progress && (
                    <Box sx={{ width: '100%', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.textSecondary }}>
                          {progress.surveys_completed} / {progress.surveys_required} surveys
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.primary }}>
                          {progress.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress.percentage} sx={{
                        height: 10, borderRadius: 5,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary, borderRadius: 5, transition: 'transform 1s ease-out' },
                      }} />
                    </Box>
                  )}
                  {reversalRate > 5 && (
                    <Box sx={{
                      p: 1.5, borderRadius: 2, bgcolor: darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                      border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 1,
                    }}>
                      <WarningAmberIcon sx={{ fontSize: 17, color: '#dc2626', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626' }}>
                        Your reversal rate is {formatPct(reversalRate)}. Keep it below 5% or your account may be at risk.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* Level Roadmap */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: COLORS.textPrimary }}>Level Roadmap</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Your journey through all 20 levels</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      {['Level','Surveys Required','Max Reversal','Reward','Status'].map(h => (
                        <TableCell key={h} sx={thCell}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allLevels.map((lvl) => {
                      const isCurrent = lvl.level === currentLevel
                      return (
                        <TableRow key={lvl.level} sx={{
                          bgcolor: isCurrent ? (darkMode ? 'rgba(83,18,188,0.07)' : 'rgba(83,18,188,0.03)') : 'transparent',
                          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                        }}>
                          <TableCell sx={{ ...tbCell, py: 1.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LevelBadge level={lvl.level} size={30} />
                              <Typography sx={{ fontSize: '0.84rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? COLORS.primary : COLORS.textPrimary }}>
                                Level {lvl.level}{isCurrent && <span style={{ fontSize: '0.68rem', marginLeft: 6, color: COLORS.textMuted }}>(You)</span>}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ ...tbCell, fontSize: '0.84rem', fontWeight: 600, color: COLORS.textPrimary }}>{formatPts(lvl.surveys_required)}</TableCell>
                          <TableCell sx={{ ...tbCell, fontSize: '0.84rem', fontWeight: 600, color: COLORS.textPrimary }}>≤ {lvl.reversal_rate_max}%</TableCell>
                          <TableCell sx={{ ...tbCell, fontSize: '0.84rem', fontWeight: 700, color: COLORS.textPrimary }}>+{formatPts(lvl.reward)} pts</TableCell>
                          <TableCell sx={tbCell}>
                            {lvl.unlocked
                              ? <Chip icon={<CheckCircleIcon sx={{ fontSize: 13 }} />} label="Unlocked" size="small" sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                              : <Chip icon={<LockIcon sx={{ fontSize: 13 }} />} label="Locked" size="small" sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: COLORS.textMuted, fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
                            }
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

        {/* ═══ TAB 2: PERFORMANCE ════════════════════════════════════════════ */}
        {activeTab === 1 && (
          <Box>

            {/* ── Row 1: 4 equal stat cards ── */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2, mb: 2,
            }}>
              {[
                { icon: MouseIcon,        label: 'Total Clicks',    value: formatPts(totalClicks),    sub: 'Survey attempts',   accent: '#2563eb' },
                { icon: CheckCircleIcon,  label: 'Completed',       value: formatPts(completed),      sub: 'Surveys finished',  accent: '#10b981' },
                { icon: TrendingUpIcon,   label: 'Completion Rate', value: formatPct(completionRate), sub: 'Click → Complete',  accent: '#5312bc' },
                { icon: CancelIcon,       label: 'Reversed',        value: formatPts(reversed),       sub: null,                accent: '#ef4444' },
              ].map((c, i) => (
                <Paper key={i} elevation={0} sx={{
                  p: { xs: 2, md: 2.5 }, borderRadius: 3,
                  bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
                  background: `linear-gradient(135deg, ${c.accent}12 0%, ${c.accent}03 100%)`,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  transition: 'all 0.25s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${c.accent}18`, borderColor: `${c.accent}30` },
                }}>
                  <Box sx={{
                    width: { xs: 36, md: 42 }, height: { xs: 36, md: 42 }, borderRadius: 2, flexShrink: 0,
                    bgcolor: `${c.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <c.icon sx={{ fontSize: { xs: 18, md: 20 }, color: c.accent }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                      {c.label}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '1.15rem', md: '1.35rem' }, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.2, mt: 0.3 }}>
                      {c.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted, mt: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.sub}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* ── Row 2: Reversal Rate card (full width, prominent) ── */}
            <Paper elevation={0} sx={{
              p: { xs: 2, md: 2.5 }, borderRadius: 3, mb: 2,
              bgcolor: COLORS.cardBg, border: `1px solid ${isReversalHigh ? '#ef444430' : '#10b98130'}`,
              background: `linear-gradient(135deg, ${isReversalHigh ? '#ef4444' : '#10b981'}10 0%, ${isReversalHigh ? '#ef4444' : '#10b981'}02 100%)`,
              display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 200 }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                  bgcolor: `${isReversalHigh ? '#ef4444' : '#10b981'}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingDownIcon sx={{ fontSize: 22, color: isReversalHigh ? '#ef4444' : '#10b981' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Reversal Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: isReversalHigh ? '#ef4444' : '#10b981', lineHeight: 1.1 }}>
                      {formatPct(reversalRate)}
                    </Typography>
                    <Chip
                      label={isReversalHigh ? '⚠ Above 5% limit' : '✓ Healthy'}
                      size="small"
                      sx={{ bgcolor: isReversalHigh ? '#ef444415' : '#10b98115', color: isReversalHigh ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary, maxWidth: 340, lineHeight: 1.55 }}>
                {isReversalHigh
                  ? 'Your reversal rate is above the 5% threshold. Completing surveys carefully will bring this down and protect your account.'
                  : 'Great job! Your reversal rate is within safe limits. Keep completing quality surveys to maintain this.'}
              </Typography>
            </Paper>

            {/* ── Row 3: Speedometer full width since breakdown needs backend deploy ── */}
            <Paper elevation={0} sx={{
              p: 3, borderRadius: 3, mb: 2,
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
              background: `linear-gradient(135deg, ${COLORS.primary}08 0%, ${COLORS.primary}02 100%)`,
              display: 'flex', flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center', gap: 4,
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                  Reversal Gauge
                </Typography>
                <ArcSpeedometer value={reversalRate} darkMode={darkMode} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: isReversalHigh ? '#ef4444' : '#10b981', mb: 1 }}>
                  {isReversalHigh ? '⚠ High Risk' : '✓ Healthy Rate'}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6, mb: 2 }}>
                  {isReversalHigh
                    ? 'Your reversal rate is above the 5% threshold. Completing surveys carefully will bring this down and protect your account.'
                    : 'Your reversal rate is within safe limits. Keep completing quality surveys to maintain this.'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase' }}>Total Reversed</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>{formatPts(reversed)} surveys</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase' }}>Completed</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{formatPts(completed)} surveys</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* ── Row 4: Earnings Overview — 3 col on mobile, 6 on desktop ── */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 2, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                Earnings Overview
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
                gap: { xs: 1, md: 1.5 },
              }}>
                {[
                  { icon: AccountBalanceWalletIcon, label: 'Net Earned',    value: formatDollar(earnings.net_earned),         color: COLORS.primary },
                  { icon: TrendingDownIcon,          label: 'Reversed',      value: formatDollar(earnings.total_reversed),    color: '#ef4444'      },
                  { icon: LocalAtmIcon,              label: 'Withdrawn',     value: formatDollar(earnings.total_withdrawn),   color: '#f59e0b'      },
                  { icon: PeopleIcon,                label: 'Referrals',     value: formatDollar(earnings.referral_earnings), color: '#ec4899'      },
                  { icon: AccountBalanceWalletIcon,  label: 'Available',     value: formatDollar(earnings.balance_available), color: '#2563eb'      },
                  { icon: LockIcon,                  label: 'Locked',        value: formatDollar(earnings.balance_locked),    color: '#7c3aed'      },
                ].map((item, idx) => (
                  <Box key={idx} sx={{
                    p: { xs: 1.2, md: 1.5 }, borderRadius: 2, textAlign: 'center',
                    bgcolor: darkMode ? `${item.color}09` : `${item.color}06`,
                    border: `1px solid ${item.color}20`,
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${item.color}15` },
                  }}>
                    <item.icon sx={{ fontSize: { xs: 18, md: 22 }, color: item.color, mb: 0.6 }} />
                    <Typography sx={{ fontSize: { xs: '0.82rem', md: '0.95rem' }, fontWeight: 900, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.textMuted, mt: 0.3 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* ── Row 5: Charts side by side on desktop, stacked on mobile ── */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2, mb: 2,
            }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                  Monthly Earnings (All Types)
                </Typography>
                {monthlyData.length > 0
                  ? <SimpleBarChart data={monthlyData} darkMode={darkMode} labelKey="label" valueKey="value" height={180} />
                  : <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: '0.82rem', color: COLORS.textMuted }}>No monthly data yet</Typography></Box>
                }
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                  Earnings by Offer Wall
                </Typography>
                {wallData.length > 0
                  ? <SimpleBarChart data={wallData} darkMode={darkMode} labelKey="label" valueKey="value" height={180} />
                  : <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: '0.82rem', color: COLORS.textMuted }}>No offer wall data yet</Typography></Box>
                }
              </Paper>
            </Box>

            {/* ── Row 6: Detailed stats table ── */}
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: COLORS.textPrimary }}>Detailed Survey Stats</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      {['Metric','Count','% of Clicks'].map((h, i) => (
                        <TableCell key={h} sx={thCell} align={i > 0 ? 'right' : 'left'}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: 'Total Clicks',        value: totalClicks,        pct: 100,                                                              color: COLORS.primary },
                      { label: 'Completed',           value: completed,          pct: completionRate,                                                   color: '#10b981'      },
                      { label: 'Failed',              value: failed,             pct: totalClicks ? (failed / totalClicks) * 100 : 0,                   color: '#ef4444'      },
                      { label: 'Quota Full',          value: quotaFull,          pct: totalClicks ? (quotaFull / totalClicks) * 100 : 0,                color: '#f59e0b'      },
                      { label: 'Security Terminated', value: securityTerminated, pct: totalClicks ? (securityTerminated / totalClicks) * 100 : 0,       color: '#dc2626'      },
                      { label: 'Reversed',            value: reversed,           pct: totalClicks ? (reversed / completed) * 100 : 0,                 color: '#6b7280'      },
                    ].map((row, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                        <TableCell sx={{ ...tbCell, py: 1.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: COLORS.textPrimary }}>{row.label}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tbCell, fontSize: '0.84rem', fontWeight: 700, color: COLORS.textPrimary }} align="right">
                          {formatPts(row.value)}
                        </TableCell>
                        <TableCell sx={tbCell} align="right">
                          <Chip label={formatPct(row.pct)} size="small"
                            sx={{ bgcolor: `${row.color}15`, color: row.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
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