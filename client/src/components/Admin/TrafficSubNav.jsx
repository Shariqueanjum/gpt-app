import { Box } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { getColors } from '../Layout/SharedLayout'

const TABS = [
  { label: 'Survey Activity', path: '/admin/survey-activity' },
  { label: 'Raw Logs', path: '/admin/traffic-logs' },
]

// Two-tab switch shown at the top of both traffic pages so they behave like
// one section: Survey Activity (one row per click) and Raw Logs (one row per request).
const TrafficSubNav = ({ darkMode }) => {
  const COLORS = getColors(darkMode)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box sx={{
      display: 'inline-flex', gap: 0.5, p: 0.5, mb: 2.5, borderRadius: 3,
      border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg, maxWidth: '100%',
    }}>
      {TABS.map((tab) => {
        const active = pathname === tab.path
        return (
          <Box key={tab.path} onClick={() => navigate(tab.path)} sx={{
            px: { xs: 1.6, sm: 2.2 }, py: 0.8, borderRadius: 2.2, cursor: 'pointer',
            fontSize: '0.83rem', fontWeight: 700, whiteSpace: 'nowrap',
            color: active ? '#fff' : COLORS.textSecondary,
            bgcolor: active ? COLORS.primary : 'transparent',
            '&:hover': { bgcolor: active ? COLORS.primary : `${COLORS.primary}10` },
          }}>
            {tab.label}
          </Box>
        )
      })}
    </Box>
  )
}

export default TrafficSubNav
