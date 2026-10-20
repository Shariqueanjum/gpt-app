import { Box, Typography, ToggleButton, ToggleButtonGroup, TextField, MenuItem, IconButton, Button } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { GRANULARITIES, MONTH_NAMES } from './revenueFormat'

const Label = ({ children, COLORS }) => (
  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.4 }}>
    {children}
  </Typography>
)

/**
 * Period picker: Monthly / Quarterly / Yearly / Custom, the year, the month or quarter,
 * arrows to step back and forward, and an optional single-client filter.
 */
const RevenueControls = ({ controls, onChange, meta, COLORS }) => {
  const { granularity, year, index } = controls
  const years = []
  if (meta) for (let y = meta.last_year; y >= meta.first_year; y--) years.push(y)

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: COLORS.inputBg || COLORS.bg, fontSize: '0.85rem', color: COLORS.textPrimary },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
  }
  const selectProps = { select: true, fullWidth: true, size: 'small', sx: fieldSx, slotProps: { select: { displayEmpty: true } } }

  const setGranularity = (g) => {
    if (!g || !meta) return
    const next = { ...controls, granularity: g }
    if (g === 'month' && !(Number(next.index) >= 1 && Number(next.index) <= 12)) next.index = meta.current.month
    if (g === 'quarter') next.index = Math.min(Number(next.index) || meta.current.quarter, 4)
    if (g === 'custom' && !next.date_from) {
      next.date_from = `${next.year}-01-01`
      next.date_to = new Date().toISOString().slice(0, 10)
    }
    onChange(next)
  }

  // arrows: step one month / quarter / year
  const step = (dir) => {
    let y = Number(year)
    let i = Number(index)
    if (granularity === 'year') y += dir
    else {
      const max = granularity === 'month' ? 12 : 4
      i += dir
      if (i > max) { i = 1; y += 1 }
      if (i < 1) { i = max; y -= 1 }
    }
    onChange({ ...controls, year: y, index: i })
  }

  const goCurrent = () => {
    if (!meta) return
    onChange({ ...controls, year: meta.current.year, index: granularity === 'quarter' ? meta.current.quarter : meta.current.month })
  }

  const atFuture = meta && granularity !== 'custom' && (
    Number(year) > meta.current.year ||
    (Number(year) === meta.current.year && granularity === 'month' && Number(index) >= meta.current.month) ||
    (Number(year) === meta.current.year && granularity === 'quarter' && Number(index) >= meta.current.quarter) ||
    (granularity === 'year' && Number(year) >= meta.current.year)
  )
  const atPast = meta && granularity !== 'custom' && Number(year) <= meta.first_year &&
    (granularity === 'year' || Number(index) <= 1)

  const periodTitle = granularity === 'month' ? `${MONTH_NAMES[(Number(index) || 1) - 1]} ${year}`
    : granularity === 'quarter' ? `Q${index} ${year}` : granularity === 'year' ? `${year}` : 'Custom range'

  return (
    <Box sx={{ borderRadius: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg, p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <ToggleButtonGroup exclusive size="small" value={granularity} onChange={(e, v) => setGranularity(v)}
          sx={{
            flexWrap: 'wrap',
            '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', px: 1.75, color: COLORS.textSecondary, borderColor: COLORS.border },
            '& .Mui-selected': { bgcolor: `${COLORS.primary} !important`, color: '#fff !important' },
          }}>
          {GRANULARITIES.map((g) => <ToggleButton key={g.value} value={g.value}>{g.label}</ToggleButton>)}
        </ToggleButtonGroup>

        {granularity !== 'custom' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => step(-1)} disabled={atPast} aria-label="Previous period"><ChevronLeftIcon /></IconButton>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: COLORS.textPrimary, minWidth: 110, textAlign: 'center' }}>{periodTitle}</Typography>
            <IconButton size="small" onClick={() => step(1)} disabled={atFuture} aria-label="Next period"><ChevronRightIcon /></IconButton>
            <Button size="small" onClick={goCurrent} sx={{ textTransform: 'none', fontWeight: 700, color: COLORS.primaryLight, ml: 0.5 }}>Today</Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' } }}>
        {granularity !== 'custom' && (
          <Box sx={{ minWidth: 0 }}>
            <Label COLORS={COLORS}>Year</Label>
            <TextField {...selectProps} value={year} onChange={(e) => onChange({ ...controls, year: e.target.value })}>
              {years.map((y) => <MenuItem key={y} value={y} sx={{ fontSize: '0.85rem' }}>{y}</MenuItem>)}
            </TextField>
          </Box>
        )}
        {granularity === 'month' && (
          <Box sx={{ minWidth: 0 }}>
            <Label COLORS={COLORS}>Month</Label>
            <TextField {...selectProps} value={index} onChange={(e) => onChange({ ...controls, index: e.target.value })}>
              {MONTH_NAMES.map((m, i) => <MenuItem key={m} value={i + 1} sx={{ fontSize: '0.85rem' }}>{m}</MenuItem>)}
            </TextField>
          </Box>
        )}
        {granularity === 'quarter' && (
          <Box sx={{ minWidth: 0 }}>
            <Label COLORS={COLORS}>Quarter</Label>
            <TextField {...selectProps} value={index} onChange={(e) => onChange({ ...controls, index: e.target.value })}>
              {[1, 2, 3, 4].map((q) => <MenuItem key={q} value={q} sx={{ fontSize: '0.85rem' }}>{`Q${q} (${MONTH_NAMES[(q - 1) * 3].slice(0, 3)} – ${MONTH_NAMES[(q - 1) * 3 + 2].slice(0, 3)})`}</MenuItem>)}
            </TextField>
          </Box>
        )}
        {granularity === 'custom' && (
          <>
            <Box sx={{ minWidth: 0 }}>
              <Label COLORS={COLORS}>From date</Label>
              <TextField fullWidth size="small" type="date" value={controls.date_from || ''} sx={fieldSx}
                onChange={(e) => onChange({ ...controls, date_from: e.target.value, year: e.target.value ? e.target.value.slice(0, 4) : controls.year })} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Label COLORS={COLORS}>To date</Label>
              <TextField fullWidth size="small" type="date" value={controls.date_to || ''} sx={fieldSx}
                onChange={(e) => onChange({ ...controls, date_to: e.target.value })} />
            </Box>
          </>
        )}
        <Box sx={{ minWidth: 0, gridColumn: { xs: granularity === 'year' ? '1 / -1' : 'auto', md: 'auto' } }}>
          <Label COLORS={COLORS}>Client</Label>
          <TextField {...selectProps} value={controls.offer_wall_id} onChange={(e) => onChange({ ...controls, offer_wall_id: e.target.value })}>
            <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All clients</MenuItem>
            {(meta?.offer_walls || []).map((w) => <MenuItem key={w.id} value={String(w.id)} sx={{ fontSize: '0.85rem' }}>{w.name}</MenuItem>)}
          </TextField>
        </Box>
      </Box>
    </Box>
  )
}

export default RevenueControls
