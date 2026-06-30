import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, TextField, Button, Paper, Skeleton, Snackbar, Alert } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import { ErrorState } from '../../components/Admin/AdminUiKit'

// Every field here mirrors ALLOWED_SETTINGS_KEYS on the backend exactly —
// nothing here is invented, and nothing else can be sent.
const FIELDS = [
  { key: 'site_name', label: 'Site name', type: 'text', help: 'Shown across emails and the public site' },
  { key: 'min_withdrawal_points', label: 'Minimum withdrawal (points)', type: 'number', help: 'Lowest amount a user can request' },
  { key: 'lock_threshold_points', label: 'Balance lock threshold (points)', type: 'number', help: 'Above this, new earnings are held for review' },
  { key: 'referral_commission_percent', label: 'Referral commission (%)', type: 'number', help: 'Cut a referrer earns from their referrals' },
  { key: 'daily_bonus_points', label: 'Daily login bonus (points)', type: 'number', help: 'Awarded once per day on login' },
  { key: 'points_to_dollar_rate', label: 'Points per ₹1', type: 'number', help: 'Conversion rate used everywhere money is shown' },
]

const AdminSettingsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [values, setValues] = useState({})
  const [original, setOriginal] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await adminAxiosInstance.get('/settings')
      const data = res.data?.data || {}
      const asStrings = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      setValues(asStrings)
      setOriginal(asStrings)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const changedKeys = Object.keys(values).filter((k) => values[k] !== original[k])
  const hasChanges = changedKeys.length > 0

  const handleSave = async () => {
    if (!hasChanges) return
    setSaving(true)
    try {
      const settings = Object.fromEntries(changedKeys.map((k) => [k, values[k]]))
      await adminAxiosInstance.put('/admin/settings', { settings })
      setOriginal((prev) => ({ ...prev, ...settings }))
      setToast({ type: 'success', msg: 'Settings updated successfully' })
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
            Platform Settings
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
            Live values used across the entire platform — changes apply immediately
          </Typography>
        </Box>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          startIcon={<SaveIcon />}
          variant="contained"
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 3,
            bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary },
          }}
        >
          {saving ? 'Saving…' : hasChanges ? `Save ${changedKeys.length} change${changedKeys.length > 1 ? 's' : ''}` : 'Saved'}
        </Button>
      </Box>

      {error ? (
        <ErrorState label={error} onRetry={fetchSettings} COLORS={COLORS} />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {FIELDS.map((field) => (
            <Paper key={field.key} elevation={0} sx={{
              p: 2.2, borderRadius: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg,
            }}>
              {loading ? (
                <Skeleton variant="rounded" height={70} />
              ) : (
                <>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.textPrimary, mb: 0.3 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted, mb: 1.2 }}>
                    {field.help}
                  </Typography>
                  <TextField
                    fullWidth size="small" type={field.type}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderColor: values[field.key] !== original[field.key] ? COLORS.primary : undefined,
                      },
                    }}
                  />
                </>
              )}
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast?.type} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </AdminPageWrapper>
  )
}

export default AdminSettingsPage