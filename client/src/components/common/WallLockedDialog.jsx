import { Dialog, DialogContent, DialogActions, Box, Typography, Button } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { useNavigate } from 'react-router-dom'

// Shown when a user taps an offer wall that is still locked for their level
// (e.g. CPX Research: complete 5 surveys / reach Level 2).
const WallLockedDialog = ({ wall, onClose, COLORS }) => {
  const navigate = useNavigate()
  const open = Boolean(wall)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4, mx: 2, width: 'calc(100% - 32px)', bgcolor: COLORS?.cardBg } } }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 1, px: { xs: 3, sm: 4 } }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: `${COLORS?.primary || '#5312bc'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
          <LockIcon sx={{ fontSize: 28, color: COLORS?.primary || '#5312bc' }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: COLORS?.textPrimary, mb: 1 }}>
          {wall?.name} is locked
        </Typography>
        <Typography sx={{ fontSize: '0.92rem', color: COLORS?.textSecondary, lineHeight: 1.6 }}>
          Complete {wall?.required_surveys} surveys or upgrade to Level {wall?.min_level} to unlock this partner.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1, px: { xs: 3, sm: 4 }, pb: 3, pt: 2, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => { onClose(); navigate('/progress') }}
          sx={{ bgcolor: COLORS?.primary || '#5312bc', color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 2.5, py: 1, boxShadow: 'none', '&:hover': { bgcolor: COLORS?.primaryDark || '#4310a0', boxShadow: 'none' } }}
        >
          See my progress
        </Button>
        <Button
          fullWidth
          onClick={onClose}
          sx={{ color: COLORS?.textSecondary, fontWeight: 600, textTransform: 'none', borderRadius: 2.5, py: 1 }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WallLockedDialog
