import { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Typography, Avatar, IconButton, TextField, Skeleton, Tooltip } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  FilterSelect, PaginationFooter, EmptyState, ErrorState, ActionDialog,
  TableShell, TableScroll,
} from '../../components/Admin/AdminUiKit'

const formatMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

// method_details is a free-form JSON blob (upi_id, bank_account+ifsc, paypal_email…)
// Render whatever keys are actually present — never assume a fixed shape.
const MethodDetails = ({ details, COLORS }) => {
  if (!details || typeof details !== 'object') return <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>—</Typography>
  const entries = Object.entries(details)
  if (entries.length === 0) return <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>—</Typography>

  const copy = (val) => navigator.clipboard?.writeText(String(val))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
      {entries.map(([key, val]) => (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted, textTransform: 'capitalize' }}>
            {key.replace(/_/g, ' ')}:
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: COLORS.textPrimary, fontWeight: 600 }}>
            {String(val)}
          </Typography>
          <IconButton size="small" onClick={() => copy(val)} sx={{ p: 0.2 }}>
            <ContentCopyOutlinedIcon sx={{ fontSize: '0.78rem', color: COLORS.textMuted }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  )
}

const AdminWithdrawalsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

  const [methodFilter, setMethodFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [bankTxnId, setBankTxnId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (methodFilter) params.method = methodFilter
      const res = await adminAxiosInstance.get('/admin/withdrawals/pending', { params })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load withdrawals')
    } finally {
      setLoading(false)
    }
  }, [page, limit, methodFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [methodFilter])

  // Method filter options derived from what's actually on the current page —
  // there's no admin endpoint listing all configured methods, so we don't fake one.
  const methodOptions = useMemo(() => {
    const set = new Set(rows.map((w) => w.method).filter(Boolean))
    return [{ value: '', label: 'All methods' }, ...[...set].map((m) => ({ value: m, label: m.toUpperCase() }))]
  }, [rows])

  const handleApprove = async () => {
    if (!bankTxnId.trim()) return
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.put(`/admin/withdrawals/${approveTarget.id}/approve`, {
        bank_transaction_id: bankTxnId.trim(),
      })
      setApproveTarget(null); setBankTxnId('')
      fetchData()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve withdrawal')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.put(`/admin/withdrawals/${rejectTarget.id}/reject`, {
        reason: rejectReason.trim(),
      })
      setRejectTarget(null); setRejectReason('')
      fetchData()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject withdrawal')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Pending Withdrawals
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {meta ? `${meta.total} awaiting approval` : 'Loading…'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <FilterSelect value={methodFilter} onChange={setMethodFilter} options={methodOptions} COLORS={COLORS} />
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No pending withdrawals right now" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 950 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['User', 'Amount', 'Method', 'Pay to', 'Requested', ''].map((h) => (
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
                  : rows.map((w) => (
                    <Box component="tr" key={w.id} sx={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      '&:hover': { bgcolor: `${COLORS.primary}05` },
                    }}>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', bgcolor: COLORS.primary }}>
                            {w.username?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: COLORS.textPrimary }} noWrap>
                              {w.username}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }} noWrap>
                              {w.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, whiteSpace: 'nowrap' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: COLORS.textPrimary }}>
                          {formatMoney(w.amount)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                          bal: {formatMoney(w.balance_available)}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Typography sx={{
                          fontSize: '0.74rem', fontWeight: 700, color: COLORS.primary, textTransform: 'uppercase',
                          bgcolor: `${COLORS.primary}12`, px: 1, py: 0.3, borderRadius: 4, display: 'inline-block',
                        }}>
                          {w.method}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, minWidth: 200 }}>
                        <MethodDetails details={w.method_details} COLORS={COLORS} />
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.78rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(w.created_at)}
                      </Box>
                      <Box component="td" sx={{ px: 1, py: 1.4 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Approve & mark paid">
                            <IconButton size="small" onClick={() => setApproveTarget(w)} sx={{ color: '#10b981' }}>
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject & refund">
                            <IconButton size="small" onClick={() => setRejectTarget(w)} sx={{ color: '#ef4444' }}>
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
          </TableScroll>
        )}
        {!error && <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={(v) => { setLimit(v); setPage(1) }} COLORS={COLORS} />}
      </TableShell>

      <ActionDialog
        open={!!approveTarget}
        onClose={() => { setApproveTarget(null); setActionError('') }}
        title={`Approve withdrawal — ${formatMoney(approveTarget?.amount)}`}
        onConfirm={handleApprove}
        confirmLabel="Mark as paid"
        loading={actionLoading}
        confirmDisabled={!bankTxnId.trim()}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.84rem', color: COLORS.textSecondary, mb: 1.5 }}>
          Pay <strong>{approveTarget?.username}</strong> via {approveTarget?.method?.toUpperCase()} first, then enter the
          transaction / UTR reference to confirm.
        </Typography>
        <TextField fullWidth size="small" label="Bank / transaction reference ID"
          value={bankTxnId} onChange={(e) => setBankTxnId(e.target.value)} autoFocus />
      </ActionDialog>

      <ActionDialog
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setActionError('') }}
        title={`Reject withdrawal — ${formatMoney(rejectTarget?.amount)}`}
        onConfirm={handleReject}
        confirmLabel="Reject & refund"
        danger
        loading={actionLoading}
        confirmDisabled={!rejectReason.trim()}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.84rem', color: COLORS.textSecondary, mb: 1.5 }}>
          The full amount is refunded to <strong>{rejectTarget?.username}</strong>'s balance automatically.
        </Typography>
        <TextField fullWidth multiline minRows={2} size="small" label="Reason"
          value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus />
      </ActionDialog>
    </AdminPageWrapper>
  )
}

export default AdminWithdrawalsPage