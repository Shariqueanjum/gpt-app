import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, TextField, Select, MenuItem, Switch, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  Tabs, Tab, CircularProgress, Alert, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import { EmptyState, ErrorState, TableShell, TableScroll } from '../../components/Admin/AdminUiKit'

const TYPE_OPTIONS = [
  { value: 'api', label: 'API (server-to-server)' },
  { value: 'router', label: 'Router (redirect link)' },
  { value: 'iframe', label: 'Iframe (embedded)' },
]

// Every field that can feed an outgoing URL param — matches resolveParamValue
// on the backend exactly. Adding anything not in this list would silently
// resolve to an empty string server-side.
const SOURCE_OPTIONS = [
  { value: 'transaction_id', label: 'Transaction ID' },
  { value: 'user.public_id', label: 'User · Public ID' },
  { value: 'user.username', label: 'User · Username' },
  { value: 'user.email', label: 'User · Email' },
  { value: 'user.country', label: 'User · Country' },
  { value: 'user.gender', label: 'User · Gender' },
  { value: 'user.dob', label: 'User · Date of birth' },
  { value: 'user.full_name', label: 'User · Full name' },
  { value: 'user.phone', label: 'User · Phone' },
  { value: 'user.referral_code', label: 'User · Referral code' },
  { value: 'user.level_id', label: 'User · Level' },
  { value: 'static', label: 'Static value' },
]

const emptyForm = {
  name: '', internal_id: '', type: 'api', endpoint_url: '', iframe_url: '',
  hash_algorithm: '', hash_key: '', commission_rate: 20,
  url_params: [{ param: 'user_id', source: 'user.public_id', value: '' }, { param: 'transaction_id', source: 'transaction_id', value: '' }],
  s2s: { transaction_id_field: 'transaction_id', sub_id_field: '', status_field: 'status', payout_field: 'payout', status_map: [{ key: 'completed', value: 'success' }, { key: 'rejected', value: 'failed' }] },
  browser: { transaction_id_field: 'transaction_id', sub_id_field: '', payout_field: 'payout', signature_field: 'hash', hash_fields: 'transaction_id, payout, status' },
}

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } }

const AdminOfferWallsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewResult, setPreviewResult] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await adminAxiosInstance.get('/admin/offer-walls')
      setRows(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load offer walls')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = async (wall) => {
    setTogglingId(wall.id)
    try {
      await adminAxiosInstance.patch(`/admin/offer-walls/${wall.id}/toggle`)
      setRows((prev) => prev.map((r) => r.id === wall.id ? { ...r, is_active: !r.is_active } : r))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle offer wall')
    } finally {
      setTogglingId(null)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setTab(0)
    setPreviewResult(null)
    setSaveError('')
    setDialogOpen(true)
  }

  const openEdit = (wall) => {
    const cfg = wall.callback_config || {}
    setEditingId(wall.id)
    setForm({
      name: wall.name || '', internal_id: wall.internal_id || '', type: wall.type || 'api',
      endpoint_url: wall.endpoint_url || '', iframe_url: wall.iframe_url || '',
      hash_algorithm: wall.hash_algorithm || '', hash_key: wall.hash_key || '',
      commission_rate: wall.commission_rate ?? 20,
      url_params: cfg.url_params?.length ? cfg.url_params : emptyForm.url_params,
      s2s: {
        transaction_id_field: cfg.s2s?.transaction_id_field || '',
        sub_id_field: cfg.s2s?.sub_id_field || '',
        status_field: cfg.s2s?.status_field || '',
        payout_field: cfg.s2s?.payout_field || '',
        status_map: cfg.s2s?.status_map
          ? Object.entries(cfg.s2s.status_map).map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }],
      },
      browser: {
        transaction_id_field: cfg.browser?.transaction_id_field || '',
        sub_id_field: cfg.browser?.sub_id_field || '',
        payout_field: cfg.browser?.payout_field || '',
        signature_field: cfg.browser?.signature_field || '',
        hash_fields: Array.isArray(cfg.browser?.hash_fields) ? cfg.browser.hash_fields.join(', ') : '',
      },
    })
    setTab(0)
    setPreviewResult(null)
    setSaveError('')
    setDialogOpen(true)
  }

  const buildPayload = () => {
    const status_map = Object.fromEntries(
      form.s2s.status_map.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value.trim()])
    )
    const hash_fields = form.browser.hash_fields.split(',').map((s) => s.trim()).filter(Boolean)
    return {
      name: form.name.trim(),
      internal_id: form.internal_id.trim().toLowerCase().replace(/\s+/g, '_'),
      type: form.type,
      endpoint_url: form.type !== 'iframe' ? form.endpoint_url.trim() || null : null,
      iframe_url: form.type === 'iframe' ? form.iframe_url.trim() || null : null,
      hash_algorithm: form.hash_algorithm.trim() || null,
      hash_key: form.hash_key.trim() || null,
      commission_rate: Number(form.commission_rate),
      callback_config: {
        url_params: form.url_params.filter((p) => p.param.trim()),
        s2s: {
          transaction_id_field: form.s2s.transaction_id_field.trim(),
          sub_id_field: form.s2s.sub_id_field.trim() || undefined,
          status_field: form.s2s.status_field.trim(),
          payout_field: form.s2s.payout_field.trim(),
          status_map,
        },
        browser: {
          transaction_id_field: form.browser.transaction_id_field.trim(),
          sub_id_field: form.browser.sub_id_field.trim() || undefined,
          payout_field: form.browser.payout_field.trim(),
          signature_field: form.browser.signature_field.trim(),
          hash_fields,
        },
      },
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.internal_id.trim()) { setTab(0); setSaveError('Name and internal ID are required'); return }
    setSaving(true); setSaveError('')
    try {
      const payload = buildPayload()
      if (editingId) {
        await adminAxiosInstance.put(`/admin/offer-walls/${editingId}`, payload)
      } else {
        await adminAxiosInstance.post('/admin/offer-walls', payload)
      }
      setDialogOpen(false)
      fetchData()
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save offer wall')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    if (!editingId) return
    setPreviewLoading(true); setPreviewResult(null)
    try {
      const res = await adminAxiosInstance.post(`/admin/offer-walls/${editingId}/preview-url`, {})
      setPreviewResult({ type: 'success', url: res.data?.data?.preview_url })
    } catch (err) {
      setPreviewResult({ type: 'error', msg: err.response?.data?.message || 'Preview failed' })
    } finally {
      setPreviewLoading(false)
    }
  }

  // --- URL params row helpers ---
  const updateParamRow = (i, key, value) => setForm((f) => ({
    ...f, url_params: f.url_params.map((row, idx) => idx === i ? { ...row, [key]: value } : row),
  }))
  const addParamRow = () => setForm((f) => ({ ...f, url_params: [...f.url_params, { param: '', source: 'static', value: '' }] }))
  const removeParamRow = (i) => setForm((f) => ({ ...f, url_params: f.url_params.filter((_, idx) => idx !== i) }))

  // --- status_map row helpers ---
  const updateMapRow = (i, key, value) => setForm((f) => ({
    ...f, s2s: { ...f.s2s, status_map: f.s2s.status_map.map((row, idx) => idx === i ? { ...row, [key]: value } : row) },
  }))
  const addMapRow = () => setForm((f) => ({ ...f, s2s: { ...f.s2s, status_map: [...f.s2s.status_map, { key: '', value: '' }] } }))
  const removeMapRow = (i) => setForm((f) => ({ ...f, s2s: { ...f.s2s, status_map: f.s2s.status_map.filter((_, idx) => idx !== i) } }))

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
            Offer Walls
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
            {rows.length} configured · onboard a new survey provider without touching code
          </Typography>
        </Box>
        <Button onClick={openCreate} startIcon={<AddIcon />} variant="contained" sx={{
          textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 2.5,
          bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary },
        }}>
          Add offer wall
        </Button>
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No offer walls configured yet" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['Name', 'Internal ID', 'Type', 'Commission', 'Status', ''].map((h) => (
                    <Box component="th" key={h} sx={{
                      textAlign: 'left', px: 2, py: 1.4, fontSize: '0.74rem', fontWeight: 700,
                      color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {loading
                  ? [...Array(4)].map((_, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <Box component="td" colSpan={6} sx={{ px: 2, py: 1.6 }}><Skeleton variant="rounded" height={30} /></Box>
                    </Box>
                  ))
                  : rows.map((wall) => (
                    <Box component="tr" key={wall.id} sx={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      '&:hover': { bgcolor: `${COLORS.primary}05` },
                    }}>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.86rem', fontWeight: 700, color: COLORS.textPrimary }}>
                        {wall.name}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.8rem', color: COLORS.textMuted, fontFamily: 'monospace' }}>
                        {wall.internal_id}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Typography sx={{
                          fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'inline-block',
                          color: COLORS.primary, bgcolor: `${COLORS.primary}12`, px: 1, py: 0.3, borderRadius: 4,
                        }}>
                          {wall.type}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4, fontSize: '0.83rem', color: COLORS.textSecondary }}>
                        {wall.commission_rate}%
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.4 }}>
                        <Switch size="small" checked={!!wall.is_active} disabled={togglingId === wall.id}
                          onChange={() => handleToggle(wall)} />
                      </Box>
                      <Box component="td" sx={{ px: 1, py: 1.4, textAlign: 'right' }}>
                        <IconButton size="small" onClick={() => openEdit(wall)}>
                          <EditIcon fontSize="small" sx={{ color: COLORS.textMuted }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
          </TableScroll>
        )}
      </TableShell>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: COLORS.cardBg } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: COLORS.textPrimary }}>
          {editingId ? `Edit — ${form.name}` : 'New offer wall'}
          <IconButton size="small" onClick={() => setDialogOpen(false)} disabled={saving}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: `1px solid ${COLORS.border}`, minHeight: 40 }}>
          <Tab label="Basics" sx={{ textTransform: 'none', fontSize: '0.83rem', minHeight: 40 }} />
          <Tab label="URL parameters" sx={{ textTransform: 'none', fontSize: '0.83rem', minHeight: 40 }} />
          <Tab label="S2S callback" sx={{ textTransform: 'none', fontSize: '0.83rem', minHeight: 40 }} />
          <Tab label="Browser callback" sx={{ textTransform: 'none', fontSize: '0.83rem', minHeight: 40 }} />
        </Tabs>
        <DialogContent sx={{ pt: 2.5 }}>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.8 }}>
                <TextField label="Display name" size="small" value={form.name} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <TextField label="Internal ID (slug)" size="small" value={form.internal_id} sx={fieldSx}
                  helperText="lowercase, no spaces — used internally to identify this wall"
                  onChange={(e) => setForm((f) => ({ ...f, internal_id: e.target.value }))} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.8 }}>
                <Select size="small" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} sx={fieldSx}>
                  {TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.85rem' }}>{o.label}</MenuItem>)}
                </Select>
                <TextField label="Commission rate (%)" type="number" size="small" value={form.commission_rate} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, commission_rate: e.target.value }))} />
              </Box>
              {form.type === 'iframe' ? (
                <TextField label="Iframe URL" size="small" value={form.iframe_url} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, iframe_url: e.target.value }))} />
              ) : (
                <TextField label="Endpoint URL" size="small" value={form.endpoint_url} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, endpoint_url: e.target.value }))} />
              )}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.8 }}>
                <TextField label="Hash algorithm (optional)" size="small" placeholder="md5, sha256…" value={form.hash_algorithm} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, hash_algorithm: e.target.value }))} />
                <TextField label="Hash key / secret (optional)" size="small" value={form.hash_key} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, hash_key: e.target.value }))} />
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mb: 1.5 }}>
                Build the outgoing URL by mapping each query parameter the provider expects to a field on our side.
              </Typography>
              {form.url_params.map((row, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.2, alignItems: 'center' }}>
                  <TextField size="small" placeholder="param name (e.g. ssid)" value={row.param}
                    onChange={(e) => updateParamRow(i, 'param', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  <Select size="small" value={row.source} onChange={(e) => updateParamRow(i, 'source', e.target.value)} sx={{ ...fieldSx, flex: 1.3 }}>
                    {SOURCE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.83rem' }}>{o.label}</MenuItem>)}
                  </Select>
                  {row.source === 'static' && (
                    <TextField size="small" placeholder="value" value={row.value}
                      onChange={(e) => updateParamRow(i, 'value', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  )}
                  <IconButton size="small" onClick={() => removeParamRow(i)}><DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} /></IconButton>
                </Box>
              ))}
              <Button onClick={addParamRow} startIcon={<AddIcon />} size="small" sx={{ textTransform: 'none', mt: 0.5 }}>
                Add parameter
              </Button>

              {editingId && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${COLORS.border}` }}>
                  <Button onClick={handlePreview} disabled={previewLoading} startIcon={<VisibilityOutlinedIcon />} size="small"
                    sx={{ textTransform: 'none', fontWeight: 700 }}>
                    {previewLoading ? <CircularProgress size={16} /> : 'Preview entry URL'}
                  </Button>
                  {previewResult?.type === 'success' && (
                    <Box sx={{ mt: 1.2, p: 1.3, borderRadius: 2, bgcolor: `${COLORS.primary}08`, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, wordBreak: 'break-all', flex: 1 }}>
                        {previewResult.url}
                      </Typography>
                      <Tooltip title="Copy">
                        <IconButton size="small" onClick={() => navigator.clipboard?.writeText(previewResult.url)}>
                          <ContentCopyOutlinedIcon sx={{ fontSize: '0.95rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {previewResult?.type === 'error' && <Alert severity="error" sx={{ mt: 1.2, fontSize: '0.8rem' }}>{previewResult.msg}</Alert>}
                </Box>
              )}
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mb: 1.5 }}>
                Server-to-server postback the provider sends when a survey completes — field names as the provider sends them.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.8, mb: 1.8 }}>
                <TextField label="Transaction ID field" size="small" value={form.s2s.transaction_id_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, transaction_id_field: e.target.value } }))} />
                <TextField label="Sub ID field (optional)" size="small" value={form.s2s.sub_id_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, sub_id_field: e.target.value } }))} />
                <TextField label="Status field" size="small" value={form.s2s.status_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, status_field: e.target.value } }))} />
                <TextField label="Payout field" size="small" value={form.s2s.payout_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, payout_field: e.target.value } }))} />
              </Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                Status mapping (their value → our value)
              </Typography>
              {form.s2s.status_map.map((row, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField size="small" placeholder="their status (e.g. completed)" value={row.key}
                    onChange={(e) => updateMapRow(i, 'key', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  <Select size="small" value={row.value || ''} onChange={(e) => updateMapRow(i, 'value', e.target.value)} sx={{ ...fieldSx, flex: 1 }}>
                    <MenuItem value="success" sx={{ fontSize: '0.83rem' }}>success</MenuItem>
                    <MenuItem value="failed" sx={{ fontSize: '0.83rem' }}>failed</MenuItem>
                    <MenuItem value="quota_full" sx={{ fontSize: '0.83rem' }}>quota_full</MenuItem>
                  </Select>
                  <IconButton size="small" onClick={() => removeMapRow(i)}><DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} /></IconButton>
                </Box>
              ))}
              <Button onClick={addMapRow} startIcon={<AddIcon />} size="small" sx={{ textTransform: 'none' }}>
                Add status mapping
              </Button>
            </Box>
          )}

          {tab === 3 && (
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mb: 1.5 }}>
                Browser redirect postback (used as a fallback/confirmation alongside S2S, or as the only signal for iframe walls).
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.8, mb: 1.8 }}>
                <TextField label="Transaction ID field" size="small" value={form.browser.transaction_id_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, transaction_id_field: e.target.value } }))} />
                <TextField label="Sub ID field (optional)" size="small" value={form.browser.sub_id_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, sub_id_field: e.target.value } }))} />
                <TextField label="Payout field" size="small" value={form.browser.payout_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, payout_field: e.target.value } }))} />
                <TextField label="Signature field" size="small" value={form.browser.signature_field} sx={fieldSx}
                  onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, signature_field: e.target.value } }))} />
              </Box>
              <TextField fullWidth label="Hash fields (comma-separated, in signature order)" size="small"
                value={form.browser.hash_fields} sx={fieldSx}
                onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, hash_fields: e.target.value } }))} />
            </Box>
          )}

          {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: 'none', color: COLORS.textSecondary }}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="contained" sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary },
          }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editingId ? 'Save changes' : 'Create offer wall'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  )
}

export default AdminOfferWallsPage