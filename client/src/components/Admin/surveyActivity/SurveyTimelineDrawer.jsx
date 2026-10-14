import { Box, Drawer, IconButton, Typography, CircularProgress, Button, useMediaQuery, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import { ErrorState } from '../AdminUiKit'
import useSurveyClickDetail from '../../../hooks/useSurveyClickDetail'
import ClickStatusBadges from './ClickStatusBadges'
import ClickActions from './ClickActions'
import ClickSummary from './ClickSummary'
import MoneyTrail from './MoneyTrail'
import TrafficTimeline from './TrafficTimeline'

const SectionTitle = ({ children, count, COLORS }) => (
  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', mt: 3, mb: 1.2 }}>
    {children}{count != null ? ` (${count})` : ''}
  </Typography>
)

// Slide-over with the complete story of one click: summary, money trail and
// every request/response. Full-screen on phones.
const SurveyTimelineDrawer = ({ clickId, onClose, onReverse, onUndo, refreshKey, COLORS }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const open = !!clickId

  // refreshKey changes after an action so the drawer re-reads the updated click
  const { detail, loading, error, refresh } = useSurveyClickDetail(clickId ? `${clickId}` : null, refreshKey)
  const click = detail?.click

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 560, md: 640 }, bgcolor: COLORS.bg, maxWidth: '100%' } } }}>
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 2, bgcolor: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`,
        px: { xs: 2, sm: 2.5 }, py: 1.6,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: COLORS.textPrimary }}>Survey timeline</Typography>
            {click && <Typography noWrap sx={{ fontSize: '0.74rem', color: COLORS.textMuted }}>{click.username} · {click.offer_wall_name}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={refresh} disabled={loading}><RefreshIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
          </Box>
        </Box>
        {click && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.2, mt: 1.2 }}>
            <ClickStatusBadges row={click} />
            <ClickActions row={click} COLORS={COLORS} onReverse={onReverse} onUndo={onUndo} showDetails={false} fullWidth={isMobile} />
          </Box>
        )}
      </Box>

      <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 4, pt: 2 }}>
        {loading && !detail && (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}><CircularProgress size={28} /></Box>
        )}
        {error && <ErrorState label={error} onRetry={refresh} COLORS={COLORS} />}
        {detail && (
          <>
            <ClickSummary click={detail.click} COLORS={COLORS} />
            <SectionTitle COLORS={COLORS} count={detail.money.length}>Money trail</SectionTitle>
            <MoneyTrail money={detail.money} COLORS={COLORS} />
            <SectionTitle COLORS={COLORS} count={detail.traffic.length}>Traffic timeline</SectionTitle>
            <TrafficTimeline traffic={detail.traffic} COLORS={COLORS} />
            {detail.traffic.length >= 200 && (
              <Button disabled sx={{ mt: 1, textTransform: 'none' }}>Showing the first 200 events</Button>
            )}
          </>
        )}
      </Box>
    </Drawer>
  )
}

export default SurveyTimelineDrawer
