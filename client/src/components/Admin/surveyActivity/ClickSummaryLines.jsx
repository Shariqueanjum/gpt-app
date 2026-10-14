import { Box, Typography } from '@mui/material'

// Compact "label: value" block shown inside the confirm dialogs so the admin
// can see exactly which click they are about to change.
const ClickSummaryLines = ({ lines, COLORS }) => (
  <Box sx={{
    p: 1.4, mb: 1.8, borderRadius: 2.5, border: `1px solid ${COLORS.border}`,
    bgcolor: `${COLORS.primary}06`, display: 'flex', flexDirection: 'column', gap: 0.5,
  }}>
    {lines.map(({ label, value }) => (
      <Box key={label} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted, flexShrink: 0 }}>{label}</Typography>
        <Typography sx={{
          fontSize: '0.78rem', fontWeight: 600, color: COLORS.textPrimary, textAlign: 'right',
          wordBreak: 'break-all', fontFamily: label.toLowerCase().includes('id') ? 'ui-monospace, Menlo, monospace' : 'inherit',
        }}>
          {value || '—'}
        </Typography>
      </Box>
    ))}
  </Box>
)

export default ClickSummaryLines
