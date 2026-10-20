import { Box, Typography, Alert } from '@mui/material'
import SectionCard from '../userDetail/SectionCard'
import PointsCell from '../userDetail/PointsCell'
import { TONES, plural } from './revenueFormat'
import { formatPoints } from '../userDetail/userDetailFormat'

const Line = ({ label, sub, points, color, COLORS, bold }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 0.9, borderBottom: `1px dashed ${COLORS.border}`, '&:last-of-type': { borderBottom: 'none' } }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.84rem', color: COLORS.textPrimary, fontWeight: bold ? 800 : 600 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>{sub}</Typography>}
    </Box>
    <PointsCell points={points} COLORS={COLORS} align="right" size="sm" color={color} />
  </Box>
)

/**
 * Where the commission goes: referrals, bonuses & rewards, reversals.
 * Each card explains one deduction from net revenue.
 */
const DilutionPanels = ({ totals, topReferrers, COLORS }) => {
  const t = totals
  const bonusesIncluded = t.bonuses.included

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' } }}>
        <SectionCard COLORS={COLORS} title="Referral dilution" subtitle="Commission paid to people who referred users.">
          <Line COLORS={COLORS} label="Paid to referrers" sub={`on ${plural(t.referral.referred_surveys, 'referred survey')}`} points={t.referral.paid} color={TONES.referral} />
          <Line COLORS={COLORS} label="Taken back" sub={`${plural(t.referral.clawback_count, 'commission')} clawed back by reversals`} points={-t.referral.clawed_back} color={TONES.profit} />
          <Line COLORS={COLORS} bold label="Net referral cost" points={t.referral.net} color={TONES.loss} />
          {topReferrers.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.textMuted, mb: 0.5 }}>Top referrers</Typography>
              {topReferrers.map((r) => (
                <Box key={r.user_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 600, color: COLORS.textPrimary }}>{r.username}
                    <Box component="span" sx={{ color: COLORS.textMuted, fontWeight: 500 }}> · {r.surveys} surveys</Box>
                  </Typography>
                  <PointsCell points={r.earned} COLORS={COLORS} align="right" size="sm" />
                </Box>
              ))}
            </Box>
          )}
        </SectionCard>

        <SectionCard COLORS={COLORS} title="Bonuses & rewards" subtitle="Points we give users on top of surveys.">
          {bonusesIncluded ? (
            <>
              <Line COLORS={COLORS} label="Daily bonus" sub={`${plural(t.bonuses.daily.count, 'bonus', 'bonuses')} given`} points={t.bonuses.daily.points} color={TONES.bonus} />
              <Line COLORS={COLORS} label="Level-up rewards" sub={`${plural(t.bonuses.level_up.count, 'reward')} given`} points={t.bonuses.level_up.points} color={TONES.bonus} />
              <Line COLORS={COLORS} label="Other bonuses & promos" sub={`${t.bonuses.other.count} given`} points={t.bonuses.other.points} color={TONES.bonus} />
              <Line COLORS={COLORS} bold label="Total bonuses" points={t.bonuses.total} color={TONES.loss} />
            </>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
              Bonuses belong to the whole platform, not to one client. Choose "All clients" to see them.
            </Alert>
          )}
        </SectionCard>

        <SectionCard COLORS={COLORS} title="Reversed surveys" subtitle="Counted in the month of the original survey (undone reversals are not counted).">
          <Line COLORS={COLORS} label="Client value taken back" sub={`${plural(t.reversals.count, 'survey')} reversed, clawed back from us`} points={t.reversals.client_value} color={TONES.client} />
          <Line COLORS={COLORS} label="Recovered from users" sub="Deducted from the user's balance" points={-t.reversals.user_value} color={TONES.profit} />
          <Line COLORS={COLORS} bold label="Commission lost" sub="This is what reduces profit" points={t.reversals.commission_lost} color={TONES.loss} />
          {t.reversals.late_commission_lost > 0 && (
            <Line COLORS={COLORS} label="Of which reversed later"
              sub={`${plural(t.reversals.late_count, 'survey')} reversed after this period ended`} points={t.reversals.late_commission_lost} color={TONES.bonus} />
          )}
        </SectionCard>
      </Box>

      {bonusesIncluded && t.adjustments && (t.adjustments.credits > 0 || t.adjustments.debits > 0) && (
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
          Manual admin adjustments in this period: {formatPoints(t.adjustments.credits)} added and {formatPoints(t.adjustments.debits)} taken.
          They are shown here for information and are not part of the profit above.
        </Alert>
      )}
    </Box>
  )
}

export default DilutionPanels
