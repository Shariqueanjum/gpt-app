import { Box, Typography, Avatar } from '@mui/material'
import CopyText from '../CopyText'
import { formatUTCDateTime } from '../../../utils/formatTime'
import ClickStatusBadges from './ClickStatusBadges'
import ClickActions from './ClickActions'
import WallTypePill from './WallTypePill'
import { formatPoints, formatDollar } from './surveyActivityConstants'

const Field = ({ label, children, COLORS }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </Typography>
    {children}
  </Box>
)

// Phone / small-tablet version of one table row
const SurveyClickCard = ({ row, COLORS, onReverse, onUndo, onDetails }) => {
  const paid = row.status === 'completed' || row.status === 'reversed'
  const reversed = row.status === 'reversed'

  return (
    <Box onClick={() => onDetails(row)} sx={{
      p: 1.8, borderRadius: 3, cursor: 'pointer', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
      display: 'flex', flexDirection: 'column', gap: 1.4,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', bgcolor: COLORS.primary }}>
            {row.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.86rem', fontWeight: 700, color: COLORS.textPrimary }}>{row.username}</Typography>
            <Typography noWrap sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
              {row.offer_wall_name || '—'}
            </Typography>
          </Box>
        </Box>
        <WallTypePill type={row.offer_wall_type || row.integration_type} />
      </Box>

      <ClickStatusBadges row={row} />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.4 }}>
        <Field label="Our ID" COLORS={COLORS}>
          <CopyText value={row.transaction_id} COLORS={COLORS} maxWidth={140} />
        </Field>
        <Field label="External ID" COLORS={COLORS}>
          <CopyText value={row.external_transaction_id} COLORS={COLORS} maxWidth={140} />
        </Field>
        <Field label="User points" COLORS={COLORS}>
          {paid ? (
            <Typography sx={{
              fontSize: '0.84rem', fontWeight: 800, color: reversed ? COLORS.danger : COLORS.textPrimary,
              textDecoration: reversed ? 'line-through' : 'none',
            }}>
              {formatPoints(row.cpa_user)} <Box component="span" sx={{ fontWeight: 500, color: COLORS.textMuted, fontSize: '0.7rem' }}>({formatDollar(row.cpa_user)})</Box>
            </Typography>
          ) : <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>—</Typography>}
        </Field>
        <Field label="Created (UTC)" COLORS={COLORS}>
          <Typography sx={{ fontSize: '0.76rem', color: COLORS.textPrimary }}>{formatUTCDateTime(row.created_at)}</Typography>
        </Field>
      </Box>

      {(row.can_reverse || row.can_undo) && (
        <ClickActions row={row} COLORS={COLORS} onReverse={onReverse} onUndo={onUndo} onDetails={onDetails} showDetails={false} fullWidth />
      )}
    </Box>
  )
}

export default SurveyClickCard
