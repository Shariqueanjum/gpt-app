import { useState, useMemo } from 'react'
import { Box, Typography, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableHead, TableRow, Skeleton, useMediaQuery, useTheme } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../userDetail/SectionCard'
import PointsCell from '../userDetail/PointsCell'
import SwipeHint from '../userDetail/SwipeHint'
import { TableScroll, EmptyState, ErrorState } from '../AdminUiKit'
import { TONES, formatAxisDollar, parseBucketKey } from './revenueFormat'
import { formatPoints, formatDollar } from '../userDetail/userDetailFormat'

const SERIES = {
  profit: [{ key: 'profit', name: 'Net profit', color: TONES.profit }],
  compare: [
    { key: 'commission', name: 'Net revenue', color: TONES.revenue },
    { key: 'profit', name: 'Net profit', color: TONES.profit },
  ],
  value: [
    { key: 'client_value', name: 'Actual value', color: TONES.client },
    { key: 'commission', name: 'Net revenue', color: TONES.revenue },
  ],
}

const ChartTooltip = ({ active, payload, label, COLORS }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 2, p: 1.25, boxShadow: 3 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: COLORS.textPrimary, mb: 0.5 }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.dataKey} sx={{ fontSize: '0.76rem', color: p.color, fontWeight: 600 }}>
          {p.name}: {formatPoints(p.value)} <Box component="span" sx={{ color: COLORS.textMuted }}>({formatDollar(p.value)})</Box>
        </Typography>
      ))}
    </Box>
  )
}

/**
 * Chart + table of every month (or quarter / year) so trends are visible and
 * any period can be opened with one click.
 */
const TrendSection = ({ trend, loading, error, onRetry, granularity, selectedKey, onSelectPeriod, COLORS }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mode, setMode] = useState('compare')

  const title = granularity === 'year' ? 'Year by year' : granularity === 'quarter' ? 'Quarter by quarter' : 'Month by month'
  const series = SERIES[mode]
  const rows = useMemo(() => trend?.periods || [], [trend])
  const hasData = rows.some((p) => p.surveys > 0 || p.commission_lost > 0 || p.bonuses_total > 0)

  const select = (p) => onSelectPeriod?.(parseBucketKey(p.key))
  const head = { color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }
  const cell = { borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, fontSize: '0.82rem', verticalAlign: 'middle' }

  return (
    <SectionCard COLORS={COLORS} noPadding title={title} subtitle="Click a bar or a row to open that period."
      action={
        <ToggleButtonGroup exclusive size="small" value={mode} onChange={(e, v) => v && setMode(v)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', px: 1.25, py: 0.4, color: COLORS.textSecondary, borderColor: COLORS.border }, '& .Mui-selected': { bgcolor: `${COLORS.primary} !important`, color: '#fff !important' } }}>
          <ToggleButton value="compare">Revenue vs profit</ToggleButton>
          <ToggleButton value="profit">Profit</ToggleButton>
          <ToggleButton value="value">Client value</ToggleButton>
        </ToggleButtonGroup>
      }>
      {error ? (
        <ErrorState label={error} onRetry={onRetry} COLORS={COLORS} />
      ) : loading && !trend ? (
        <Box sx={{ p: 2 }}><Skeleton variant="rounded" height={isMobile ? 200 : 280} /></Box>
      ) : !hasData ? (
        <EmptyState label="No activity in this range yet" COLORS={COLORS} />
      ) : (
        <>
          <Box sx={{ px: { xs: 0.5, sm: 1.5 }, pt: 1, height: isMobile ? 230 : 300, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, left: isMobile ? -12 : 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: isMobile ? 10 : 12, fill: COLORS.textMuted }} axisLine={{ stroke: COLORS.border }} tickLine={false} interval={isMobile && rows.length > 6 ? 1 : 0} />
                <YAxis tickFormatter={formatAxisDollar} tick={{ fontSize: isMobile ? 10 : 12, fill: COLORS.textMuted }} axisLine={false} tickLine={false} width={isMobile ? 52 : 62} />
                <Tooltip content={<ChartTooltip COLORS={COLORS} />} cursor={{ fill: `${COLORS.primary}12` }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {series.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(data) => data?.payload && select(data.payload)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <SwipeHint COLORS={COLORS} />
          <TableScroll>
            <Table size="small" sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  {['Period', 'Surveys', 'Actual value', 'Net revenue', 'Reversed (lost)', 'Referral (net)', 'Bonuses', 'Net profit'].map((h, i) => (
                    <TableCell key={h} align={i === 1 ? 'right' : 'left'} sx={head}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((p) => {
                  const selected = p.key === selectedKey
                  return (
                    <TableRow key={p.key} hover onClick={() => select(p)} sx={{ cursor: 'pointer', bgcolor: selected ? `${COLORS.primary}12` : 'transparent' }}>
                      <TableCell sx={{ ...cell, fontWeight: 800 }}>{p.label}</TableCell>
                      <TableCell align="right" sx={cell}>{p.surveys}</TableCell>
                      <TableCell sx={cell}><PointsCell points={p.client_value} COLORS={COLORS} size="sm" muted={!p.client_value} /></TableCell>
                      <TableCell sx={cell}><PointsCell points={p.commission} COLORS={COLORS} size="sm" color={p.commission ? TONES.revenue : undefined} muted={!p.commission} /></TableCell>
                      <TableCell sx={cell}><PointsCell points={p.commission_lost} COLORS={COLORS} size="sm" color={p.commission_lost ? TONES.loss : undefined} muted={!p.commission_lost} /></TableCell>
                      <TableCell sx={cell}><PointsCell points={p.referral_net} COLORS={COLORS} size="sm" muted={!p.referral_net} /></TableCell>
                      <TableCell sx={cell}><PointsCell points={p.bonuses_total} COLORS={COLORS} size="sm" muted={!p.bonuses_total} /></TableCell>
                      <TableCell sx={cell}><PointsCell points={p.profit} COLORS={COLORS} size="sm" color={p.profit >= 0 ? TONES.profit : TONES.loss} muted={!p.profit} /></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableScroll>
          {!trend.bonuses_included && (
            <Typography sx={{ px: { xs: 1.75, sm: 2.25 }, py: 1.2, fontSize: '0.72rem', color: COLORS.textMuted }}>
              A single client is selected, so profit here is before bonuses and rewards.
            </Typography>
          )}
        </>
      )}
    </SectionCard>
  )
}

export default TrendSection
