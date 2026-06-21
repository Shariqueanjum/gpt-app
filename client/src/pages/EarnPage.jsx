// ============================================================
// EarnPage.jsx — Offer Wall Content Page
// Handles: iframe | api | router offer wall types
// Route: /earn?wall=bitlabs  (or /earn?tab=surveys for generic)
// ============================================================
import { useEffect, useState, useCallback } from 'react'
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

// ============================================================
// Config: Redirect params for each wall type (easily changeable per client)
// These are the query params appended to iframe/router URLs
// ============================================================
const REDIRECT_CONFIG = {
  // Common params sent to ALL walls
  common: {
    user_id: 'user_id',        // maps to user's public_id
    sub_id_1: 'sub_id_1',      // maps to user's public_id
    transaction_id: 'transaction_id', // maps to click tracking id from backend
  },
  // Wall-specific overrides (if a client wants different param names)
  overrides: {
    // example: 'bitlabs': { user_id: 'uid', sub_id_1: 'sub1' }
  }
}

const EarnPage = ({ darkMode, toggleDarkMode }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)

  const wallId = searchParams.get('wall')
  const tab = searchParams.get('tab') // surveys | games | offers

  const [offerWalls, setOfferWalls] = useState([])
  const [selectedWall, setSelectedWall] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [iframeUrl, setIframeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clickTracking, setClickTracking] = useState(null)

  // Fetch all offer walls on mount
  useEffect(() => {
    fetchOfferWalls()
  }, [])

  // When wallId changes, load that wall's content
  useEffect(() => {
    if (!wallId || offerWalls.length === 0) return
    const wall = offerWalls.find(w => w.internal_id === wallId || w.id === parseInt(wallId))
    if (wall) {
      loadWallContent(wall)
    }
  }, [wallId, offerWalls])

  const fetchOfferWalls = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/offer-walls/')
      const walls = res.data.data || []
      setOfferWalls(walls)

      // If no wall specified but tab is, filter by category
      if (!wallId && tab) {
        // Just show walls list filtered by tab category
        setLoading(false)
        return
      }

      // If wallId specified, find and load it
      if (wallId) {
        const wall = walls.find(w => w.internal_id === wallId || w.id === parseInt(wallId))
        if (wall) {
          await loadWallContent(wall)
        } else {
          setError('Offer wall not found')
          setLoading(false)
        }
      } else {
        // No wall selected, show all walls
        setLoading(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load offer walls')
      setLoading(false)
    }
  }

  // Track click before loading wall content
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

    // Track the click first
    const clickData = await trackClick(wall.id)
    setClickTracking(clickData)

    try {
      if (wall.type === 'iframe') {
        // Build iframe URL with user params
        const url = buildWallUrl(wall, clickData)
        setIframeUrl(url)
        setLoading(false)
      } else if (wall.type === 'api') {
        // Fetch surveys from backend
        const res = await axiosInstance.get(`/offer-walls/${wall.internal_id}/surveys`)
        setSurveys(res.data.data?.surveys || [])
        setLoading(false)
      } else if (wall.type === 'router') {
        // Build redirect URL and navigate
        const url = buildWallUrl(wall, clickData)
        window.location.href = url
        // Don't set loading false — page is navigating away
      } else {
        setError(`Unknown offer wall type: ${wall.type}`)
        setLoading(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${wall.name}`)
      setLoading(false)
    }
  }

  // Build URL with user params for iframe/router walls
  const buildWallUrl = (wall, clickData) => {
    if (!wall.endpoint_url) return ''

    const url = new URL(wall.endpoint_url)
    const cfg = REDIRECT_CONFIG
    const overrides = cfg.overrides[wall.internal_id] || {}

    // Add common params
    const params = {
      [overrides.user_id || cfg.common.user_id]: user?.public_id || user?.id,
      [overrides.sub_id_1 || cfg.common.sub_id_1]: user?.public_id || user?.id,
    }

    // Add transaction/click tracking id if available
    if (clickData?.click_id || clickData?.id) {
      params[overrides.transaction_id || cfg.common.transaction_id] = clickData.click_id || clickData.id
    }

    // Add any wall-specific params from config
    if (wall.config?.extra_params) {
      Object.assign(params, wall.config.extra_params)
    }

    // Append all params to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, String(value))
    })

    return url.toString()
  }

  // Handle survey click for API-type walls
  const handleSurveyClick = async (survey) => {
    if (!selectedWall) return

    // Track click
    const clickData = await trackClick(selectedWall.id)

    // Build survey URL with tracking
    let surveyUrl = survey.url || survey.survey_url || survey.link
    if (!surveyUrl) {
      // If no direct URL, maybe we need to construct it
      surveyUrl = `${selectedWall.endpoint_url}?survey_id=${survey.survey_id}&user_id=${user?.public_id}`
    }

    // Add click tracking
    if (clickData?.click_id || clickData?.id) {
      const url = new URL(surveyUrl)
      url.searchParams.set('transaction_id', clickData.click_id || clickData.id)
      surveyUrl = url.toString()
    }

    // Open in new tab
    window.open(surveyUrl, '_blank')
  }

  // Format points
  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const formatDollar = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return `$${parseFloat(val).toFixed(2)}`
  }

  // ============================================================
  // RENDER: WALL LIST (when no specific wall selected)
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
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{
              fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5
            }}>
              {tab ? `${tab.charAt(0).toUpperCase() + tab.slice(1)}` : 'All Offer Walls'}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
              Choose a partner to start earning
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          ) : filteredWalls.length === 0 ? (
            <Paper sx={{
              p: 4, borderRadius: 3, textAlign: 'center',
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`
            }}>
              <Typography sx={{ color: COLORS.textSecondary }}>
                No offer walls available in this category.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
            }}>
              {filteredWalls.map((wall, idx) => {
                const color = ['#5312bc', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'][idx % 6]
                const isLocked = wall.min_level && user?.level_id < wall.min_level

                return (
                  <Paper key={wall.id} onClick={() => {
                    if (!isLocked) navigate(`/earn?wall=${wall.internal_id || wall.id}`)
                  }} sx={{
                    p: 3, borderRadius: 3,
                    bgcolor: COLORS.cardBg,
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
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 2,
                      bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mb: 1.5, color: color
                    }}>
                      <PollIcon />
                    </Box>
                    <Typography sx={{
                      fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary, mb: 0.5
                    }}>
                      {wall.name}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.82rem', color: COLORS.textSecondary, mb: 1.5, lineHeight: 1.5
                    }}>
                      {wall.description || 'High paying surveys and offers'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={wall.type.toUpperCase()} sx={{
                        bgcolor: `${color}12`, color: color,
                        fontWeight: 600, fontSize: '0.7rem'
                      }} />
                      {wall.rating && (
                        <Chip size="small" icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
                          label={`${wall.rating}`} sx={{
                            bgcolor: `${COLORS.gold}12`, color: COLORS.gold,
                            fontWeight: 600, fontSize: '0.7rem'
                          }} />
                      )}
                      {isLocked && (
                        <Chip size="small" label={`Lvl ${wall.min_level}+`} sx={{
                          bgcolor: '#fef2f2', color: COLORS.danger,
                          fontWeight: 600, fontSize: '0.7rem'
                        }} />
                      )}
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
  // RENDER: IFRAME WALL
  // ============================================================
  if (selectedWall?.type === 'iframe' && iframeUrl) {
    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{ maxWidth: '100%', mx: 'auto', height: 'calc(100vh - 120px)' }}>
          {/* Header Bar */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
            px: { xs: 0, md: 0 }
          }}>
            <Button
              onClick={() => navigate('/earn')}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: `${COLORS.primary}08`, color: COLORS.primary }
              }}
            >
              Back
            </Button>
            <Typography sx={{
              fontWeight: 700, fontSize: '1.1rem', color: COLORS.textPrimary
            }}>
              {selectedWall.name}
            </Typography>
            <Chip size="small" label="IFRAME" sx={{
              bgcolor: `${COLORS.primary}12`, color: COLORS.primary,
              fontWeight: 700, fontSize: '0.65rem'
            }} />
          </Box>

          <Paper sx={{
            width: '100%', height: '100%',
            borderRadius: 3, overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
            bgcolor: COLORS.cardBg,
          }}>
            <iframe
              src={iframeUrl}
              title={selectedWall.name}
              style={{
                width: '100%', height: '100%',
                border: 'none',
                backgroundColor: COLORS.cardBg,
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
          </Paper>
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
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 3
          }}>
            <Button
              onClick={() => navigate('/earn')}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: `${COLORS.primary}08`, color: COLORS.primary }
              }}
            >
              Back
            </Button>
            <Typography sx={{
              fontWeight: 700, fontSize: '1.2rem', color: COLORS.textPrimary
            }}>
              {selectedWall.name}
            </Typography>
            <Chip size="small" label="API" sx={{
              bgcolor: `${COLORS.accent}12`, color: COLORS.accent,
              fontWeight: 700, fontSize: '0.65rem'
            }} />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {error}
            </Alert>
          ) : surveys.length === 0 ? (
            <Paper sx={{
              p: 4, borderRadius: 3, textAlign: 'center',
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`
            }}>
              <Typography sx={{ color: COLORS.textSecondary, mb: 1 }}>
                No surveys available right now.
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>
                Check back later — new surveys are added frequently!
              </Typography>
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
                    bgcolor: COLORS.cardBg,
                    border: `1px solid ${COLORS.border}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: `${color}40`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    },
                  }}>
                    <Box sx={{
                      display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'flex-start', md: 'center' },
                      gap: 2, justifyContent: 'space-between'
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: color, flexShrink: 0
                          }}>
                            <PollIcon sx={{ fontSize: '1.2rem' }} />
                          </Box>
                          <Box>
                            <Typography sx={{
                              fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary
                            }}>
                              {survey.survey_name || survey.title || 'Untitled Survey'}
                            </Typography>
                            <Typography sx={{
                              fontSize: '0.78rem', color: COLORS.textMuted
                            }}>
                              ID: {survey.survey_id || survey.id || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{
                          display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5
                        }}>
                          {loi > 0 && (
                            <Chip size="small" icon={<TimerIcon sx={{ fontSize: '0.85rem !important' }} />}
                              label={`${loi} min`} sx={{
                                bgcolor: `${COLORS.primary}08`, color: COLORS.primary,
                                fontWeight: 600, fontSize: '0.72rem'
                              }} />
                          )}
                          {survey.category && (
                            <Chip size="small" icon={<CategoryIcon sx={{ fontSize: '0.85rem !important' }} />}
                              label={survey.category} sx={{
                                bgcolor: `${color}08`, color: color,
                                fontWeight: 600, fontSize: '0.72rem'
                              }} />
                          )}
                          {survey.country && (
                            <Chip size="small" icon={<LocationOnIcon sx={{ fontSize: '0.85rem !important' }} />}
                              label={survey.country} sx={{
                                bgcolor: `${COLORS.accent}08`, color: COLORS.accent,
                                fontWeight: 600, fontSize: '0.72rem'
                              }} />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'flex-end' },
                        gap: 1, minWidth: 140
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MonetizationOnIcon sx={{ fontSize: '1.1rem', color: COLORS.gold }} />
                          <Typography sx={{
                            fontWeight: 800, fontSize: '1.3rem', color: COLORS.gold
                          }}>
                            {formatPoints(points)}
                          </Typography>
                          <Typography sx={{
                            fontSize: '0.75rem', color: COLORS.textMuted
                          }}>
                            pts
                          </Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: '0.78rem', color: COLORS.textSecondary
                        }}>
                          ≈ {formatDollar(points / 100)}
                        </Typography>
                        <Button
                          onClick={() => handleSurveyClick(survey)}
                          variant="contained"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '0.9rem' }} />}
                          sx={{
                            mt: 0.5,
                            bgcolor: COLORS.primary,
                            color: '#fff',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3, py: 0.8,
                            fontSize: '0.85rem',
                            '&:hover': { bgcolor: COLORS.primaryDark },
                            boxShadow: 'none',
                          }}
                        >
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
  // RENDER: ROUTER WALL — Redirecting
  // ============================================================
  if (selectedWall?.type === 'router') {
    return (
      <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Box sx={{
          maxWidth: 600, mx: 'auto', mt: 8, textAlign: 'center'
        }}>
          <CircularProgress size={48} sx={{ color: COLORS.primary, mb: 3 }} />
          <Typography sx={{
            fontWeight: 700, fontSize: '1.3rem', color: COLORS.textPrimary, mb: 1
          }}>
            Redirecting to {selectedWall.name}...
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary, mb: 3 }}>
            You are being redirected to complete offers on {selectedWall.name}.
          </Typography>
          <Button
            onClick={() => window.location.href = iframeUrl}
            variant="contained"
            sx={{
              bgcolor: COLORS.primary, color: '#fff',
              fontWeight: 700, textTransform: 'none',
              borderRadius: 2, px: 4, py: 1,
              '&:hover': { bgcolor: COLORS.primaryDark }
            }}
          >
            Go Now
          </Button>
          <Box sx={{ mt: 2 }}>
            <Button
              onClick={() => navigate('/earn')}
              sx={{
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { color: COLORS.primary }
              }}
            >
              Go Back
            </Button>
          </Box>
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
        {loading ? (
          <CircularProgress size={40} sx={{ color: COLORS.primary }} />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
            {error}
          </Alert>
        ) : (
          <Typography sx={{ color: COLORS.textSecondary }}>
            Select an offer wall to start earning
          </Typography>
        )}
      </Box>
    </PageWrapper>
  )
}

export default EarnPage