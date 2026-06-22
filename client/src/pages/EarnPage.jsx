// ============================================================
// EarnPage.jsx — Offer Wall Content Page
// ============================================================
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Paper, Chip, Skeleton, Button, Alert,
  useTheme, useMediaQuery, CircularProgress
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PollIcon from '@mui/icons-material/Poll'
import TimerIcon from '@mui/icons-material/Timer'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CategoryIcon from '@mui/icons-material/Category'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const EarnPage = ({ darkMode, toggleDarkMode }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)

  const wallId = searchParams.get('wall')
  const tab = searchParams.get('tab')

  const [offerWalls, setOfferWalls] = useState([])
  const [selectedWall, setSelectedWall] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [iframeUrl, setIframeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchOfferWalls() }, [])

  useEffect(() => {
    if (!wallId || offerWalls.length === 0) return
    const wall = offerWalls.find(w => w.internal_id === wallId || w.id === parseInt(wallId))
    if (wall) loadWallContent(wall)
  }, [wallId, offerWalls])

  const fetchOfferWalls = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/offer-walls/')
      const walls = res.data.data || []
      setOfferWalls(walls)
      if (!wallId && tab) { setLoading(false); return }
      if (wallId) {
        const wall = walls.find(w => w.internal_id === wallId || w.id === parseInt(wallId))
        if (wall) await loadWallContent(wall)
        else { setError('Offer wall not found'); setLoading(false) }
      } else setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load offer walls')
      setLoading(false)
    }
  }

  const trackClick = async (wallId) => {
    try {
      const res = await axiosInstance.post('/survey-clicks/', { offer_wall_id: wallId })
      return res.data.data
    } catch (err) {
      console.error('Click tracking failed:', err)
      return null
    }
  }

  const loadWallContent = async (wall) => {
    setSelectedWall(wall)
    setError(null)
    setLoading(true)

    try {
      if (wall.type === 'iframe') {
        // IFRAME: Track click on load — partner needs transaction_id in URL
        const clickData = await trackClick(wall.id)
        const url = buildWallUrl(wall, clickData)
        setIframeUrl(url)
        setLoading(false)
      } else if (wall.type === 'api') {
        // API: Don't track click yet. Just fetch surveys.
        const res = await axiosInstance.get(`/offer-walls/${wall.internal_id}/surveys`)
        setSurveys(res.data.data?.surveys || [])
        setLoading(false)
      } else if (wall.type === 'router') {
        // ROUTER: Don't track click yet. Just show landing page.
        setLoading(false)
      } else {
        setError(`Unknown offer wall type: ${wall.type}`)
        setLoading(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${wall.name}`)
      setLoading(false)
    }
  }

  const buildWallUrl = (wall, clickData) => {
    if (!wall.endpoint_url) return ''
    const url = new URL(wall.endpoint_url)
    const paramMapping = wall.config?.param_mapping || {}
    const params = {}

    if (paramMapping.user_id) params[paramMapping.user_id] = user?.public_id || user?.id
    if (paramMapping.sub_id) params[paramMapping.sub_id] = user?.public_id || user?.id
    if ((clickData?.click_id || clickData?.id) && paramMapping.transaction_id) {
      params[paramMapping.transaction_id] = clickData.click_id || clickData.id
    }
    if (paramMapping.username && user?.username) params[paramMapping.username] = user.username
    if (paramMapping.email && user?.email) params[paramMapping.email] = user.email
    if (paramMapping.country && user?.country) params[paramMapping.country] = user.country

    if (wall.config?.extra_params) {
      Object.entries(wall.config.extra_params).forEach(([key, value]) => {
        const replaced = String(value)
          .replace(/{{user_id}}/g, user?.public_id || user?.id || '')
          .replace(/{{username}}/g, user?.username || '')
          .replace(/{{email}}/g, user?.email || '')
          .replace(/{{country}}/g, user?.country || '')
          .replace(/{{click_id}}/g, clickData?.click_id || clickData?.id || '')
        if (replaced) params[key] = replaced
      })
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, String(value))
    })
    return url.toString()
  }

  // API: Track click ONLY when user clicks a specific survey
  const handleSurveyClick = async (survey) => {
    if (!selectedWall) return
    const clickData = await trackClick(selectedWall.id)
    let surveyUrl = survey.url || survey.survey_url || survey.link || survey.entry_url
    if (!surveyUrl && survey.survey_id) {
      surveyUrl = `${selectedWall.endpoint_url}?survey_id=${survey.survey_id}&user_id=${user?.public_id}`
    }
    if (!surveyUrl) { console.error('No survey URL'); return }

    if (clickData?.click_id || clickData?.id) {
      try {
        const url = new URL(surveyUrl)
        url.searchParams.set('transaction_id', clickData.click_id || clickData.id)
        surveyUrl = url.toString()
      } catch (e) {}
    }
    window.open(surveyUrl, '_blank')
  }

  // ROUTER: Track click ONLY when user clicks "Start Earning Now"
  const handleRouterStart = async () => {
    if (!selectedWall) return
    const clickData = await trackClick(selectedWall.id)
    const routerUrl = buildWallUrl(selectedWall, clickData)
    if (routerUrl) window.open(routerUrl, '_blank')
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const formatDollar = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return `$${parseFloat(val).toFixed(2)}`
  }

  // ============================================================
  // RENDER: WALL LIST
  // ============================================================
  if (!wallId) {
    const filteredWalls = tab
      ? offerWalls.filter(w => {
          if (tab === 'surveys') return w.category === 'survey' || w.category === 'surveys'
          if (tab === 'games') return w.category === 'game' || w.category === 'games'
          if (tab === 'offers') return w.category === 'offer' || w.category === 'offers'
          return true
        })
      : offerWalls

    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 3, px: { xs: 2, md: 3 } }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, color: COLORS.textPrimary, mb: 1 }}>
            {tab ? `${tab.charAt(0).toUpperCase() + tab.slice(1)}` : 'All Offer Walls'}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary, mb: 4 }}>
            Choose a partner to start earning
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          ) : filteredWalls.length === 0 ? (
            <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ color: COLORS.textSecondary }}>No offer walls available in this category.</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredWalls.map((wall, idx) => {
                const color = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'][idx % 6]
                const isLocked = wall.min_level && user?.level_id < wall.min_level
                const maxPayout = wall.config?.max_payout ? formatDollar(wall.config.max_payout / 100) : null

                return (
                  <Paper key={wall.id} onClick={() => {
                    if (!isLocked) navigate(`/earn?wall=${wall.internal_id || wall.id}`)
                  }} sx={{
                    p: 3, borderRadius: 3, bgcolor: COLORS.cardBg,
                    border: `1px solid ${COLORS.border}`,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                    transition: 'all 0.25s ease',
                    '&:hover': !isLocked && {
                      boxShadow: '0 8px 30px rgba(83,18,188,0.08)',
                      transform: 'translateY(-2px)',
                      borderColor: `${COLORS.primary}30`,
                    },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: color }}>
                            {wall.name?.[0]?.toUpperCase() || 'P'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary }}>{wall.name}</Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>{wall.description || 'High paying surveys and offers'}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.8 }}>
                            {wall.rating && <Chip size="small" label={`${wall.rating} ★`} sx={{ bgcolor: `${COLORS.gold}12`, color: COLORS.gold, fontWeight: 600, fontSize: '0.7rem' }} />}
                            {wall.category && <Chip size="small" label={wall.category} sx={{ bgcolor: `${color}08`, color: color, fontWeight: 600, fontSize: '0.7rem' }} />}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {maxPayout && <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.gold }}>Up to {maxPayout}</Typography>}
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{wall.type === 'iframe' ? 'In-app' : wall.type === 'api' ? 'Surveys' : 'External'}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>
      </PageWrapper>
    )
  }

  // ============================================================
  // RENDER: IFRAME WALL — Loads immediately with click tracked
  // ============================================================
  if (selectedWall?.type === 'iframe') {
    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: '100%', mx: 'auto', height: 'calc(100vh - 120px)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: { xs: 2, md: 3 } }}>
            <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: `${COLORS.primary}08`, color: COLORS.primary }
            }}>
              Back
            </Button>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.textPrimary }}>{selectedWall.name}</Typography>
            <Chip size="small" label="iFrame" sx={{ bgcolor: `${COLORS.primary}12`, color: COLORS.primary, fontWeight: 700, fontSize: '0.65rem' }} />
          </Box>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              title={selectedWall.name}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12, backgroundColor: darkMode ? '#1e293b' : '#fff' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
              <CircularProgress size={40} sx={{ color: COLORS.primary }} />
            </Box>
          )}
        </Box>
      </PageWrapper>
    )
  }

  // ============================================================
  // RENDER: API WALL — Survey List
  // ============================================================
  if (selectedWall?.type === 'api') {
    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 3, px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: `${COLORS.primary}08`, color: COLORS.primary }
            }}>
              Back
            </Button>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: COLORS.textPrimary }}>{selectedWall.name}</Typography>
            <Chip size="small" label="API" sx={{ bgcolor: `${COLORS.accent}12`, color: COLORS.accent, fontWeight: 700, fontSize: '0.65rem' }} />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />)}
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>
          ) : surveys.length === 0 ? (
            <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ color: COLORS.textSecondary, mb: 1 }}>No surveys available right now.</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>Check back later — new surveys are added frequently!</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {surveys.map((survey, idx) => {
                const color = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'][idx % 6]
                const points = survey.cpa || survey.payout || survey.reward || 0
                const loi = survey.loi || survey.length_of_interview || survey.estimated_time || 0

                return (
                  <Paper key={survey.survey_id || idx} sx={{
                    p: { xs: 2, md: 2.5 }, borderRadius: 3,
                    bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: `${color}40`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
                  }}>
                    <Box sx={{
                      display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'flex-start', md: 'center' },
                      gap: 2, justifyContent: 'space-between'
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
                            <PollIcon sx={{ fontSize: '1.2rem' }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary }}>{survey.survey_name || survey.title || 'Untitled Survey'}</Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>ID: {survey.survey_id || survey.id || 'N/A'}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                          {loi > 0 && <Chip size="small" icon={<TimerIcon sx={{ fontSize: '0.85rem !important' }} />} label={`${loi} min`} sx={{ bgcolor: `${COLORS.primary}08`, color: COLORS.primary, fontWeight: 600, fontSize: '0.72rem' }} />}
                          {survey.category && <Chip size="small" icon={<CategoryIcon sx={{ fontSize: '0.85rem !important' }} />} label={survey.category} sx={{ bgcolor: `${color}08`, color: color, fontWeight: 600, fontSize: '0.72rem' }} />}
                          {survey.country && <Chip size="small" icon={<LocationOnIcon sx={{ fontSize: '0.85rem !important' }} />} label={survey.country} sx={{ bgcolor: `${COLORS.accent}08`, color: COLORS.accent, fontWeight: 600, fontSize: '0.72rem' }} />}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1, minWidth: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MonetizationOnIcon sx={{ fontSize: '1.1rem', color: COLORS.gold }} />
                          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.gold }}>{formatPoints(points)}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>pts</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>≈ {formatDollar(points / 100)}</Typography>
                        <Button onClick={() => handleSurveyClick(survey)} variant="contained" endIcon={<OpenInNewIcon sx={{ fontSize: '0.9rem' }} />} sx={{
                          mt: 0.5, bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 3, py: 0.8, fontSize: '0.85rem', '&:hover': { bgcolor: COLORS.primaryDark }, boxShadow: 'none',
                        }}>
                          Start Survey
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>
      </PageWrapper>
    )
  }

  // ============================================================
  // RENDER: ROUTER WALL — Landing Page
  // ============================================================
  if (selectedWall?.type === 'router') {
    const maxPayout = selectedWall.config?.max_payout ? formatDollar(selectedWall.config.max_payout / 100) : '$10.00'

    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: 800, mx: 'auto', pt: 3, px: { xs: 2, md: 3 } }}>
          <Box onClick={() => navigate(-1)} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, cursor: 'pointer', color: COLORS.textSecondary, fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.2s', '&:hover': { color: COLORS.primary }, width: 'fit-content' }}>
            <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
            Back to Partners
          </Box>

          <Paper sx={{ borderRadius: 4, p: { xs: 3, md: 5 }, mb: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, bgcolor: COLORS.primary }} />
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, mt: 1 }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: COLORS.primary }}>{selectedWall.name?.[0]?.toUpperCase() || 'P'}</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, color: COLORS.textPrimary, mb: 1 }}>{selectedWall.name}</Typography>
            <Typography sx={{ fontSize: '1.1rem', color: COLORS.textSecondary, mb: 3, maxWidth: 500, mx: 'auto' }}>{selectedWall.description || 'Complete surveys and offers to earn rewards'}</Typography>

            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: `${COLORS.gold}15`, border: `1px solid ${COLORS.gold}30`, borderRadius: 3, px: 3, py: 1.5, mb: 4 }}>
              <MonetizationOnIcon sx={{ color: COLORS.gold, fontSize: '1.5rem' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.gold }}>Earn up to {maxPayout} per survey</Typography>
            </Box>

            <Button onClick={handleRouterStart} variant="contained" sx={{
              bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 3, px: 6, py: 1.5, fontSize: '1.1rem',
              boxShadow: `0 8px 24px ${COLORS.primary}40`, '&:hover': { bgcolor: COLORS.primaryDark, transform: 'translateY(-2px)' }, transition: 'all 0.3s ease',
            }}>
              <OpenInNewIcon sx={{ fontSize: '1.2rem', mr: 1 }} />
              Start Earning Now
            </Button>

            <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mt: 2 }}>Opens in a new tab · You will be redirected to {selectedWall.name}</Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}>
            {[{ icon: '⚡', text: 'Instant Credit' }, { icon: '🔄', text: 'Daily Surveys' }, { icon: '🛡️', text: 'Verified Partner' }, { icon: '💰', text: 'High Payouts' }].map((badge, i) => (
              <Paper key={i} sx={{ borderRadius: 2.5, px: 2.5, py: 1.5, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8f9fa', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{badge.icon}</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: COLORS.textSecondary }}>{badge.text}</Typography>
              </Paper>
            ))}
          </Box>

          <Paper sx={{ borderRadius: 3, p: 3, bgcolor: darkMode ? 'rgba(83,18,188,0.05)' : '#f5f0ff', border: `1px solid ${COLORS.primary}20` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary, mb: 2 }}>How it works</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Click "Start Earning Now" to open surveys in a new tab', 'Complete surveys honestly and accurately', 'Credits are added to your account automatically', 'Come back anytime to check your earnings'].map((step, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: COLORS.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.1 }}>{i + 1}</Box>
                  <Typography sx={{ fontSize: '0.88rem', color: COLORS.textSecondary, lineHeight: 1.5 }}>{step}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </PageWrapper>
    )
  }

  // ============================================================
  // RENDER: LOADING / ERROR STATES
  // ============================================================
  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 4, textAlign: 'center' }}>
        {loading ? <CircularProgress size={40} sx={{ color: COLORS.primary }} /> : error ? <Alert severity="error" sx={{ borderRadius: 2, maxWidth: 500, mx: 'auto' }}>{error}</Alert> : <Typography sx={{ color: COLORS.textSecondary }}>Select an offer wall to start earning</Typography>}
      </Box>
    </PageWrapper>
  )
}

export default EarnPage