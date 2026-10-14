import { Box } from '@mui/material'
import { getWallTypeMeta } from './surveyActivityConstants'

const WallTypePill = ({ type }) => {
  const meta = getWallTypeMeta(type)
  return (
    <Box sx={{
      display: 'inline-block', px: 0.9, py: 0.15, borderRadius: 4, fontSize: '0.66rem', fontWeight: 800,
      color: meta.color, bgcolor: `${meta.color}15`, textTransform: 'uppercase', letterSpacing: '0.03em',
    }}>
      {meta.label}
    </Box>
  )
}

export default WallTypePill
