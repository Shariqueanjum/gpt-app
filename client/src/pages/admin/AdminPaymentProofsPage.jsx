import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Avatar, TextField, Skeleton, IconButton, Tooltip } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  PaginationFooter, EmptyState, ErrorState, ActionDialog, TableShell, TableScroll,
} from '../../components/Admin/AdminUiKit'

const formatMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

const AdminPaymentProofsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [imagePreview, setImagePreview] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rewardPoints, setRewardPoints] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminAxiosInstance.get('/admin/payment-proofs', { params: { page, limit } })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load payment proofs')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async () => {
    setActionLoading(true); setActionError('')
    try {
      const body = {}
      if (rewardPoints) body.reward_points = parseInt(rewardPoints, 10)
      await adminAxiosInstance.put(`/admin/payment-proofs/${approveTarget.id}/approve`, body)
      setApproveTarget(null); setRewardPoints('')
      fetchData()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve proof')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.put(`/admin/payment-proofs/${rejectTarget.id}/reject`, { reason: rejectReason.trim() })
      setRejectTarget(null); setRejectReason('')
      fetchData()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject proof')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Payment Proofs
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {meta ? `${meta.total} pending review` : 'Loading…'}
        </Typography>
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No payment proofs pending review" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['User', 'Proof', 'Amount', 'Method', 'Submitted', ''].map((h) => (
                    <Box component="th" key={h} sx={{
                      textAlign: 'left', px: 2, py: 1.4, fontSize: '0.74rem', fontWeight: 700,
                      color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {loading
                  ? [...Array(5)].map((_, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <Box component="td" colSpan={6} sx={{ px: 2, py: 1.8 }}><Skeleton variant="rounded" height={48} /></Box>
                    </Box>
                  ))
                  : rows.map((p) => (
                    <Box component="tr" key={p.id} sx={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      '&:hover': { bgcolor: `${COLORS.primary}05` },
                    }}>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', bgcolor: COLORS.primary }}>
                            {p.username?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: COLORS.textPrimary }} noWrap>
                              {p.username}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }} noWrap>
                              {p.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Box
                          component="img"
                          src={p.image_url}
                          alt="payment proof"
                          onClick={() => setImagePreview(p.image_url)}
                          sx={{
                            width: 52, height: 52, borderRadius: 1.5, objectFit: 'cover',
                            cursor: 'pointer', border: `1px solid ${COLORS.border}`,
                          }}
                        />
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.85rem', fontWeight: 700, color: COLORS.textPrimary, whiteSpace: 'nowrap' }}>
                        {formatMoney(p.amount)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.78rem', color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
                        {p.method}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.78rem', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(p.created_at)}
                      </Box>
                      <Box component="td" sx={{ px: 1, py: 1.4 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Approve & reward">
                            <IconButton size="small" onClick={() => setApproveTarget(p)} sx={{ color: '#10b981' }}>
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => setRejectTarget(p)} sx={{ color: '#ef4444' }}>
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

      {/* Full-size proof preview */}
      {imagePreview && (
        <Box onClick={() => setImagePreview(null)} sx={{
          position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)', zIndex: 1300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, cursor: 'zoom-out',
        }}>
          <Box component="img" src={imagePreview} alt="payment proof full"
            sx={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 2 }} />
        </Box>
      )}

      <ActionDialog
        open={!!approveTarget}
        onClose={() => { setApproveTarget(null); setActionError('') }}
        title={`Approve proof — ${formatMoney(approveTarget?.amount)}`}
        onConfirm={handleApprove}
        confirmLabel="Approve"
        loading={actionLoading}
        COLORS={COLORS}
        error={actionError}
      >
        <Typography sx={{ fontSize: '0.84rem', color: COLORS.textSecondary, mb: 1.5 }}>
          Optionally grant bonus reward points to <strong>{approveTarget?.username}</strong> for submitting proof.
          Leave blank to use the default.
        </Typography>
        <TextField fullWidth type="number" size="small" label="Reward points (optional)"
          value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} />
      </ActionDialog>

      <ActionDialog
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setActionError('') }}
        title="Reject payment proof"
        onConfirm={handleReject}
        confirmLabel="Reject"
        danger
        loading={actionLoading}
        confirmDisabled={!rejectReason.trim()}
        COLORS={COLORS}
        error={actionError}
      >
        <TextField fullWidth multiline minRows={2} size="small" label="Reason"
          value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus />
      </ActionDialog>
    </AdminPageWrapper>
  )
}

export default AdminPaymentProofsPage