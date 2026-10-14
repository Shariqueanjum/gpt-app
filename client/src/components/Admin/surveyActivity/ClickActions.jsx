import { Box, Button, IconButton, Tooltip } from '@mui/material'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

// Reverse / Undo / Details for one click. The API decides which action is
// allowed (can_reverse / can_undo) so the buttons can never offer something
// the backend would refuse.
const ClickActions = ({ row, COLORS, onReverse, onUndo, onDetails, showDetails = true, fullWidth = false }) => {
  const buttonSx = {
    textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.76rem',
    py: 0.4, px: 1.4, minWidth: 0, ...(fullWidth ? { flex: 1 } : {}),
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, justifyContent: fullWidth ? 'stretch' : 'flex-end', width: fullWidth ? '100%' : 'auto' }}>
      {row.can_reverse && (
        <Button size="small" variant="outlined" startIcon={<GavelOutlinedIcon sx={{ fontSize: '0.95rem !important' }} />}
          onClick={(e) => { e.stopPropagation(); onReverse(row) }}
          sx={{ ...buttonSx, color: COLORS.danger, borderColor: `${COLORS.danger}60`, '&:hover': { borderColor: COLORS.danger, bgcolor: `${COLORS.danger}0d` } }}>
          Reverse
        </Button>
      )}
      {row.can_undo && (
        <Button size="small" variant="outlined" startIcon={<UndoIcon sx={{ fontSize: '0.95rem !important' }} />}
          onClick={(e) => { e.stopPropagation(); onUndo(row) }}
          sx={{ ...buttonSx, color: '#2563eb', borderColor: '#2563eb60', '&:hover': { borderColor: '#2563eb', bgcolor: '#2563eb0d' } }}>
          Undo
        </Button>
      )}
      {showDetails && (
        <Tooltip title="Open full timeline">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDetails(row) }}
            sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, color: COLORS.textSecondary }}>
            <OpenInNewIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default ClickActions
