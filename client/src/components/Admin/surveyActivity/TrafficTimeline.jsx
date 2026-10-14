import { Box, Typography } from '@mui/material'
import TrafficEvent from './TrafficEvent'

// Every request and response for this click, oldest first
const TrafficTimeline = ({ traffic, COLORS }) => {
  if (!traffic || traffic.length === 0) {
    return (
      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, py: 1.5 }}>
        No traffic logs are linked to this click.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {traffic.map((event, i) => (
        <TrafficEvent key={event.id} event={event} COLORS={COLORS} defaultOpen={i === traffic.length - 1 && traffic.length === 1} />
      ))}
    </Box>
  )
}

export default TrafficTimeline
