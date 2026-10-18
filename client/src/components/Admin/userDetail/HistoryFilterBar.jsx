import { useState } from 'react'
import { Box, Typography, TextField, MenuItem, Button, Collapse, Badge, useMediaQuery, useTheme } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'

const Label = ({ children, COLORS }) => (
  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.4 }}>
    {children}
  </Typography>
)

/**
 * Filter bar driven entirely by a config array:
 *   { key, label, type: 'text' | 'select' | 'date' | 'number', options?, placeholder? }
 * Empty value = filter not applied. `sort` is a normal select handled by HistoryTab.
 */
const HistoryFilterBar = ({ fields, filters, onChange, onClear, activeCount, COLORS }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(!isMobile)

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: COLORS.inputBg || COLORS.bg, fontSize: '0.83rem', color: COLORS.textPrimary },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
  }

  const renderField = (f) => {
    const value = filters[f.key] ?? ''
    const set = (v) => onChange(f.key, v)

    if (f.type === 'select') {
      return (
        <TextField select fullWidth size="small" value={value} onChange={(e) => set(e.target.value)} sx={fieldSx}
          slotProps={{ select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } } } }}>
          {f.options.map((o) => (
            <MenuItem key={`${o.value}`} value={o.value} sx={{ fontSize: '0.83rem' }}>{o.label}</MenuItem>
          ))}
        </TextField>
      )
    }
    if (f.type === 'date') {
      return <TextField fullWidth size="small" type="date" value={value} onChange={(e) => set(e.target.value)} sx={fieldSx} />
    }
    if (f.type === 'number') {
      return (
        <TextField fullWidth size="small" type="number" value={value} placeholder={f.placeholder}
          onChange={(e) => set(e.target.value)} sx={fieldSx} slotProps={{ htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' } }} />
      )
    }
    return (
      <TextField fullWidth size="small" value={value} placeholder={f.placeholder || 'Search…'}
        onChange={(e) => set(e.target.value)} sx={fieldSx} slotProps={{ htmlInput: { maxLength: 100 } }} />
    )
  }

  return (
    <Box sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.5, sm: 2 }, py: 1.1 }}>
        <Button size="small" onClick={() => setOpen((v) => !v)}
          startIcon={<Badge color="primary" badgeContent={activeCount} invisible={!activeCount}><FilterListIcon /></Badge>}
          sx={{ textTransform: 'none', fontWeight: 700, color: COLORS.textPrimary }}>
          Filters
        </Button>
        {activeCount > 0 && (
          <Button size="small" onClick={onClear} startIcon={<ClearIcon sx={{ fontSize: '16px !important' }} />}
            sx={{ textTransform: 'none', fontWeight: 700, color: COLORS.danger }}>
            Clear all
          </Button>
        )}
      </Box>
      <Collapse in={open} unmountOnExit={false}>
        <Box sx={{
          display: 'grid', gap: 1.5, px: { xs: 1.5, sm: 2 }, pb: 1.75,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(auto-fill, minmax(170px, 1fr))' },
        }}>
          {fields.map((f) => (
            <Box key={f.key} sx={{ minWidth: 0, gridColumn: f.type === 'text' ? { xs: '1 / -1', md: 'auto' } : 'auto' }}>
              <Label COLORS={COLORS}>{f.label}</Label>
              {renderField(f)}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

export default HistoryFilterBar
