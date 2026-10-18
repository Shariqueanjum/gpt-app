import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material'
import SectionCard from './SectionCard'
import PointsCell from './PointsCell'
import SwipeHint from './SwipeHint'
import { TableScroll, EmptyState } from '../AdminUiKit'

const COLS = [
  { label: 'Provider', align: 'left' },
  { label: 'Clicks', align: 'right' },
  { label: 'Not completed', align: 'right' },
  { label: 'Surveys completed', align: 'right' },
  { label: 'Points earned', align: 'left' },
  { label: 'Surveys reversed', align: 'right' },
  { label: 'Points reversed', align: 'left' },
  { label: 'Net points', align: 'left' },
]

/** Completed and reversed surveys, split by the client / offer wall they came from. */
const ProviderBreakdown = ({ providers, COLORS }) => {
  const head = { color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }
  const cell = { borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, fontSize: '0.84rem' }

  return (
    <SectionCard COLORS={COLORS} noPadding title="Surveys by provider"
      subtitle="How many surveys came from each client, and how many of them were reversed.">
      {providers.length === 0 ? (
        <EmptyState label="This user has no survey activity yet" COLORS={COLORS} />
      ) : (
        <>
        <SwipeHint COLORS={COLORS} />
        <TableScroll>
          <Table size="small" sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                {COLS.map((c) => (
                  <TableCell key={c.label} align={c.align} sx={head}>{c.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.offer_wall_id} hover>
                  <TableCell sx={{ ...cell, fontWeight: 700 }}>{p.name}</TableCell>
                  <TableCell align="right" sx={cell}>{p.clicks_total}</TableCell>
                  <TableCell align="right" sx={{ ...cell, color: p.clicks_not_completed ? '#f59e0b' : COLORS.textMuted }}>{p.clicks_not_completed}</TableCell>
                  <TableCell align="right" sx={{ ...cell, fontWeight: 700 }}>{p.completed_count}</TableCell>
                  <TableCell sx={cell}><PointsCell points={p.completed_points} COLORS={COLORS} color="#10b981" /></TableCell>
                  <TableCell align="right" sx={{ ...cell, fontWeight: 700, color: p.reversed_count ? '#ef4444' : COLORS.textMuted }}>{p.reversed_count}</TableCell>
                  <TableCell sx={cell}><PointsCell points={p.reversed_points} COLORS={COLORS} color={p.reversed_points ? '#ef4444' : undefined} muted={!p.reversed_points} /></TableCell>
                  <TableCell sx={cell}><PointsCell points={p.net_points} COLORS={COLORS} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
        </>
      )}
      <Box sx={{ px: { xs: 1.75, sm: 2.25 }, py: 1.2 }}>
        <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
          "Not completed" = clicked but quota full, terminated or failed. Reversals that were undone are not counted.
        </Typography>
      </Box>
    </SectionCard>
  )
}

export default ProviderBreakdown
