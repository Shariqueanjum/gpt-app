import { Box, Typography, Chip, Skeleton } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import useLiveActivity from '../../hooks/useLiveActivity'

// Flag emoji from ISO country code
const countryFlag = (code) => {
  if (!code || code.length !== 2) return '🌐'
  try {
    return code.toUpperCase().replace(/./g, (c) =>
      String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
    )
  } catch { return '🌐' }
}

const timeAgo = (isoString) => {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const LiveActivityFeed = ({ isDark }) => {
  const { activities, connected, error } = useLiveActivity()

  const cardBg     = isDark ? '#1e293b' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'
  const textPrimary   = isDark ? '#f1f5f9' : '#0f172a'
  const textSecondary = isDark ? '#94a3b8' : '#64748b'
  const rowBg = isDark ? '#0f172a' : '#f8fafc'

  return (
    <Box
      sx={{
        bgcolor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2,
        borderBottom: `1px solid ${cardBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography variant="body1" fontWeight={700} sx={{ color: textPrimary }}>
          🌍 Live Activity
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {error ? (
            <WifiOffIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
          ) : (
            <FiberManualRecordIcon
              sx={{
                fontSize: 10,
                color: connected ? '#10b981' : '#f59e0b',
                animation: connected ? 'livePulse 2s infinite' : 'none',
                '@keyframes livePulse': {
                  '0%,100%': { opacity: 1 },
                  '50%':     { opacity: 0.3 },
                },
              }}
            />
          )}
          <Typography variant="caption" sx={{ color: connected ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            {error ? 'Recent' : connected ? 'Live' : 'Connecting…'}
          </Typography>
        </Box>
      </Box>

      {/* Feed */}
      <Box sx={{ maxHeight: 320, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: cardBorder, borderRadius: 99 } }}>
        {activities.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ px: 2.5, py: 1.4, borderBottom: `1px solid ${cardBorder}` }}>
                <Skeleton width={`${60 + Math.random() * 30}%`} height={14} sx={{ bgcolor: isDark ? '#334155' : '#e2e8f0', borderRadius: 1 }} />
              </Box>
            ))
          : activities.map((a, i) => (
              <Box
                key={`${a.id}-${i}`}
                sx={{
                  px: 2.5, py: 1.4,
                  borderBottom: `1px solid ${cardBorder}`,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { bgcolor: rowBg },
                  transition: 'background 0.15s ease',
                  // Slide-in for new items
                  animation: i === 0 ? 'slideIn 0.3s ease' : 'none',
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateY(-8px)' },
                    to:   { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {/* Flag */}
                <Typography sx={{ fontSize: '1.1rem', flexShrink: 0, lineHeight: 1 }}>
                  {countryFlag(a.country)}
                </Typography>

                {/* Text */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: textPrimary,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.82rem',
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 700 }}>{a.username}</Box>
                    {' completed a survey on '}
                    <Box component="span" sx={{ color: textSecondary }}>{a.offer_wall}</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSecondary }}>
                    {a.country} · {timeAgo(a.time)}
                  </Typography>
                </Box>

                {/* Amount */}
                {a.amount && (
                  <Chip
                    label={`+$${parseFloat(a.amount).toFixed(2)}`}
                    size="small"
                    sx={{
                      bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5',
                      color: '#10b981',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      height: 20,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
            ))}
      </Box>
    </Box>
  )
}

export default LiveActivityFeed
