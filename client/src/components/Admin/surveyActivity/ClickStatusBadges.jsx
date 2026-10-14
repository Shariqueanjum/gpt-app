import { Box, Tooltip } from '@mui/material'
import { StatusPill } from '../AdminUiKit'
import { getStatusMeta } from './surveyActivityConstants'

const MiniTag = ({ label, color, title }) => (
  <Tooltip title={title} placement="top">
    <Box sx={{
      px: 0.9, py: 0.2, borderRadius: 4, fontSize: '0.66rem', fontWeight: 700,
      color, bgcolor: `${color}15`, whiteSpace: 'nowrap', cursor: 'default',
    }}>
      {label}
    </Box>
  </Tooltip>
)

// Status pill plus the small extra facts an admin needs at a glance
const ClickStatusBadges = ({ row }) => {
  const meta = getStatusMeta(row.status)

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      <StatusPill label={meta.label} color={meta.color} />
      {row.status === 'completed' && row.funds_locked && (
        <MiniTag label="Funds locked" color="#f59e0b" title="Payout is held in the user's locked balance" />
      )}
      {row.was_undone && (
        <MiniTag label="Restored" color="#2563eb" title="Reversed earlier, then undone. A click can only be reversed once." />
      )}
    </Box>
  )
}

export default ClickStatusBadges
