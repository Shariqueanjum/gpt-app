import { Box } from '@mui/material'

// Read-only pretty JSON. Strings that happen to contain JSON (response bodies
// are stored as text) are parsed first so they don't show up double-escaped.
const toPretty = (value) => {
  if (value === null || value === undefined || value === '') return null
  let parsed = value
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value) } catch { return value }
  }
  try { return JSON.stringify(parsed, null, 2) } catch { return String(value) }
}

const JsonBlock = ({ value, COLORS, maxHeight = 220 }) => {
  const text = toPretty(value)
  if (!text) return null

  return (
    <Box component="pre" sx={{
      m: 0, p: 1.4, borderRadius: 2, overflow: 'auto', maxHeight,
      fontSize: '0.72rem', lineHeight: 1.55,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      bgcolor: `${COLORS.primary}08`, border: `1px solid ${COLORS.border}`,
      color: COLORS.textPrimary, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>
      {text}
    </Box>
  )
}

export default JsonBlock
