import { Box, Typography } from '@mui/material'
import SectionCard from '../userDetail/SectionCard'
import PointsCell from '../userDetail/PointsCell'
import { TONES, formatPercent, plural } from './revenueFormat'
import { formatPoints } from '../userDetail/userDetailFormat'

const Row = ({ sign, label, hint, value, color, max, strong, COLORS, signColor }) => {
  const width = max > 0 ? Math.min(Math.max((Math.abs(value) / max) * 100, value !== 0 ? 1.5 : 0), 100) : 0
  return (
    <Box sx={{
      py: 1.1, px: strong ? 1.25 : 0, my: strong ? 0.5 : 0, borderRadius: strong ? 2 : 0,
      bgcolor: strong ? `${color}10` : 'transparent', borderBottom: strong ? 'none' : `1px dashed ${COLORS.border}`,
      '&:last-of-type': { borderBottom: 'none' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Typography sx={{ width: 20, textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: signColor || COLORS.textMuted, flexShrink: 0 }}>{sign}</Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: strong ? '0.92rem' : '0.86rem', fontWeight: strong ? 800 : 600, color: COLORS.textPrimary, lineHeight: 1.3 }}>{label}</Typography>
            {hint && <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, lineHeight: 1.35 }}>{hint}</Typography>}
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0 }}><PointsCell points={value} COLORS={COLORS} align="right" color={color} size={strong ? 'md' : 'sm'} /></Box>
      </Box>
      <Box sx={{ ml: '32px', mt: 0.8, height: 5, borderRadius: 3, bgcolor: `${COLORS.border}`, overflow: 'hidden' }}>
        <Box sx={{ width: `${width}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
      </Box>
    </Box>
  )
}

/**
 * The whole story in one list, top to bottom:
 * client value  -  paid to users  =  net revenue  -  losses & dilution  =  net profit
 */
const ProfitFlow = ({ totals, COLORS }) => {
  const t = totals
  const max = Math.max(t.client_value, 1)
  const inc = t.bonuses.included
  const finalValue = inc ? t.profit : t.profit_before_bonuses
  const finalColor = finalValue >= 0 ? TONES.profit : TONES.loss

  return (
    <SectionCard COLORS={COLORS} title="How the money flows"
      subtitle="Read from top to bottom. Bars show each amount compared with the actual survey value.">
      <Row COLORS={COLORS} sign="" label="Actual value of surveys" hint={`${plural(t.surveys, 'completed survey')}, what clients paid us`} value={t.client_value} color={TONES.client} max={max} />
      <Row COLORS={COLORS} sign="−" signColor={TONES.loss} label="Paid to users" hint="Value users received after our commission" value={t.user_value} color={TONES.muted} max={max} />
      <Row COLORS={COLORS} strong sign="=" label="Net revenue (our commission)" hint={`${formatPercent(t.effective_commission_rate)} of the actual value`} value={t.commission} color={TONES.revenue} max={max} />
      <Row COLORS={COLORS} sign="−" signColor={TONES.loss} label="Reversed surveys" hint={`${t.reversals.count} reversed, the commission we lost on ${t.reversals.count === 1 ? 'it' : 'them'}${t.reversals.late_count ? ` (${t.reversals.late_count} reversed after this period ended)` : ''}`} value={t.reversals.commission_lost} color={TONES.loss} max={max} />
      <Row COLORS={COLORS} sign="−" signColor={TONES.loss} label="Referral commission (net)"
        hint={`${formatPoints(t.referral.paid)} paid to referrers, ${formatPoints(t.referral.clawed_back)} taken back`} value={t.referral.net} color={TONES.referral} max={max} />
      {inc && (
        <>
          <Row COLORS={COLORS} sign="−" signColor={TONES.loss} label="Daily bonus" hint={`${plural(t.bonuses.daily.count, 'bonus', 'bonuses')} given`} value={t.bonuses.daily.points} color={TONES.bonus} max={max} />
          <Row COLORS={COLORS} sign="−" signColor={TONES.loss} label="Level-up rewards" hint={`${plural(t.bonuses.level_up.count, 'reward')} given`} value={t.bonuses.level_up.points} color={TONES.bonus} max={max} />
          {t.bonuses.other.points > 0 && (
            <Row COLORS={COLORS} sign="−" signColor={TONES.loss} label="Other bonuses & promos" hint={`${t.bonuses.other.count} given`} value={t.bonuses.other.points} color={TONES.bonus} max={max} />
          )}
        </>
      )}
      <Row COLORS={COLORS} strong sign="=" label={inc ? 'Net profit' : 'Profit before bonuses'}
        hint={inc ? `${formatPercent(t.margin_on_client_value)} of the actual value` : 'Bonuses are not subtracted for a single client'} value={finalValue} color={finalColor} max={max} />
    </SectionCard>
  )
}

export default ProfitFlow
