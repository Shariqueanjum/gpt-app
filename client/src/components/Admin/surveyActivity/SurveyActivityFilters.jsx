import { useState, useMemo } from 'react'
import {
  Box, Button, Collapse, FormControlLabel, IconButton, Switch, TextField, Tooltip, Typography,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined'
import { SearchInput, FilterSelect } from '../AdminUiKit'
import {
  WALL_TYPE_OPTIONS, ORIGIN_OPTIONS, POSTBACK_OPTIONS, FUNDS_OPTIONS, SORT_OPTIONS,
  BASE_STATUS_VALUES, DATE_PRESETS, getStatusMeta, countActiveFilters,
} from './surveyActivityConstants'

// Filters that live inside the collapsible panel
const ADVANCED_KEYS = ['offer_wall_id', 'wall_type', 'origin', 'postback', 'funds', 'user_id', 'min_points', 'max_points', 'hide_stale_pending']

const FIELD_SX = (COLORS) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5, fontSize: '0.83rem', bgcolor: COLORS.inputBg || COLORS.cardBg,
    color: COLORS.textPrimary,
    '& fieldset': { borderColor: COLORS.border },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8rem' },
})

const FilterLabel = ({ children, COLORS }) => (
  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
    {children}
  </Typography>
)

const SurveyActivityFilters = ({
  filters, updateFilter, updateFilters, resetFilters, options,
  live, setLive, onRefresh, refreshing, COLORS,
}) => {
  const activeCount = countActiveFilters(filters)
  // Open by default if the admin arrived with advanced filters already set (deep link)
  const [open, setOpen] = useState(() => ADVANCED_KEYS.some((key) => filters[key]))

  const statusOptions = useMemo(() => {
    const values = [...new Set([...BASE_STATUS_VALUES, ...(options.statuses || [])])]
      .filter((s) => s && s !== 'not_completed')
    return [
      { value: '', label: 'All statuses' },
      ...values.map((s) => ({ value: s, label: getStatusMeta(s).label })),
      { value: 'not_completed', label: 'Failed / other (not pending, completed or reversed)' },
    ]
  }, [options.statuses])

  const wallOptions = useMemo(() => [
    { value: '', label: 'All offer walls' },
    ...(options.offer_walls || []).map((w) => ({ value: String(w.id), label: `${w.name} (${w.type})` })),
  ], [options.offer_walls])

  const activePreset = DATE_PRESETS.find((p) => {
    const r = p.range()
    return r.date_from === filters.date_from && r.date_to === filters.date_to
  })

  const togglePreset = (preset) => {
    if (activePreset?.key === preset.key) updateFilters({ date_from: '', date_to: '' })
    else updateFilters(preset.range())
  }

  const fieldSx = FIELD_SX(COLORS)

  return (
    <Box sx={{ mb: 2 }}>
      {/* Primary row — the two ID searches the admin uses before reversing, plus user */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 1.4 }}>
        <SearchInput value={filters.transaction_id} onChange={(v) => updateFilter('transaction_id', v)}
          placeholder="Our transaction ID" COLORS={COLORS} />
        <SearchInput value={filters.external_transaction_id} onChange={(v) => updateFilter('external_transaction_id', v)}
          placeholder="External (provider) transaction ID" COLORS={COLORS} />
        <SearchInput value={filters.user} onChange={(v) => updateFilter('user', v)}
          placeholder="User: name, email or ID" COLORS={COLORS} />
      </Box>

      {/* Control row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Button onClick={() => setOpen((o) => !o)} startIcon={<TuneIcon fontSize="small" />} size="small" variant="outlined"
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2.5, color: COLORS.textPrimary,
            borderColor: activeCount > 0 ? COLORS.primary : COLORS.border,
          }}>
          {open ? 'Hide filters' : 'More filters'}{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>

        {DATE_PRESETS.map((p) => {
          const active = activePreset?.key === p.key
          return (
            <Box key={p.key} onClick={() => togglePreset(p)} sx={{
              px: 1.3, py: 0.55, borderRadius: 5, cursor: 'pointer', fontSize: '0.77rem', fontWeight: 700,
              border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
              color: active ? COLORS.primary : COLORS.textSecondary,
              bgcolor: active ? `${COLORS.primary}12` : 'transparent', whiteSpace: 'nowrap',
            }}>
              {p.label}
            </Box>
          )
        })}

        <Box sx={{ flex: 1 }} />

        {activeCount > 0 && (
          <Button onClick={resetFilters} size="small" startIcon={<FilterAltOffOutlinedIcon fontSize="small" />}
            sx={{ textTransform: 'none', fontWeight: 700, color: COLORS.danger }}>
            Clear all
          </Button>
        )}
        <Tooltip title="Re-check every 15 seconds so Pending rows flip to Completed when the postback lands">
          <FormControlLabel
            control={<Switch size="small" checked={live} onChange={(e) => setLive(e.target.checked)} />}
            label={<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: COLORS.textSecondary }}>Live</Typography>}
            sx={{ mr: 0.5 }}
          />
        </Tooltip>
        <Tooltip title="Refresh now">
          <span>
            <IconButton size="small" onClick={() => onRefresh()} disabled={refreshing}
              sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Advanced filters */}
      <Collapse in={open} unmountOnExit>
        <Box sx={{
          mt: 1.6, p: { xs: 1.6, sm: 2 }, borderRadius: 3,
          border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg,
          display: 'grid', gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}>
          <Box>
            <FilterLabel COLORS={COLORS}>Status</FilterLabel>
            <FilterSelect value={filters.status} onChange={(v) => updateFilter('status', v)} options={statusOptions} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Offer wall</FilterLabel>
            <FilterSelect value={filters.offer_wall_id} onChange={(v) => updateFilter('offer_wall_id', v)} options={wallOptions} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Wall type</FilterLabel>
            <FilterSelect value={filters.wall_type} onChange={(v) => updateFilter('wall_type', v)} options={WALL_TYPE_OPTIONS} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Origin</FilterLabel>
            <FilterSelect value={filters.origin} onChange={(v) => updateFilter('origin', v)} options={ORIGIN_OPTIONS} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Postback</FilterLabel>
            <FilterSelect value={filters.postback} onChange={(v) => updateFilter('postback', v)} options={POSTBACK_OPTIONS} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Funds</FilterLabel>
            <FilterSelect value={filters.funds} onChange={(v) => updateFilter('funds', v)} options={FUNDS_OPTIONS} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Sort by</FilterLabel>
            <FilterSelect value={filters.sort} onChange={(v) => updateFilter('sort', v)} options={SORT_OPTIONS} COLORS={COLORS} minWidth="100%" />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>User ID (number)</FilterLabel>
            <TextField fullWidth size="small" value={filters.user_id} placeholder="e.g. 42"
              onChange={(e) => updateFilter('user_id', e.target.value.replace(/\D/g, ''))} sx={fieldSx} />
          </Box>

          <Box>
            <FilterLabel COLORS={COLORS}>Min points (user share)</FilterLabel>
            <TextField fullWidth size="small" value={filters.min_points} placeholder="0"
              onChange={(e) => updateFilter('min_points', e.target.value.replace(/[^\d.]/g, ''))} sx={fieldSx} />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>Max points (user share)</FilterLabel>
            <TextField fullWidth size="small" value={filters.max_points} placeholder="any"
              onChange={(e) => updateFilter('max_points', e.target.value.replace(/[^\d.]/g, ''))} sx={fieldSx} />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>From date (UTC)</FilterLabel>
            <TextField fullWidth size="small" type="date" value={filters.date_from}
              onChange={(e) => updateFilter('date_from', e.target.value)} sx={fieldSx} />
          </Box>
          <Box>
            <FilterLabel COLORS={COLORS}>To date (UTC)</FilterLabel>
            <TextField fullWidth size="small" type="date" value={filters.date_to}
              onChange={(e) => updateFilter('date_to', e.target.value)} sx={fieldSx} />
          </Box>

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <FormControlLabel
              control={<Switch size="small" checked={filters.hide_stale_pending} onChange={(e) => updateFilter('hide_stale_pending', e.target.checked)} />}
              label={<Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>Hide pending clicks older than 24 hours (abandoned surveys)</Typography>}
            />
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default SurveyActivityFilters
