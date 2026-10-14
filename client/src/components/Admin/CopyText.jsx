import { useState } from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import CheckIcon from '@mui/icons-material/Check'

// Monospace id that copies itself on click. Long ids are truncated in the UI
// (the tooltip shows the full value) but the whole value is what gets copied.
const CopyText = ({ value, COLORS, maxWidth = 170, fontSize = '0.74rem' }) => {
  const [copied, setCopied] = useState(false)

  if (!value) {
    return <Typography sx={{ fontSize, color: COLORS.textMuted }}>—</Typography>
  }

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(String(value)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }).catch(() => { /* clipboard blocked — nothing to do */ })
  }

  return (
    <Tooltip title={copied ? 'Copied!' : `${value} — click to copy`} placement="top">
      <Box onClick={handleCopy} sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.6, cursor: 'pointer', maxWidth,
        '&:hover svg': { color: COLORS.primary },
      }}>
        <Typography noWrap sx={{
          fontSize, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: COLORS.textPrimary, minWidth: 0,
        }}>
          {value}
        </Typography>
        {copied
          ? <CheckIcon sx={{ fontSize: '0.8rem', color: '#10b981', flexShrink: 0 }} />
          : <ContentCopyOutlinedIcon sx={{ fontSize: '0.78rem', color: COLORS.textMuted, flexShrink: 0 }} />}
      </Box>
    </Tooltip>
  )
}

export default CopyText
