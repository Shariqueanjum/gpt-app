import { Box, Typography } from '@mui/material'
import SectionCard from '../userDetail/SectionCard'
import PointsCell from '../userDetail/PointsCell'
import { TONES, plural } from './revenueFormat'

const Tile = ({ label, hint, points, color, COLORS }) => (
  <Box sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.bg, borderTop: `3px solid ${color}`, minWidth: 0 }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.textMuted, mb: 0.5 }}>{label}</Typography>
    <PointsCell points={points} COLORS={COLORS} size="lg" color={color} />
    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 0.5, lineHeight: 1.35 }}>{hint}</Typography>
  </Box>
)

/** Cash view: what actually left the business this period, and what we still owe users right now. */
const CashPosition = ({ totals, liability, COLORS }) => {
  if (!totals.cash_paid_out || !liability) return null
  const owed = liability.available + liability.locked
  return (
    <SectionCard COLORS={COLORS} title="Cash & what we owe"
      subtitle="Revenue is what clients owe us. This is the real money going to users.">
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}>
        <Tile COLORS={COLORS} color={TONES.profit} label="Paid out in this period" points={totals.cash_paid_out.points}
          hint={`${plural(totals.cash_paid_out.count, 'withdrawal')} marked paid`} />
        <Tile COLORS={COLORS} color={TONES.bonus} label="Pending withdrawals (now)" points={liability.pending_withdrawals.points}
          hint={`${plural(liability.pending_withdrawals.count, 'request')} waiting to be paid`} />
        <Tile COLORS={COLORS} color={TONES.loss} label="Owed to users (now)" points={owed}
          hint={`Available + locked balances of all users (${liability.locked > 0 ? 'includes locked points' : 'no locked points'})`} />
      </Box>
    </SectionCard>
  )
}

export default CashPosition
