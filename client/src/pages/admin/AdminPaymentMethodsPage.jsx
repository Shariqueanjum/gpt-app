import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip, Switch,
  Skeleton, useMediaQuery, useTheme, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import { ErrorState, EmptyState } from '../../components/Admin/AdminUiKit'

const INITIAL_FORM = {
  name: '',
  code: '',
  min_amount: 0,
  max_amount: 50000,
  processing_fee: 0,
  instructions: '',
  display_order: 0,
  is_active: true,
  required_fields: [{ name: '', label: '', placeholder: '' }]
}

const AdminPaymentMethodsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchMethods = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminAxiosInstance.get('/admin/payment-methods')
      setMethods(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load payment methods')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMethods() }, [fetchMethods])

  const openCreate = () => {
    setEditingId(null)
    setForm(INITIAL_FORM)
    setDialogOpen(true)
  }

  const openEdit = (method) => {
    setEditingId(method.id)
    setForm({
      name: method.name,
      code: method.code,
      min_amount: method.min_amount,
      max_amount: method.max_amount,
      processing_fee: method.processing_fee,
      instructions: method.instructions || '',
      display_order: method.display_order || 0,
      is_active: method.is_active,
      required_fields: (method.required_fields || []).map(f => ({
        name: f.name || '',
        label: f.label || '',
        placeholder: f.placeholder || ''
      }))
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        required_fields: form.required_fields.filter(f => f.name.trim() && f.label.trim())
      }

      if (editingId) {
        await adminAxiosInstance.put(`/admin/payment-methods/${editingId}`, payload)
      } else {
        await adminAxiosInstance.post('/admin/payment-methods', payload)
      }
      setDialogOpen(false)
      fetchMethods()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await adminAxiosInstance.patch(`/admin/payment-methods/${id}/toggle`)
      fetchMethods()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminAxiosInstance.delete(`/admin/payment-methods/${deleteTarget.id}`)
      setDeleteTarget(null)
      fetchMethods()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete')
    }
  }

  const addField = () => {
    setForm(p => ({
      ...p,
      required_fields: [...p.required_fields, { name: '', label: '', placeholder: '' }]
    }))
  }

  const removeField = (idx) => {
    setForm(p => ({
      ...p,
      required_fields: p.required_fields.filter((_, i) => i !== idx)
    }))
  }

  const updateField = (idx, key, value) => {
    setForm(p => ({
      ...p,
      required_fields: p.required_fields.map((f, i) => i === idx ? { ...f, [key]: value } : f)
    }))
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 0.5 }}>
              Payment Methods
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
              Configure how users can withdraw their earnings
            </Typography>
          </Box>
          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 3,
              bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary }
            }}
          >
            Add Method
          </Button>
        </Box>

        {error && <ErrorState label={error} onRetry={fetchMethods} COLORS={COLORS} />}

        {!loading && methods.length === 0 ? (
          <EmptyState label="No payment methods configured yet." COLORS={COLORS} />
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {loading
              ? [1, 2, 3].map((i) => (
                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
                  <Skeleton variant="rounded" height={200} />
                </Paper>
              ))
              : methods.map((method) => (
                <Paper key={method.id} elevation={0} sx={{
                  p: 3, borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.cardBg,
                  opacity: method.is_active ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.textPrimary }}>
                      {method.name}
                    </Typography>
                    <Chip
                      label={method.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: method.is_active ? '#10b98115' : '#ef444415',
                        color: method.is_active ? '#10b981' : '#ef4444',
                        fontWeight: 700, fontSize: '0.7rem'
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Code</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textSecondary, fontFamily: 'monospace' }}>
                        {method.code}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Min Amount</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textPrimary }}>
                        ${method.min_amount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Max Amount</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textPrimary }}>
                        ${method.max_amount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Processing Fee</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textPrimary }}>
                        ${method.processing_fee}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Required Fields</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textPrimary }}>
                        {(method.required_fields || []).length}
                      </Typography>
                    </Box>
                  </Box>

                  {(method.required_fields || []).length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Required Fields
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                        {(method.required_fields || []).map((field, i) => (
                          <Chip
                            key={i}
                            label={`${field.label} (${field.name})`}
                            size="small"
                            sx={{
                              bgcolor: `${COLORS.primary}10`,
                              color: COLORS.primary,
                              fontSize: '0.7rem', fontWeight: 600
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {method.instructions && (
                    <Typography sx={{
                      fontSize: '0.78rem', color: COLORS.textMuted, mb: 2,
                      p: 1.5, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 2
                    }}>
                      {method.instructions}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Switch
                      checked={method.is_active}
                      onChange={() => handleToggle(method.id)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b98150' }
                      }}
                    />
                    <IconButton onClick={() => openEdit(method)} size="small" sx={{ color: COLORS.primary }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(method)} size="small" sx={{ color: '#ef4444' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
          </Box>
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: COLORS.cardBg } }}>
        <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
          {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              fullWidth size="small"
              disabled={!!editingId}
              helperText={editingId ? "Name cannot be changed" : "e.g., Google Pay, PhonePe"}
            />
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              fullWidth size="small"
              disabled={!!editingId}
              helperText={editingId ? "Code cannot be changed" : "Unique identifier: google_pay, phonepe"}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Min Amount ($)"
                type="number"
                value={form.min_amount}
                onChange={(e) => setForm(p => ({ ...p, min_amount: parseFloat(e.target.value) || 0 }))}
                fullWidth size="small"
              />
              <TextField
                label="Max Amount ($)"
                type="number"
                value={form.max_amount}
                onChange={(e) => setForm(p => ({ ...p, max_amount: parseFloat(e.target.value) || 0 }))}
                fullWidth size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Processing Fee ($)"
                type="number"
                value={form.processing_fee}
                onChange={(e) => setForm(p => ({ ...p, processing_fee: parseFloat(e.target.value) || 0 }))}
                fullWidth size="small"
              />
              <TextField
                label="Display Order"
                type="number"
                value={form.display_order}
                onChange={(e) => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                fullWidth size="small"
              />
            </Box>
            <TextField
              label="Instructions for User"
              value={form.instructions}
              onChange={(e) => setForm(p => ({ ...p, instructions: e.target.value }))}
              fullWidth size="small"
              multiline rows={2}
              helperText="Shown to user when they select this method"
            />

            <Divider sx={{ borderColor: COLORS.border }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.textPrimary }}>
                Required Fields for Withdrawal
              </Typography>
              <Button
                onClick={addField}
                size="small"
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none', color: COLORS.primary }}
              >
                Add Field
              </Button>
            </Box>

            {form.required_fields.map((field, idx) => (
              <Paper key={idx} elevation={0} sx={{
                p: 2, borderRadius: 2,
                border: `1px solid ${COLORS.border}`,
                bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
              }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.textMuted, minWidth: 24 }}>
                    #{idx + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeField(idx)}
                    size="small"
                    sx={{ color: '#ef4444', ml: 'auto' }}
                    disabled={form.required_fields.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Field Name (code)"
                    value={field.name}
                    onChange={(e) => updateField(idx, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    size="small"
                    placeholder="upi_id"
                    helperText="Used in code: upi_id, bank_name"
                  />
                  <TextField
                    label="Field Label"
                    value={field.label}
                    onChange={(e) => updateField(idx, 'label', e.target.value)}
                    size="small"
                    placeholder="UPI ID"
                    helperText="Shown to user"
                  />
                  <TextField
                    label="Placeholder"
                    value={field.placeholder}
                    onChange={(e) => updateField(idx, 'placeholder', e.target.value)}
                    size="small"
                    placeholder="name@upi"
                    helperText="Input hint"
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: COLORS.textMuted, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.name || !form.code}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: COLORS.primary, textTransform: 'none', borderRadius: 2 }}
          >
            {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: COLORS.cardBg } }}>
        <DialogTitle sx={{ color: '#ef4444', fontWeight: 700 }}>Delete Payment Method?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: COLORS.textSecondary }}>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: COLORS.textMuted, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  )
}

export default AdminPaymentMethodsPage