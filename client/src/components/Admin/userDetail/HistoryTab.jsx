import { useState, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, Skeleton, LinearProgress } from '@mui/material'
import useUserHistory from './useUserHistory'
import HistoryFilterBar from './HistoryFilterBar'
import { TableScroll, TableShell, PaginationFooter, EmptyState, ErrorState } from '../AdminUiKit'
import SwipeHint from './SwipeHint'
import { formatPoints, formatDollar } from './userDetailFormat'

const DEFAULT_SORTS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Highest points' },
  { value: 'amount:asc', label: 'Lowest points' },
]

const buildInitialFilters = (config) => {
  const initial = { sort: (config.sortOptions || DEFAULT_SORTS)[0].value }
  config.filters.forEach((f) => { initial[f.key] = '' })
  return initial
}

/**
 * One tab of the user detail: filter bar + summary strip + scrollable table + pagination.
 * What it shows is described entirely by `config` (see userHistoryConfigs.jsx).
 */
const HistoryTab = ({ config, userId, overview, COLORS, refreshKey, onOpenUser }) => {
  const [filters, setFilters] = useState(() => buildInitialFilters(config))

  // Filters that depend on the user (e.g. the provider list)
  const fields = useMemo(() => {
    const sortField = { key: 'sort', label: 'Sort by', type: 'select', options: config.sortOptions || DEFAULT_SORTS }
    const resolved = config.filters.map((f) => ({ ...f, options: typeof f.options === 'function' ? f.options(overview) : f.options }))
    return [...resolved, sortField]
  }, [config, overview])

  // Turn the UI "sort" value into the two API params
  const apiFilters = useMemo(() => {
    const { sort, ...rest } = filters
    const [sort_by, sort_order] = String(sort).split(':')
    return { ...rest, sort_by, sort_order }
  }, [filters])

  const { rows, meta, loading, error, setPage, setLimit, reload } = useUserHistory({
    userId, endpoint: config.endpoint, filters: apiFilters, refreshKey,
  })

  const defaultSort = (config.sortOptions || DEFAULT_SORTS)[0].value
  const activeCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => (k === 'sort' ? v !== defaultSort : v !== '')).length,
    [filters, defaultSort]
  )

  const handleChange = useCallback((key, value) => setFilters((prev) => ({ ...prev, [key]: value })), [])
  const handleClear = useCallback(() => setFilters(buildInitialFilters(config)), [config])

  const ctx = { COLORS, overview, onOpenUser }
  const minWidth = config.minWidth || 760
  const head = { color: COLORS.textMuted, fontWeight: 700, fontSize: '0.72rem', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap', bgcolor: COLORS.cardBg }
  const cell = { borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, fontSize: '0.82rem', verticalAlign: 'middle' }

  return (
    <TableShell COLORS={COLORS}>
      <HistoryFilterBar fields={fields} filters={filters} onChange={handleChange} onClear={handleClear}
        activeCount={activeCount} COLORS={COLORS} />

      {/* Summary of what the current filters match */}
      {meta && !error && (
        <Box sx={{
          px: { xs: 1.5, sm: 2 }, py: 1, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
          bgcolor: `${COLORS.primary}08`, borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>
            <b>{meta.total}</b> result{meta.total === 1 ? '' : 's'}{activeCount ? ' match your filters' : ''}
          </Typography>
          {config.summaryLabel && meta.filtered_points !== undefined && (
            <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>
              {config.summaryLabel}: <b>{formatPoints(meta.filtered_points)}</b>
              <Box component="span" sx={{ color: COLORS.textMuted }}> ({formatDollar(meta.filtered_points)})</Box>
            </Typography>
          )}
        </Box>
      )}

      {loading && rows.length > 0 && <LinearProgress sx={{ height: 2 }} />}

      {error ? (
        <ErrorState label={error} onRetry={reload} COLORS={COLORS} />
      ) : loading && rows.length === 0 ? (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={44} />)}
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState label={activeCount ? 'Nothing matches these filters' : config.emptyLabel} COLORS={COLORS} />
      ) : (
        <>
        <SwipeHint COLORS={COLORS} />
        <TableScroll>
          <Table size="small" sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {config.columns.map((c) => (
                  <TableCell key={c.label} align={c.align || 'left'} sx={head}>{c.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  {config.columns.map((c) => (
                    <TableCell key={c.label} align={c.align || 'left'} sx={{ ...cell, minWidth: c.minWidth }}>
                      {c.render(row, ctx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
        </>
      )}

      <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={setLimit} COLORS={COLORS} />
    </TableShell>
  )
}

export default HistoryTab
