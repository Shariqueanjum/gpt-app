import { Typography } from '@mui/material'

/** Phones only: tells the admin a wide table scrolls sideways. */
const SwipeHint = ({ COLORS }) => (
  <Typography sx={{
    display: { xs: 'block', md: 'none' }, textAlign: 'right', px: 1.5, pt: 0.9, pb: 0.2,
    fontSize: '0.68rem', fontWeight: 600, color: COLORS.textMuted,
  }}>
    ↔ Swipe sideways to see all columns
  </Typography>
)

export default SwipeHint
