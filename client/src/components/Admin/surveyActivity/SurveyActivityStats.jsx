import { Box, Typography, Skeleton } from '@mui/material'
import { formatPoints, getStatusMeta } from './surveyActivityConstants'

// Status counts for the current filters. Each card doubles as a quick status
// filter: click to filter, click again to clear.
const CARDS = [
  { key: '', label: 'All clicks', statKey: 'total', color: '#5312bc' },
  { key: 'pending', label: 'Pending', statKey: 'pending' },
  { key: 'completed', label: 'Completed', statKey: 'completed', pointsKey: 'completed_points' },
  { key: 'reversed', label: 'Reversed', statKey: 'reversed', pointsKey: 'reversed_points' },
  { key: 'not_completed', label: 'Failed / other', statKey: 'not_completed', color: '#6b7280' },
]

const SurveyActivityStats = ({ stats, activeStatus, onSelect, COLORS }) => (
  <Box sx={{
    display: 'grid', gap: 1.5, mb: 2.5,
    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
  }}>
    {CARDS.map((card) => {
      const color = card.color || getStatusMeta(card.key).color
      const active = (activeStatus || '') === card.key
      return (
        <Box key={card.label} onClick={() => onSelect(active && card.key !== '' ? '' : card.key)} sx={{
          p: 1.8, borderRadius: 3, cursor: 'pointer', bgcolor: COLORS.cardBg,
          border: `1.5px solid ${active ? color : COLORS.border}`,
          transition: 'border-color .15s, transform .15s',
          '&:hover': { borderColor: color, transform: 'translateY(-1px)' },
          // last card spans the row on 2-column phones so the grid has no gap
          '&:last-of-type': { gridColumn: { xs: 'span 2', sm: 'auto' } },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {card.label}
            </Typography>
          </Box>
          {stats ? (
            <>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                {Number(stats[card.statKey] || 0).toLocaleString('en-US')}
              </Typography>
              {card.pointsKey && (
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                  {formatPoints(stats[card.pointsKey])}
                </Typography>
              )}
            </>
          ) : (
            <Skeleton variant="rounded" width={60} height={30} />
          )}
        </Box>
      )
    })}
  </Box>
)

export default SurveyActivityStats
