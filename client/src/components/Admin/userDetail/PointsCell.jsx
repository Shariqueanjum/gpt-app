import { Box, Typography } from '@mui/material'
import { formatPoints, formatDollar } from './userDetailFormat'

/**
 * Points big, dollar equivalent small underneath.
 *   756 pts
 *   $7.56
 * `signed` adds a + for positive numbers, `color` overrides the points colour.
 */
const PointsCell = ({ points, COLORS, align = 'left', signed = false, color, size = 'md', muted = false }) => {
  const n = Number(points) || 0
  const sign = signed && n > 0 ? '+' : ''
  const big = size === 'lg' ? '1.45rem' : size === 'sm' ? '0.82rem' : '0.9rem'
  const small = size === 'lg' ? '0.78rem' : '0.7rem'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start', gap: 0.15 }}>
      <Typography sx={{
        fontWeight: size === 'lg' ? 800 : 700, fontSize: big, lineHeight: 1.2, whiteSpace: 'nowrap',
        color: color || (muted ? COLORS.textMuted : COLORS.textPrimary),
      }}>
        {sign}{formatPoints(n)}
      </Typography>
      <Typography sx={{ fontSize: small, color: COLORS.textMuted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
        {sign}{formatDollar(n)}
      </Typography>
    </Box>
  )
}

export default PointsCell
