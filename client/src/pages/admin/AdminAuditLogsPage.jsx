import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Skeleton, Collapse, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  FilterSelect, PaginationFooter, EmptyState, ErrorState, TableShell, TableScroll,
} from '../../components/Admin/AdminUiKit'

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'ban_user', label: 'Ban user' },
  { value: 'unban_user', label: 'Unban user' },
  { value: 'manual_adjustment', label: 'Balance adjustment' },
  { value: 'approve_withdrawal', label: 'Approve withdrawal' },
  { value: 'reject_withdrawal', label: 'Reject withdrawal' },
  { value: 'update_settings', label: 'Settings update' },
]

const ACTION_COLORS = {
  ban_user: '#ef4444', unban_user: '#10b981', manual_adjustment: '#5312bc',
  approve_withdrawal: '#10b981', reject_withdrawal: '#ef4444', update_settings: '#2563eb',
}

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

const AdminAuditLogsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit }
      if (actionFilter) params.action = actionFilter
      const res = await adminAxiosInstance.get('/admin/audit-logs', { params })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, limit, actionFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [actionFilter])

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Audit Logs
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {meta ? `${meta.total} actions recorded` : 'Loading…'} · every admin action, permanently
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <FilterSelect value={actionFilter} onChange={setActionFilter} options={ACTION_OPTIONS} COLORS={COLORS} minWidth={200} />
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No matching audit entries" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['Action', 'Target', 'Admin', 'IP', 'When', ''].map((h) => (
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
                      <Box component="td" colSpan={6} sx={{ px: 2, py: 1.5 }}><Skeleton variant="rounded" height={26} /></Box>
                    </Box>
                  ))
                  : rows.map((log) => {
                    const color = ACTION_COLORS[log.action] || '#6b7280'
                    const isOpen = expandedId === log.id
                    return (
                      <Box component="tr" key={log.id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <Box component="td" colSpan={6} sx={{ p: 0 }}>
                          <Box onClick={() => setExpandedId(isOpen ? null : log.id)} sx={{
                            display: 'flex', alignItems: 'center', cursor: 'pointer', px: 0,
                            '&:hover': { bgcolor: `${COLORS.primary}05` },
                          }}>
                            <Box sx={{ px: 2, py: 1.3, display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                              <Box sx={{
                                width: 28, height: 28, borderRadius: 1.5, bgcolor: `${color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                              }}>
                                <HistoryOutlinedIcon sx={{ fontSize: '0.95rem' }} />
                              </Box>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: COLORS.textPrimary, textTransform: 'capitalize' }}>
                                {log.action?.replace(/_/g, ' ')}
                              </Typography>
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, fontSize: '0.78rem', color: COLORS.textSecondary, minWidth: 130 }}>
                              {log.target_type ? `${log.target_type} #${log.target_id}` : '—'}
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, fontSize: '0.78rem', color: COLORS.textSecondary, minWidth: 130 }}>
                              {log.admin_username || '—'}
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, fontSize: '0.76rem', color: COLORS.textMuted, minWidth: 110 }}>
                              {log.ip_address || '—'}
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, fontSize: '0.76rem', color: COLORS.textMuted, whiteSpace: 'nowrap', minWidth: 140 }}>
                              {formatDate(log.created_at)}
                            </Box>
                            <Box sx={{ px: 1, py: 1.3, ml: 'auto' }}>
                              <IconButton size="small">
                                <ExpandMoreIcon fontSize="small" sx={{
                                  color: COLORS.textMuted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s',
                                }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Collapse in={isOpen}>
                            <Box sx={{ px: 2, pb: 1.6 }}>
                              <Box component="pre" sx={{
                                m: 0, p: 1.4, borderRadius: 2, bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`,
                                fontSize: '0.76rem', color: COLORS.textSecondary, overflowX: 'auto',
                                fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                              }}>
                                {JSON.stringify(log.details, null, 2)}
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      </Box>
                    )
                  })}
              </Box>
            </Box>
          </TableScroll>
        )}
        {!error && <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={(v) => { setLimit(v); setPage(1) }} COLORS={COLORS} />}
      </TableShell>
    </AdminPageWrapper>
  )
}

export default AdminAuditLogsPage