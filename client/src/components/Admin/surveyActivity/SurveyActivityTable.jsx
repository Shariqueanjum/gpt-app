import { Box, Typography, Avatar, Skeleton } from '@mui/material'
import { TableScroll } from '../AdminUiKit'
import CopyText from '../CopyText'
import { formatUTCDateTime } from '../../../utils/formatTime'
import ClickStatusBadges from './ClickStatusBadges'
import ClickActions from './ClickActions'
import WallTypePill from './WallTypePill'
import { formatPoints, formatDollar } from './surveyActivityConstants'

const HEADERS = ['Created', 'User', 'Offer wall', 'Our ID', 'External ID', 'Status', 'User points', 'Postbacks', '']

const Th = ({ children, COLORS }) => (
  <Box component="th" sx={{
    textAlign: 'left', px: 2, py: 1.4, fontSize: '0.72rem', fontWeight: 700,
    color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
  }}>{children}</Box>
)

const Td = ({ children, sx, ...rest }) => (
  <Box component="td" sx={{ px: 2, py: 1.4, verticalAlign: 'middle', ...sx }} {...rest}>{children}</Box>
)

// Points are only meaningful once a survey paid out (or was paid then reversed)
const PointsCell = ({ row, COLORS }) => {
  if (row.status !== 'completed' && row.status !== 'reversed') {
    return <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>—</Typography>
  }
  const reversed = row.status === 'reversed'
  return (
    <Box sx={{ whiteSpace: 'nowrap' }}>
      <Typography sx={{
        fontSize: '0.86rem', fontWeight: 800,
        color: reversed ? COLORS.danger : COLORS.textPrimary,
        textDecoration: reversed ? 'line-through' : 'none',
      }}>
        {formatPoints(row.cpa_user)}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>{formatDollar(row.cpa_user)}</Typography>
    </Box>
  )
}

const hasBeenUpdated = (row) =>
  row.updated_at && row.created_at && Math.abs(new Date(row.updated_at) - new Date(row.created_at)) > 1500

const SurveyActivityTable = ({ rows, loading, COLORS, onReverse, onUndo, onDetails }) => (
  <TableScroll>
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 1180 }}>
      <Box component="thead">
        <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
          {HEADERS.map((h) => <Th key={h || 'actions'} COLORS={COLORS}>{h}</Th>)}
        </Box>
      </Box>
      <Box component="tbody">
        {loading
          ? [...Array(8)].map((_, i) => (
            <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <Td colSpan={HEADERS.length}><Skeleton variant="rounded" height={34} /></Td>
            </Box>
          ))
          : rows.map((row) => (
            <Box component="tr" key={row.id} onClick={() => onDetails(row)} sx={{
              borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer',
              '&:hover': { bgcolor: `${COLORS.primary}05` },
            }}>
              <Td sx={{ whiteSpace: 'nowrap' }}>
                <Typography sx={{ fontSize: '0.78rem', color: COLORS.textPrimary }}>{formatUTCDateTime(row.created_at)}</Typography>
                {hasBeenUpdated(row) && (
                  <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted }}>
                    updated {formatUTCDateTime(row.updated_at).slice(5)}
                  </Typography>
                )}
              </Td>
              <Td>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', bgcolor: COLORS.primary }}>
                    {row.username?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: '0.83rem', fontWeight: 700, color: COLORS.textPrimary }}>{row.username}</Typography>
                    <Typography noWrap sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>{row.user_public_id}</Typography>
                  </Box>
                </Box>
              </Td>
              <Td>
                <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textPrimary, maxWidth: 140 }}>
                  {row.offer_wall_name || '—'}
                </Typography>
                <WallTypePill type={row.offer_wall_type || row.integration_type} />
              </Td>
              <Td>
                <CopyText value={row.transaction_id} COLORS={COLORS} maxWidth={150} />
                {row.is_auto_created && (
                  <Typography sx={{ fontSize: '0.66rem', color: '#f59e0b', fontWeight: 700 }}>auto-created from postback</Typography>
                )}
              </Td>
              <Td><CopyText value={row.external_transaction_id} COLORS={COLORS} maxWidth={150} /></Td>
              <Td><ClickStatusBadges row={row} /></Td>
              <Td><PointsCell row={row} COLORS={COLORS} /></Td>
              <Td sx={{ whiteSpace: 'nowrap' }}>
                {row.postback_count > 0 ? (
                  <>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.textPrimary }}>{row.postback_count}</Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted }}>
                      last {formatUTCDateTime(row.last_postback_at).slice(5, 16)}
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>—</Typography>
                )}
              </Td>
              <Td sx={{ pr: 1.5 }}>
                <ClickActions row={row} COLORS={COLORS} onReverse={onReverse} onUndo={onUndo} onDetails={onDetails} />
              </Td>
            </Box>
          ))}
      </Box>
    </Box>
  </TableScroll>
)

export default SurveyActivityTable
