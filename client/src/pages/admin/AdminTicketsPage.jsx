import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Avatar, TextField, Skeleton, Select, MenuItem } from '@mui/material'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  useDebouncedValue, SearchInput, FilterSelect, StatusPill, PaginationFooter,
  EmptyState, ErrorState, ActionDialog, TableShell, TableScroll,
} from '../../components/Admin/AdminUiKit'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]

const CATEGORY_LABELS = {
  payment_issue: 'Payment issue',
  account_problem: 'Account problem',
  survey_problem: 'Survey problem',
  withdrawal_issue: 'Withdrawal issue',
  referral_issue: 'Referral issue',
  bug_report: 'Bug report',
  feature_request: 'Feature request',
  other: 'Other',
}

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

const AdminTicketsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)
  const [statusFilter, setStatusFilter] = useState('open')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [respondTarget, setRespondTarget] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [closeAfter, setCloseAfter] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.status = statusFilter
      const res = await adminAxiosInstance.get('/admin/tickets', { params })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tickets')
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, statusFilter])

  useEffect(() => { fetchTickets() }, [fetchTickets])
  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

  const openRespond = (ticket) => {
    setRespondTarget(ticket)
    setResponseText(ticket.admin_response || '')
    setCloseAfter(ticket.status !== 'closed')
  }

  const handleRespond = async () => {
    if (!responseText.trim()) return
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.put(`/admin/tickets/${respondTarget.id}/respond`, {
        admin_response: responseText.trim(),
        status: closeAfter ? 'closed' : 'open',
      })
      setRespondTarget(null); setResponseText('')
      fetchTickets()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to send response')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Support Tickets
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {meta ? `${meta.total} tickets` : 'Loading…'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search subject, username, email…" COLORS={COLORS} />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} COLORS={COLORS} />
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchTickets} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No tickets match these filters" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['User', 'Subject', 'Category', 'Status', 'Updated', ''].map((h) => (
                    <Box component="th" key={h} sx={{
                      textAlign: 'left', px: 2, py: 1.4, fontSize: '0.74rem', fontWeight: 700,
                      color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {loading
                  ? [...Array(6)].map((_, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <Box component="td" colSpan={6} sx={{ px: 2, py: 1.8 }}><Skeleton variant="rounded" height={32} /></Box>
                    </Box>
                  ))
                  : rows.map((t) => (
                    <Box component="tr" key={t.id} onClick={() => openRespond(t)} sx={{
                      borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer',
                      '&:hover': { bgcolor: `${COLORS.primary}05` },
                    }}>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', bgcolor: COLORS.primary }}>
                            {t.user_username?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: COLORS.textPrimary }} noWrap>
                              {t.user_username}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }} noWrap>
                              {t.user_email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, maxWidth: 280 }}>
                        <Typography sx={{ fontSize: '0.83rem', color: COLORS.textPrimary, fontWeight: 600 }} noWrap>
                          {t.subject}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.78rem', color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                        {CATEGORY_LABELS[t.category] || t.category}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <StatusPill label={t.status} color={t.status === 'open' ? '#f59e0b' : '#10b981'} />
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.78rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(t.updated_at)}
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

      <ActionDialog
        open={!!respondTarget}
        onClose={() => { setRespondTarget(null); setActionError('') }}
        title={respondTarget?.subject || 'Respond to ticket'}
        onConfirm={handleRespond}
        confirmLabel="Send response"
        loading={actionLoading}
        confirmDisabled={!responseText.trim()}
        COLORS={COLORS}
        error={actionError}
      >
        <Box sx={{ mb: 1.5, p: 1.4, borderRadius: 2, bgcolor: `${COLORS.primary}08` }}>
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: COLORS.textMuted, mb: 0.3 }}>
            {respondTarget?.user_username} · {CATEGORY_LABELS[respondTarget?.category] || respondTarget?.category}
          </Typography>
          <Typography sx={{ fontSize: '0.83rem', color: COLORS.textPrimary, whiteSpace: 'pre-wrap' }}>
            {respondTarget?.message}
          </Typography>
        </Box>
        <TextField fullWidth multiline minRows={3} size="small" label="Your response"
          value={responseText} onChange={(e) => setResponseText(e.target.value)} sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>Set status to:</Typography>
          <Select size="small" value={closeAfter ? 'closed' : 'open'} onChange={(e) => setCloseAfter(e.target.value === 'closed')}>
            <MenuItem value="closed" sx={{ fontSize: '0.82rem' }}>Closed</MenuItem>
            <MenuItem value="open" sx={{ fontSize: '0.82rem' }}>Keep open</MenuItem>
          </Select>
        </Box>
      </ActionDialog>
    </AdminPageWrapper>
  )
}

export default AdminTicketsPage
