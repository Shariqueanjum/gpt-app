// ============================================================
// ReferralsPage.jsx — Referral Program
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Paper, Button, Chip, Skeleton, Alert,
  useTheme, useMediaQuery, TextField, InputAdornment, IconButton
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const ReferralsPage = ({ darkMode, toggleDarkMode }) => {
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [referralData, setReferralData] = useState(null)
  const [referredUsers, setReferredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/referrals/')
      setReferralData(res.data.data || {})
      setReferredUsers(res.data.data?.referrals || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referral data')
    } finally {
      setLoading(false)
    }
  }

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || ''}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join WWABCASH',
          text: `Join me on WWABCASH and start earning! Use my referral code: ${user?.referral_code}`,
          url: referralLink,
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy()
    }
  }

  const formatPoints = (val) => {
    if (val === undefined || val === null) return '0'
    return Math.floor(val).toLocaleString()
  }

  const formatDollar = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return `$${parseFloat(val).toFixed(2)}`
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: isMobile ? 2 : 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, mt: isMobile ? 1 : 0 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5
          }}>
            Refer & Earn
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Invite friends and earn 10% of their earnings forever
          </Typography>
        </Box>

        {/* Referral Link Card */}
        <Paper sx={{
          p: 3, borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.primary}12 0%, ${COLORS.primary}03 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.primary
            }}>
              <PeopleIcon sx={{ fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.textPrimary }}>
                Your Referral Link
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                Share this link with friends to earn rewards
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            value={referralLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy} size="small" sx={{ color: COLORS.primary }}>
                    <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
              }
            }}
          />

          {copied && (
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }}>
              Link copied to clipboard!
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              onClick={handleCopy}
              variant="outlined"
              startIcon={<ContentCopyIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderColor: COLORS.primary, color: COLORS.primary,
                fontWeight: 700, textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primaryDark }
              }}
            >
              Copy Link
            </Button>
            <Button
              onClick={handleShare}
              variant="contained"
              startIcon={<ShareIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                bgcolor: COLORS.primary, color: '#fff',
                fontWeight: 700, textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: COLORS.primaryDark },
                boxShadow: 'none',
              }}
            >
              Share
            </Button>
          </Box>

          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}20` }}>
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
              <strong style={{ color: COLORS.gold }}>Referral Code:</strong>{' '}
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: COLORS.textPrimary }}>
                {user?.referral_code || 'N/A'}
              </span>
            </Typography>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, 1fr)' },
          gap: 2, mb: 3
        }}>
          {loading ? (
            <>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
            </>
          ) : (
            <>
              <Paper sx={{
                p: 2.5, borderRadius: 3,
                bgcolor: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                textAlign: 'center'
              }}>
                <PersonAddIcon sx={{ fontSize: '1.8rem', color: COLORS.primary, mb: 1 }} />
                <Typography sx={{
                  fontWeight: 800, fontSize: '1.6rem', color: COLORS.textPrimary
                }}>
                  {referralData?.total_referrals || 0}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                  Friends Referred
                </Typography>
              </Paper>

              <Paper sx={{
                p: 2.5, borderRadius: 3,
                bgcolor: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                textAlign: 'center'
              }}>
                <MonetizationOnIcon sx={{ fontSize: '1.8rem', color: COLORS.gold, mb: 1 }} />
                <Typography sx={{
                  fontWeight: 800, fontSize: '1.6rem', color: COLORS.textPrimary
                }}>
                  {formatPoints(referralData?.total_earned || 0)}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                  Points Earned
                </Typography>
              </Paper>
            </>
          )}
        </Box>

        {/* Referred Users List */}
        <Paper sx={{
          p: isMobile ? 2 : 3, borderRadius: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          <Typography sx={{
            fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary, mb: 2
          }}>
            Your Referrals
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />)}
            </Box>
          ) : referredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: '3rem', color: COLORS.textMuted, mb: 1 }} />
              <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                No referrals yet
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.85rem', mt: 0.5 }}>
                Share your link to start earning from referrals
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {referredUsers.map((ref, idx) => (
                <Paper key={ref.id || idx} sx={{
                  p: isMobile ? 1.2 : 2,
                  px: isMobile ? 1.5 : 2,
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `1px solid ${COLORS.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '50%',
                      bgcolor: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.primary, fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {ref.username?.[0]?.toUpperCase() || 'U'}
                    </Box>
                    <Box>
                      <Typography sx={{
                        fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary
                      }}>
                        {ref.username || 'User'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                        Joined {new Date(ref.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{
                      fontWeight: 700, fontSize: '0.95rem', color: COLORS.gold
                    }}>
                      +{formatPoints(ref.earned_from_referral || 0)} pts
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                      earned from them
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </PageWrapper>
  )
}

export default ReferralsPage