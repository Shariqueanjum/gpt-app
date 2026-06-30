import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Button, TextField, Switch, Skeleton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  PaginationFooter, EmptyState, ErrorState, ActionDialog, TableShell,
} from '../../components/Admin/AdminUiKit'

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const AdminAnnouncementsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await adminAxiosInstance.get('/admin/announcements', { params: { page, limit } })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load announcements')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    if (title.trim().length < 5 || message.trim().length < 10) return
    setActionLoading(true); setActionError('')
    try {
      await adminAxiosInstance.post('/admin/announcements', { title: title.trim(), message: message.trim() })
      setCreateOpen(false); setTitle(''); setMessage('')
      setPage(1)
      fetchData()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create announcement')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggle = async (announcement) => {
    setTogglingId(announcement.id)
    try {
      await adminAxiosInstance.put(`/admin/announcements/${announcement.id}/toggle`)
      setRows((prev) => prev.map((r) => r.id === announcement.id ? { ...r, is_active: !r.is_active } : r))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle announcement')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
            Announcements
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
            {meta ? `${meta.total} total` : 'Loading…'} · active ones show in every user's notification feed
          </Typography>
        </Box>
        <Button onClick={() => setCreateOpen(true)} startIcon={<AddIcon />} variant="contained" sx={{
          textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 2.5,
          bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary },
        }}>
          New announcement
        </Button>
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No announcements yet" COLORS={COLORS} />
        ) : (
          <Box>
            {loading
              ? [...Array(4)].map((_, i) => (
                <Box key={i} sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Skeleton variant="rounded" height={50} />
                </Box>
              ))
              : rows.map((a) => (
                <Box key={a.id} sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                    bgcolor: a.is_active ? '#10b98115' : `${COLORS.textMuted}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: a.is_active ? '#10b981' : COLORS.textMuted,
                  }}>
                    <CampaignOutlinedIcon fontSize="small" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: COLORS.textPrimary }}>
                      {a.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: COLORS.textSecondary, mt: 0.3, whiteSpace: 'pre-wrap' }}>
                      {a.message}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 0.6 }}>
                      {formatDate(a.created_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: a.is_active ? '#10b981' : COLORS.textMuted, fontWeight: 700 }}>
                      {a.is_active ? 'Active' : 'Off'}
                    </Typography>
                    <Switch
                      size="small"
                      checked={!!a.is_active}
                      disabled={togglingId === a.id}
                      onChange={() => handleToggle(a)}
                    />
                  </Box>
                </Box>
              ))}
          </Box>
        )}
        {!error && <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={(v) => { setLimit(v); setPage(1) }} COLORS={COLORS} />}
      </TableShell>

      <ActionDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setActionError('') }}
        title="New announcement"
        onConfirm={handleCreate}
        confirmLabel="Publish"
        loading={actionLoading}
        confirmDisabled={title.trim().length < 5 || message.trim().length < 10}
        COLORS={COLORS}
        error={actionError}
      >
        <TextField fullWidth size="small" label="Title" value={title}
          onChange={(e) => setTitle(e.target.value)} sx={{ mb: 1.5 }}
          helperText={`${title.length}/200`} />
        <TextField fullWidth multiline minRows={4} size="small" label="Message" value={message}
          onChange={(e) => setMessage(e.target.value)} helperText={`${message.length}/5000`} />
      </ActionDialog>
    </AdminPageWrapper>
  )
}

export default AdminAnnouncementsPage