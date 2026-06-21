import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Button, TextField, Switch,
  Alert, CircularProgress, Divider
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const AdminSettingsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [settings, setSettings] = useState({
    site_name: 'WWABCASH',
    site_tagline: 'Earn Rewards Daily',
    min_withdrawal: 1000,
    referral_percentage: 10,
    maintenance_mode: false,
    allow_registration: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get('/settings/')
      if (res.data.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }))
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await axiosInstance.put('/admin/settings', settings)
      setSuccess('Settings saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 700 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary, mb: 3 }}>
          Site Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Paper sx={{
          p: 3, borderRadius: 3,
          bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Site Name" value={settings.site_name}
              onChange={(e) => setSettings(p => ({ ...p, site_name: e.target.value }))}
              fullWidth size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
            />

            <TextField
              label="Site Tagline" value={settings.site_tagline}
              onChange={(e) => setSettings(p => ({ ...p, site_tagline: e.target.value }))}
              fullWidth size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
            />

            <TextField
              label="Minimum Withdrawal (points)" type="number"
              value={settings.min_withdrawal}
              onChange={(e) => setSettings(p => ({ ...p, min_withdrawal: parseInt(e.target.value) || 0 }))}
              fullWidth size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
            />

            <TextField
              label="Referral Percentage (%)" type="number"
              value={settings.referral_percentage}
              onChange={(e) => setSettings(p => ({ ...p, referral_percentage: parseInt(e.target.value) || 0 }))}
              fullWidth size="small"
              helperText="Percentage of referral earnings you pay out"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
            />

            <Divider sx={{ my: 1, borderColor: COLORS.border }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                  Maintenance Mode
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                  Disable site access for non-admin users
                </Typography>
              </Box>
              <Switch
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings(p => ({ ...p, maintenance_mode: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.primary },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: `${COLORS.primary}50` },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                  Allow Registration
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                  Let new users create accounts
                </Typography>
              </Box>
              <Switch
                checked={settings.allow_registration}
                onChange={(e) => setSettings(p => ({ ...p, allow_registration: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.primary },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: `${COLORS.primary}50` },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
                sx={{
                  bgcolor: COLORS.primary, color: '#fff',
                  fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 4,
                  '&:hover': { bgcolor: COLORS.primaryDark },
                  boxShadow: 'none',
                }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminSettingsPage