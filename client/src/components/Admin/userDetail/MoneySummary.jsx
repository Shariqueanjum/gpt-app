import { Box, Typography, Button, Tooltip } from '@mui/material'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import SectionCard from './SectionCard'
import PointsCell from './PointsCell'
import { formatPoints, formatDollar } from './userDetailFormat'

const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#2563eb'

// One money tile: label, big points + small dollars, optional hint and action button
const Tile = ({ label, points, color, hint, action, COLORS, signed }) => (
  <Box sx={{
    p: 1.75, borderRadius: 2.5, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.bg,
    borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 0.6, minWidth: 0,
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.textMuted }}>
        {label}
      </Typography>
      {action}
    </Box>
    <PointsCell points={points} COLORS={COLORS} size="lg" color={color} signed={signed} />
    {hint && <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, lineHeight: 1.35 }}>{hint}</Typography>}
  </Box>
)

const Line = ({ label, points, sub, color, COLORS }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 0.9, borderBottom: `1px dashed ${COLORS.border}`, '&:last-of-type': { borderBottom: 'none' } }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.84rem', color: COLORS.textPrimary, fontWeight: 600 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>{sub}</Typography>}
    </Box>
    <PointsCell points={points} COLORS={COLORS} align="right" size="sm" color={color} />
  </Box>
)

const Operator = ({ children, COLORS }) => (
  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: COLORS.textMuted, alignSelf: 'center', px: 0.5 }}>{children}</Typography>
)

/**
 * The money story, top to bottom:
 *  1. Earned − Reversed = Net
 *  2. Where the money is now (available / locked / pending / withdrawn)
 *  3. Breakdown lines + accounting check
 */
const MoneySummary = ({ overview, COLORS, onOpenLocked }) => {
  const { balances, earnings, reversals, net_amount, withdrawals, check, surveys } = overview
  const balanced = Math.abs(check.difference) < 0.01

  const unlockButton = (
    <Tooltip title="Move locked points to the main balance so the user can withdraw them (you can undo it)">
      <Button size="small" onClick={onOpenLocked} startIcon={<LockOpenOutlinedIcon sx={{ fontSize: '15px !important' }} />}
        sx={{
          textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', py: 0.2, px: 1, minWidth: 0, borderRadius: 5,
          color: AMBER, bgcolor: `${AMBER}18`, '&:hover': { bgcolor: `${AMBER}30` },
        }}>
        Unlock
      </Button>
    </Tooltip>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. Earned - Reversed = Net */}
      <SectionCard COLORS={COLORS} title="Earnings summary" subtitle="Net amount = everything the user earned minus everything that was reversed.">
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 170px' }}><Tile COLORS={COLORS} label="Total earned" points={earnings.total} color={GREEN} hint="Surveys + referral commission + bonuses" /></Box>
          <Operator COLORS={COLORS}>−</Operator>
          <Box sx={{ flex: '1 1 170px' }}><Tile COLORS={COLORS} label="Total reversed" points={reversals.total} color={RED} hint="Survey and commission reversals still in force" /></Box>
          <Operator COLORS={COLORS}>=</Operator>
          <Box sx={{ flex: '1 1 170px' }}><Tile COLORS={COLORS} label="Net amount" points={net_amount} color={COLORS.primaryLight} hint="What the user really earned" /></Box>
        </Box>
      </SectionCard>

      {/* 2. Where the money is now */}
      <SectionCard COLORS={COLORS} title="Where the money is now" subtitle="Only the available balance can be withdrawn.">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.25 }}>
          <Tile COLORS={COLORS} label="Available" points={balances.available} color={GREEN} hint="Ready to withdraw" />
          <Tile COLORS={COLORS} label="Locked" points={balances.locked} color={AMBER} hint="Big surveys held back" action={unlockButton} />
          <Tile COLORS={COLORS} label="Withdrawal pending" points={balances.pending_withdrawal} color={BLUE}
            hint={`${withdrawals.pending.count + withdrawals.processing.count} request(s) waiting`} />
          <Tile COLORS={COLORS} label="Withdrawn (paid)" points={withdrawals.total_paid} color={COLORS.primaryLight}
            hint={`${withdrawals.paid.count} payment(s) received`} />
          {balances.denied !== 0 && <Tile COLORS={COLORS} label="Denied" points={balances.denied} color={RED} hint="Points the user was denied" />}
        </Box>
      </SectionCard>

      {/* 3. Breakdown */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <SectionCard COLORS={COLORS} title="Earned from">
          <Line COLORS={COLORS} label="Surveys" sub={`${surveys.completed_count} credited`} points={earnings.surveys} color={GREEN} />
          <Line COLORS={COLORS} label="Referral commission" sub="From people this user referred" points={earnings.referrals} color={GREEN} />
          <Line COLORS={COLORS} label="Bonuses" sub="Daily bonus, level-up and other bonuses" points={earnings.bonuses} color={GREEN} />
          {earnings.admin_adjustments !== 0 && (
            <Line COLORS={COLORS} label="Admin adjustments" sub="Manual + / − by an admin (not part of net)" points={earnings.admin_adjustments}
              color={earnings.admin_adjustments > 0 ? GREEN : RED} />
          )}
        </SectionCard>
        <SectionCard COLORS={COLORS} title="Reversed">
          <Line COLORS={COLORS} label="Survey reversals" sub={`${reversals.survey_count} survey(s) taken back`} points={reversals.survey_points} color={RED} />
          <Line COLORS={COLORS} label="Referral commission reversed" sub={`${reversals.referral_count} commission(s) taken back`} points={reversals.referral_points} color={RED} />
        </SectionCard>
      </Box>

      {/* Accounting check */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, borderRadius: 2.5,
        bgcolor: balanced ? `${GREEN}10` : `${AMBER}14`, border: `1px solid ${balanced ? GREEN : AMBER}40`,
      }}>
        {balanced
          ? <CheckCircleOutlineIcon sx={{ color: GREEN, fontSize: 20, mt: 0.1 }} />
          : <WarningAmberOutlinedIcon sx={{ color: AMBER, fontSize: 20, mt: 0.1 }} />}
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: COLORS.textPrimary }}>
            {balanced ? 'Accounts are balanced' : `Accounts differ by ${formatPoints(Math.abs(check.difference))} (${formatDollar(Math.abs(check.difference))})`}
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted, mt: 0.2 }}>
            Available + locked + pending + paid = {formatPoints(check.actual_total)}. Net {earnings.admin_adjustments !== 0 ? '+ adjustments ' : ''}= {formatPoints(check.expected_total)}.
            {!balanced && ' A difference usually means an older manual change or a reversal fix that was done directly in the database.'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default MoneySummary
