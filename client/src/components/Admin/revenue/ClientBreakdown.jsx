import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material'
import SectionCard from '../userDetail/SectionCard'
import PointsCell from '../userDetail/PointsCell'
import SwipeHint from '../userDetail/SwipeHint'
import { TableScroll, EmptyState } from '../AdminUiKit'
import { TONES, formatPercent } from './revenueFormat'

const COLS = [
  { label: 'Client', align: 'left' },
  { label: 'Surveys', align: 'right' },
  { label: 'Actual value', align: 'left' },
  { label: 'Paid to users', align: 'left' },
  { label: 'Net revenue', align: 'left' },
  { label: 'Reversed (lost)', align: 'left' },
  { label: 'Referral (net)', align: 'left' },
  { label: 'Profit*', align: 'left' },
  { label: 'Margin', align: 'right' },
]

/** One row per client (Toluna, CPX, ...) with the same columns as the flow above, plus a total row. */
const ClientBreakdown = ({ rows, totals, COLORS }) => {
  const head = { color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }
  const cell = { borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, fontSize: '0.84rem', verticalAlign: 'middle' }
  const profitColor = (v) => (v >= 0 ? TONES.profit : TONES.loss)

  return (
    <SectionCard COLORS={COLORS} noPadding title="Revenue by client"
      subtitle="Each client's own numbers. *Profit here is before daily bonuses and level-up rewards, because those belong to the whole platform.">
      {rows.length === 0 ? (
        <EmptyState label="No survey activity in this period" COLORS={COLORS} />
      ) : (
        <>
          <SwipeHint COLORS={COLORS} />
          <TableScroll>
            <Table size="small" sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>{COLS.map((c) => <TableCell key={c.label} align={c.align} sx={head}>{c.label}</TableCell>)}</TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.offer_wall_id} hover>
                    <TableCell sx={cell}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>{r.name}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>{formatPercent(r.effective_commission_rate)} commission</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ ...cell, fontWeight: 700 }}>{r.surveys}</TableCell>
                    <TableCell sx={cell}><PointsCell points={r.client_value} COLORS={COLORS} color={TONES.client} /></TableCell>
                    <TableCell sx={cell}><PointsCell points={r.user_value} COLORS={COLORS} muted /></TableCell>
                    <TableCell sx={cell}><PointsCell points={r.commission} COLORS={COLORS} color={TONES.revenue} /></TableCell>
                    <TableCell sx={cell}>
                      <PointsCell points={r.commission_lost} COLORS={COLORS} color={r.commission_lost ? TONES.loss : undefined} muted={!r.commission_lost} />
                      {r.reversed_count > 0 && <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted }}>{r.reversed_count} reversed</Typography>}
                    </TableCell>
                    <TableCell sx={cell}>
                      <PointsCell points={r.referral_net} COLORS={COLORS} color={r.referral_net ? TONES.referral : undefined} muted={!r.referral_net} />
                    </TableCell>
                    <TableCell sx={cell}><PointsCell points={r.profit_before_bonuses} COLORS={COLORS} color={profitColor(r.profit_before_bonuses)} /></TableCell>
                    <TableCell align="right" sx={{ ...cell, fontWeight: 700, color: profitColor(r.margin_on_client_value) }}>{formatPercent(r.margin_on_client_value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: `${COLORS.primary}0a` }}>
                  <TableCell sx={{ ...cell, fontWeight: 800 }}>All clients</TableCell>
                  <TableCell align="right" sx={{ ...cell, fontWeight: 800 }}>{totals.surveys}</TableCell>
                  <TableCell sx={cell}><PointsCell points={totals.client_value} COLORS={COLORS} color={TONES.client} /></TableCell>
                  <TableCell sx={cell}><PointsCell points={totals.user_value} COLORS={COLORS} muted /></TableCell>
                  <TableCell sx={cell}><PointsCell points={totals.commission} COLORS={COLORS} color={TONES.revenue} /></TableCell>
                  <TableCell sx={cell}><PointsCell points={totals.reversals.commission_lost} COLORS={COLORS} color={totals.reversals.commission_lost ? TONES.loss : undefined} muted={!totals.reversals.commission_lost} /></TableCell>
                  <TableCell sx={cell}><PointsCell points={totals.referral.net} COLORS={COLORS} color={totals.referral.net ? TONES.referral : undefined} muted={!totals.referral.net} /></TableCell>
                  <TableCell sx={cell}><PointsCell points={totals.profit_before_bonuses} COLORS={COLORS} color={profitColor(totals.profit_before_bonuses)} /></TableCell>
                  <TableCell align="right" sx={{ ...cell, fontWeight: 800 }}>
                    {formatPercent(totals.client_value > 0 ? (totals.profit_before_bonuses / totals.client_value) * 100 : 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableScroll>
          <Box sx={{ px: { xs: 1.75, sm: 2.25 }, py: 1.2 }}>
            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
              Actual value = what the client paid. Net revenue = our commission. Profit = net revenue − commission lost on reversed surveys − net referral commission.
            </Typography>
          </Box>
        </>
      )}
    </SectionCard>
  )
}

export default ClientBreakdown
