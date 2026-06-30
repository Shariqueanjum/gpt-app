import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Skeleton, Dialog, DialogTitle, DialogContent, IconButton,
  Divider, Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  useDebouncedValue, SearchInput, FilterSelect, PaginationFooter,
  EmptyState, ErrorState, TableShell, TableScroll,
} from '../../components/Admin/AdminUiKit'

const DIRECTION_OPTIONS = [
  { value: '', label: 'All directions' },
  { value: 'outgoing', label: 'Outgoing (to provider)' },
  { value: 'incoming', label: 'Incoming (callback)' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'survey_click', label: 'Survey click' },
  { value: 's2s_callback', label: 'S2S callback' },
  { value: 'browser_callback', label: 'Browser callback' },
  { value: 'api_request', label: 'API request' },
  { value: 'redirect', label: 'Redirect' },
]

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
}) : '—'

const statusColor = (code) => {
  if (!code) return '#6b7280'
  if (code >= 200 && code < 300) return '#10b981'
  if (code >= 400) return '#ef4444'
  return '#f59e0b'
}

// Pretty-prints whatever JSON-ish value the backend stored — request/response
// bodies, headers, query params — without assuming a fixed schema.
const JsonBlock = ({ label, value, COLORS }) => {
  if (value === null || value === undefined || value === '') return null
  let content = value
  if (typeof value === 'object') {
    try { content = JSON.stringify(value, null, 2) } catch { content = String(value) }
  }
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.6 }}>
        {label}
      </Typography>
      <Box component="pre" sx={{
        m: 0, p: 1.5, borderRadius: 2, bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`,
        fontSize: '0.76rem', color: COLORS.textSecondary, overflowX: 'auto',
        fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {content}
      </Box>
    </Box>
  )
}

const AdminTrafficLogsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)
  const [direction, setDirection] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)

  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detail, setDetail] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (direction) params.direction = direction
      if (type) params.type = type
      if (debouncedSearch) {
        // Could be either an internal or external transaction ID — try internal first,
        // the user can switch by clearing/retyping if it's actually external.
        params.internal_transaction_id = debouncedSearch
      }
      const res = await adminAxiosInstance.get('/admin/traffic-logs', { params })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load traffic logs')
    } finally {
      setLoading(false)
    }
  }, [page, limit, direction, type, debouncedSearch])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [debouncedSearch, direction, type])

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Traffic Logs
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {meta ? `${meta.total} requests logged` : 'Loading…'} · auto-purged after 7 days
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Internal transaction ID…" COLORS={COLORS} />
        <FilterSelect value={direction} onChange={setDirection} options={DIRECTION_OPTIONS} COLORS={COLORS} minWidth={170} />
        <FilterSelect value={type} onChange={setType} options={TYPE_OPTIONS} COLORS={COLORS} minWidth={170} />
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No traffic matches these filters" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['Time', 'Dir', 'Type', 'User', 'Offer wall', 'Status', 'Latency', ''].map((h) => (
                    <Box component="th" key={h} sx={{
                      textAlign: 'left', px: 2, py: 1.4, fontSize: '0.74rem', fontWeight: 700,
                      color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {loading
                  ? [...Array(8)].map((_, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <Box component="td" colSpan={8} sx={{ px: 2, py: 1.5 }}><Skeleton variant="rounded" height={26} /></Box>
                    </Box>
                  ))
                  : rows.map((log) => (
                    <Box component="tr" key={log.id} onClick={() => setDetail(log)} sx={{
                      borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer',
                      bgcolor: log.error_message ? '#ef444408' : 'transparent',
                      '&:hover': { bgcolor: `${COLORS.primary}05` },
                    }}>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontSize: '0.76rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(log.created_at)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2 }}>
                        {log.direction === 'outgoing'
                          ? <ArrowUpwardIcon sx={{ fontSize: '0.95rem', color: '#5312bc' }} />
                          : <ArrowDownwardIcon sx={{ fontSize: '0.95rem', color: '#10b981' }} />}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontSize: '0.78rem', color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                        {log.type?.replace(/_/g, ' ')}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontSize: '0.78rem', color: COLORS.textPrimary, whiteSpace: 'nowrap' }}>
                        {log.user_username_joined || log.user_username || '—'}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontSize: '0.78rem', color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                        {log.offer_wall_name_joined || log.offer_wall_name || '—'}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2 }}>
                        <Chip
                          label={log.response_status || (log.error_message ? 'error' : '—')}
                          size="small"
                          sx={{
                            height: 20, fontSize: '0.7rem', fontWeight: 700,
                            bgcolor: `${statusColor(log.response_status)}15`, color: statusColor(log.response_status),
                          }}
                        />
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontSize: '0.76rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {log.processing_time_ms != null ? `${log.processing_time_ms}ms` : '—'}
                      </Box>
                      <Box component="td" />
                    </Box>
                  ))}
              </Box>
            </Box>
          </TableScroll>
        )}
        {!error && <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={(v) => { setLimit(v); setPage(1) }} COLORS={COLORS} />}
      </TableShell>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: COLORS.cardBg } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: COLORS.textPrimary }}>
          <Box>
            {detail?.direction === 'outgoing' ? 'Outgoing request' : 'Incoming callback'} · {detail?.type?.replace(/_/g, ' ')}
          </Box>
          <IconButton size="small" onClick={() => setDetail(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: COLORS.border }}>
          {detail && (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={`Status ${detail.response_status ?? 'n/a'}`} size="small" sx={{ bgcolor: `${statusColor(detail.response_status)}15`, color: statusColor(detail.response_status), fontWeight: 700 }} />
                {detail.processing_time_ms != null && <Chip label={`${detail.processing_time_ms}ms`} size="small" />}
                {detail.user_username_joined && <Chip label={detail.user_username_joined} size="small" />}
                {(detail.offer_wall_name_joined || detail.offer_wall_name) && <Chip label={detail.offer_wall_name_joined || detail.offer_wall_name} size="small" />}
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary, mb: 2, wordBreak: 'break-all' }}>
                <strong>{detail.method}</strong> {detail.url}
              </Typography>
              {detail.error_message && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#ef444412' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>
                    {detail.error_message}
                  </Typography>
                </Box>
              )}
              <JsonBlock label="Internal / external txn ID" value={[detail.internal_transaction_id, detail.external_transaction_id].filter(Boolean).join(' → ') || null} COLORS={COLORS} />
              <JsonBlock label="Query params" value={detail.query_params} COLORS={COLORS} />
              <JsonBlock label="Request body" value={detail.request_body} COLORS={COLORS} />
              <JsonBlock label="Response body" value={detail.response_body} COLORS={COLORS} />
              <JsonBlock label="Headers" value={detail.headers} COLORS={COLORS} />
              <JsonBlock label="Error stack" value={detail.error_stack} COLORS={COLORS} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  )
}

export default AdminTrafficLogsPage
