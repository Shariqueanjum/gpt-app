// ============================================================
// AdminUiKit.jsx — small shared pieces reused across every admin
// list page (Users, Withdrawals, Tickets, Payment Proofs, Traffic
// Logs) so pagination, search, status pills and dialogs all look
// and behave identically everywhere.
// ============================================================
import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, IconButton, InputBase, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'

// Debounce any fast-changing value (used for search inputs so we don't
// fire an API call on every keystroke).
export const useDebouncedValue = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export const SearchInput = ({ value, onChange, placeholder = 'Search…', COLORS }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1, px: 1.6, py: 0.9,
    borderRadius: 2.5, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.inputBg || COLORS.cardBg,
    minWidth: 0, flex: { xs: '1 1 100%', sm: '0 1 280px' },
  }}>
    <SearchIcon sx={{ fontSize: '1.1rem', color: COLORS.textMuted }} />
    <InputBase
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{ fontSize: '0.85rem', flex: 1, color: COLORS.textPrimary }}
    />
  </Box>
)

export const FilterSelect = ({ value, onChange, options, COLORS, minWidth = 140 }) => (
  <Select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    size="small"
    sx={{
      minWidth, fontSize: '0.83rem', borderRadius: 2.5, bgcolor: COLORS.inputBg || COLORS.cardBg,
      color: COLORS.textPrimary,
      '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
    }}
  >
    {options.map((opt) => (
      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.83rem' }}>
        {opt.label}
      </MenuItem>
    ))}
  </Select>
)

export const StatusPill = ({ label, color }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: 0.6,
    px: 1.1, py: 0.35, borderRadius: 5, bgcolor: `${color}15`,
    fontSize: '0.74rem', fontWeight: 700, color, textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  }}>
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
    {label}
  </Box>
)

// Footer with page info + prev/next + page-size selector, driven entirely
// by the `meta` object every admin list endpoint returns.
export const PaginationFooter = ({ meta, onPageChange, onLimitChange, COLORS }) => {
  if (!meta) return null
  const { page, limit, total, totalPages, hasNext, hasPrev } = meta
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 1.5, px: { xs: 1.5, sm: 2 }, py: 1.6,
      borderTop: `1px solid ${COLORS.border}`,
    }}>
      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
        {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onLimitChange && (
          <Select
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            size="small"
            sx={{ fontSize: '0.78rem', mr: 1, '& .MuiSelect-select': { py: 0.5 } }}
          >
            {[10, 20, 50, 100].map((n) => <MenuItem key={n} value={n} sx={{ fontSize: '0.78rem' }}>{n} / page</MenuItem>)}
          </Select>
        )}
        <IconButton size="small" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}
          sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 1.5 }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, minWidth: 70, textAlign: 'center' }}>
          Page {page} / {totalPages || 1}
        </Typography>
        <IconButton size="small" disabled={!hasNext} onClick={() => onPageChange(page + 1)}
          sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 1.5 }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}

export const EmptyState = ({ label, COLORS }) => (
  <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
    <InboxOutlinedIcon sx={{ fontSize: '2.2rem', color: COLORS.textMuted }} />
    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>{label}</Typography>
  </Box>
)

export const ErrorState = ({ label, onRetry, COLORS }) => (
  <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
    <ErrorOutlineIcon sx={{ fontSize: '2.2rem', color: COLORS.danger }} />
    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>{label}</Typography>
    {onRetry && (
      <Button onClick={onRetry} size="small" sx={{ textTransform: 'none', fontWeight: 700, color: COLORS.primary }}>
        Try again
      </Button>
    )}
  </Box>
)

// Generic confirm/action dialog: title, body content (children), a primary
// action button with its own loading state, optional danger styling.
export const ActionDialog = ({
  open, onClose, title, children, onConfirm, confirmLabel = 'Confirm',
  loading = false, danger = false, confirmDisabled = false, COLORS, error,
}) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth
    PaperProps={{ sx: { borderRadius: 3, bgcolor: COLORS.cardBg } }}>
    <DialogTitle sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: '1.05rem', fontWeight: 700, color: COLORS.textPrimary,
    }}>
      {title}
      <IconButton size="small" onClick={onClose} disabled={loading}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ pt: 1 }}>
      {children}
      {error && (
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.danger, mt: 1.5 }}>{error}</Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', color: COLORS.textSecondary }}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={loading || confirmDisabled}
        variant="contained"
        sx={{
          textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5,
          bgcolor: danger ? COLORS.danger : COLORS.primary,
          '&:hover': { bgcolor: danger ? '#dc2626' : COLORS.primary },
        }}
      >
        {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)

export const TableShell = ({ children, COLORS }) => (
  <Box sx={{
    borderRadius: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg,
    overflow: 'hidden',
  }}>
    {children}
  </Box>
)

// Horizontally scrollable wrapper so wide tables don't break mobile layout
export const TableScroll = ({ children }) => (
  <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
    {children}
  </Box>
)
