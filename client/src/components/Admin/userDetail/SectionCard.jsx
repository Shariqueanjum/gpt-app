import { Box, Typography } from '@mui/material'

/** Titled card used for every block of the user detail so it reads like a clear report. */
const SectionCard = ({ title, subtitle, action, COLORS, children, noPadding = false }) => (
  <Box sx={{ borderRadius: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg, overflow: 'hidden' }}>
    <Box sx={{
      px: { xs: 1.75, sm: 2.25 }, pt: 1.75, pb: subtitle ? 1.25 : 1,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap',
    }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: COLORS.textPrimary, lineHeight: 1.3 }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.76rem', color: COLORS.textMuted, mt: 0.3, lineHeight: 1.4 }}>{subtitle}</Typography>
        )}
      </Box>
      {action}
    </Box>
    <Box sx={noPadding ? {} : { px: { xs: 1.75, sm: 2.25 }, pb: 2 }}>{children}</Box>
  </Box>
)

export default SectionCard
