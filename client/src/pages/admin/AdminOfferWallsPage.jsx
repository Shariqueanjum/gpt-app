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
  hash_algorithm: '', hash_key: '', commission_rate: 20, logo_url: '',
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
      logo_url: wall.logo_url || '',
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
      logo_url: form.logo_url.trim() || null,
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

  // Build postback URL for display
  const postbackUrl = form.internal_id
    ? `${window.location.origin}/api/callback/${form.internal_id.trim().toLowerCase().replace(/\s+/g, '_')}`
    : ''

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: COLORS.textPrimary }}>Offer Walls</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mt: 0.5 }}>
              {rows.length} configured · onboard a new survey provider without touching code
            </Typography>
          </Box>
          <Button onClick={openCreate} variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 3, '&:hover': { bgcolor: COLORS.primaryDark } }}>
            New Wall
          </Button>
        </Box>

        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No offer walls yet. Add your first provider." COLORS={COLORS} />
        ) : (
          <TableShell COLORS={COLORS}>
            <TableScroll>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    {['Name', 'Internal ID', 'Type', 'Commission', 'Status', ''].map((h) => (
                      <Box key={h} component="th" sx={{ textAlign: 'left', p: 1.5, fontSize: '0.75rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {loading
                    ? [...Array(4)].map((_, i) => (
                      <Box key={i} component="tr">
                        {[...Array(6)].map((_, j) => (
                          <Box key={j} component="td" sx={{ p: 1.5 }}>
                            <Skeleton variant="rounded" height={32} sx={{ borderRadius: 1 }} />
                          </Box>
                        ))}
                      </Box>
                    ))
                    : rows.map((wall) => (
                      <Box key={wall.id} component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: `${COLORS.primary}04` } }}>
                        <Box component="td" sx={{ p: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: COLORS.textPrimary }}>
                            {wall.name}
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 1.5 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: COLORS.textSecondary }}>
                            {wall.internal_id}
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 1.5 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, textTransform: 'capitalize' }}>
                            {wall.type}
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 1.5 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                            {wall.commission_rate}%
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 1.5 }}>
                          <Switch
                            checked={wall.is_active}
                            disabled={togglingId === wall.id}
                            onChange={() => handleToggle(wall)}
                          />
                        </Box>
                        <Box component="td" sx={{ p: 1.5, textAlign: 'right' }}>
                          <Tooltip title="Preview URL">
                            <IconButton onClick={() => openEdit(wall)} sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.primary } }}>
                              <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => openEdit(wall)} sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.primary } }}>
                              <EditIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
            </TableScroll>
          </TableShell>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: COLORS.cardBg } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.textPrimary }}>
            {editingId ? `Edit — ${form.name}` : 'New offer wall'}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} disabled={saving} sx={{ color: COLORS.textSecondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: `1px solid ${COLORS.border}`, minHeight: 40 }}>
          <Tab label="Basic" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: COLORS.textSecondary, '&.Mui-selected': { color: COLORS.primary } }} />
          <Tab label="URL Params" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: COLORS.textSecondary, '&.Mui-selected': { color: COLORS.primary } }} />
          <Tab label="S2S Postback" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: COLORS.textSecondary, '&.Mui-selected': { color: COLORS.primary } }} />
          <Tab label="Browser Postback" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: COLORS.textSecondary, '&.Mui-selected': { color: COLORS.primary } }} />
        </Tabs>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth sx={fieldSx} />
              <TextField label="Internal ID" value={form.internal_id} onChange={(e) => setForm((f) => ({ ...f, internal_id: e.target.value }))} fullWidth sx={fieldSx} helperText="Used in URLs — lowercase, no spaces" />
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} fullWidth sx={fieldSx}>
                {TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
              <TextField label="Commission Rate (%)" type="number" value={form.commission_rate} onChange={(e) => setForm((f) => ({ ...f, commission_rate: e.target.value }))} fullWidth sx={fieldSx} />
              <TextField label="Logo URL" value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} fullWidth sx={fieldSx} helperText="Optional — image URL shown on frontend cards" />

              {form.type === 'iframe' ? (
                <TextField label="Iframe URL" value={form.iframe_url} onChange={(e) => setForm((f) => ({ ...f, iframe_url: e.target.value }))} fullWidth sx={fieldSx} />
              ) : (
                <TextField label="Endpoint URL" value={form.endpoint_url} onChange={(e) => setForm((f) => ({ ...f, endpoint_url: e.target.value }))} fullWidth sx={fieldSx} />
              )}

              <TextField label="Hash Algorithm" value={form.hash_algorithm} onChange={(e) => setForm((f) => ({ ...f, hash_algorithm: e.target.value }))} fullWidth sx={fieldSx} helperText="e.g. sha256, md5 — leave empty if provider doesn't use signatures" />
              <TextField label="Hash Key" value={form.hash_key} onChange={(e) => setForm((f) => ({ ...f, hash_key: e.target.value }))} fullWidth sx={fieldSx} helperText="Secret key for signature verification" />

              {/* NEW: Postback URL Display */}
              {postbackUrl && (
                <Box sx={{ mt: 1, p: 2, bgcolor: `${COLORS.primary}06`, borderRadius: 2, border: `1px dashed ${COLORS.primary}40` }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: COLORS.textPrimary, mb: 1 }}>
                    Postback URL — Give this to your provider:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: COLORS.primary, flex: 1, wordBreak: 'break-all' }}>
                      {postbackUrl}
                    </Typography>
                    <Button
                      onClick={() => navigator.clipboard.writeText(postbackUrl)}
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: '0.9rem' }} />}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5, minWidth: 0, whiteSpace: 'nowrap' }}
                    >
                      Copy
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.5 }}>
                Build the outgoing URL by mapping each query parameter the provider expects to a field on our side.
              </Typography>
              {form.url_params.map((row, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <TextField label="Param name" value={row.param} onChange={(e) => updateParamRow(i, 'param', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  <Select value={row.source} onChange={(e) => updateParamRow(i, 'source', e.target.value)} sx={{ ...fieldSx, flex: 1.5 }}>
                    {SOURCE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                  {row.source === 'static' && (
                    <TextField label="Value" value={row.value} onChange={(e) => updateParamRow(i, 'value', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  )}
                  <IconButton onClick={() => removeParamRow(i)} sx={{ color: COLORS.textMuted, mt: 0.5 }}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={addParamRow} variant="outlined" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 2 }}>
                Add parameter
              </Button>

              {editingId && (
                <Box sx={{ mt: 2 }}>
                  <Button onClick={handlePreview} disabled={previewLoading} variant="outlined" startIcon={<VisibilityOutlinedIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                    {previewLoading ? <CircularProgress size={18} /> : 'Preview URL'}
                  </Button>
                  {previewResult?.type === 'success' && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: `${COLORS.success}08`, borderRadius: 2, border: `1px solid ${COLORS.success}30`, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: COLORS.textPrimary, flex: 1, wordBreak: 'break-all' }}>
                        {previewResult.url}
                      </Typography>
                      <IconButton onClick={() => navigator.clipboard?.writeText(previewResult.url)} sx={{ color: COLORS.textSecondary }}>
                        <ContentCopyOutlinedIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>
                  )}
                  {previewResult?.type === 'error' && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{previewResult.msg}</Alert>}
                </Box>
              )}
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.5 }}>
                Server-to-server postback the provider sends when a survey completes — field names as the provider sends them.
              </Typography>
              <TextField label="Transaction ID field" value={form.s2s.transaction_id_field} onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, transaction_id_field: e.target.value } }))} fullWidth sx={fieldSx} helperText="e.g. transaction_id, tx_id, txn" />
              <TextField label="Sub ID field (optional)" value={form.s2s.sub_id_field} onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, sub_id_field: e.target.value } }))} fullWidth sx={fieldSx} helperText="Field that echoes our internal TXN-... ID" />
              <TextField label="Status field" value={form.s2s.status_field} onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, status_field: e.target.value } }))} fullWidth sx={fieldSx} />
              <TextField label="Payout field" value={form.s2s.payout_field} onChange={(e) => setForm((f) => ({ ...f, s2s: { ...f.s2s, payout_field: e.target.value } }))} fullWidth sx={fieldSx} />

              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: COLORS.textPrimary, mt: 1 }}>Status mapping (their value → our value)</Typography>
              {form.s2s.status_map.map((row, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <TextField label="Their value" value={row.key} onChange={(e) => updateMapRow(i, 'key', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  <Typography sx={{ color: COLORS.textMuted }}>→</Typography>
                  <TextField label="Our value" value={row.value} onChange={(e) => updateMapRow(i, 'value', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                  <IconButton onClick={() => removeMapRow(i)} sx={{ color: COLORS.textMuted }}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={addMapRow} variant="outlined" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 2 }}>
                Add mapping
              </Button>
            </Box>
          )}

          {tab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.5 }}>
                Browser redirect postback (used as a fallback/confirmation alongside S2S, or as the only signal for iframe walls).
              </Typography>
              <TextField label="Transaction ID field" value={form.browser.transaction_id_field} onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, transaction_id_field: e.target.value } }))} fullWidth sx={fieldSx} />
              <TextField label="Sub ID field (optional)" value={form.browser.sub_id_field} onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, sub_id_field: e.target.value } }))} fullWidth sx={fieldSx} />
              <TextField label="Payout field" value={form.browser.payout_field} onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, payout_field: e.target.value } }))} fullWidth sx={fieldSx} />
              <TextField label="Signature field" value={form.browser.signature_field} onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, signature_field: e.target.value } }))} fullWidth sx={fieldSx} helperText="e.g. hash, sig, signature" />
              <TextField label="Hash fields (comma-separated)" value={form.browser.hash_fields} onChange={(e) => setForm((f) => ({ ...f, browser: { ...f.browser, hash_fields: e.target.value } }))} fullWidth sx={fieldSx} helperText="Fields included in the signature, e.g. transaction_id, payout, status" />
            </Box>
          )}

          {saveError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{saveError}</Alert>}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: 'none', color: COLORS.textSecondary }}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="contained" sx={{ bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 4, '&:hover': { bgcolor: COLORS.primaryDark } }}>
            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : (editingId ? 'Save Changes' : 'Create Wall')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  )
}

export default AdminOfferWallsPage