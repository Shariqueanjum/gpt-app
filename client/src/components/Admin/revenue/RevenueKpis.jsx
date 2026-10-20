import { Box, Typography } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import RemoveIcon from '@mui/icons-material/Remove'
import PointsCell from '../userDetail/PointsCell'
import { TONES, formatPercent, changeVs, plural } from './revenueFormat'

const Delta = ({ current, previous, previousLabel, COLORS }) => {
  if (previous === null || previous === undefined) return null
  const { pct, direction } = changeVs(current, previous)
  const color = direction === 'up' ? TONES.profit : direction === 'down' ? TONES.loss : COLORS.textMuted
  const Icon = direction === 'up' ? ArrowUpwardIcon : direction === 'down' ? ArrowDownwardIcon : RemoveIcon
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color }}>
      <Icon sx={{ fontSize: 14 }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color }}>
        {pct === null ? (direction === 'flat' ? 'No change' : 'New') : `${Math.abs(pct).toFixed(1)}%`}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>vs {previousLabel}</Typography>
    </Box>
  )
}

const Kpi = ({ label, hint, points, color, COLORS, footer, hero }) => (
  <Box sx={{
    p: { xs: 1.75, sm: 2 }, borderRadius: 3, border: `1px solid ${hero ? color : COLORS.border}`, bgcolor: hero ? `${color}0d` : COLORS.cardBg,
    borderTop: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 0.7, minWidth: 0,
  }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.textMuted }}>{label}</Typography>
    <PointsCell points={points} COLORS={COLORS} size="lg" color={color} />
    {hint && <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, lineHeight: 1.35 }}>{hint}</Typography>}
    {footer}
  </Box>
)

/** Four headline numbers for the selected period. */
const RevenueKpis = ({ totals, previous, COLORS }) => {
  const dilution = totals.reversals.commission_lost + totals.referral.net + totals.bonuses.total
  const profitLabel = totals.bonuses.included ? 'Net profit' : 'Profit before bonuses'
  const prevProfit = previous ? (totals.bonuses.included ? previous.totals.profit : previous.totals.profit_before_bonuses) : null
  const profit = totals.bonuses.included ? totals.profit : totals.profit_before_bonuses

  return (
    <Box sx={{ display: 'grid', gap: { xs: 1.25, sm: 1.5 }, gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, minmax(0, 1fr))' } }}>
      <Kpi COLORS={COLORS} label="Actual survey value" color={TONES.client} points={totals.client_value}
        hint={`${plural(totals.surveys, 'survey')} paid by clients`}
        footer={<Delta current={totals.client_value} previous={previous?.totals.client_value} previousLabel={previous?.label} COLORS={COLORS} />} />
      <Kpi COLORS={COLORS} label="Net revenue" color={TONES.revenue} points={totals.commission}
        hint={`Our commission · ${formatPercent(totals.effective_commission_rate)} of client value`}
        footer={<Delta current={totals.commission} previous={previous?.totals.commission} previousLabel={previous?.label} COLORS={COLORS} />} />
      <Kpi COLORS={COLORS} label="Given away (dilution)" color={TONES.loss} points={dilution}
        hint="Reversed surveys + referral commission + bonuses"
        footer={<Delta current={dilution} previous={previous ? previous.totals.reversals.commission_lost + previous.totals.referral.net + previous.totals.bonuses.total : null} previousLabel={previous?.label} COLORS={COLORS} />} />
      <Kpi hero COLORS={COLORS} label={profitLabel} color={profit >= 0 ? TONES.profit : TONES.loss} points={profit}
        hint={`${formatPercent(totals.bonuses.included ? totals.margin_on_client_value : (totals.client_value > 0 ? (totals.profit_before_bonuses / totals.client_value) * 100 : 0))} of client value · keeps ${formatPercent(totals.commission > 0 ? (profit / totals.commission) * 100 : 0)} of net revenue`}
        footer={<Delta current={profit} previous={prevProfit} previousLabel={previous?.label} COLORS={COLORS} />} />
    </Box>
  )
}

export default RevenueKpis
