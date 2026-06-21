import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, Skeleton, Switch, Divider,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Alert, CircularProgress,
  TextField, MenuItem, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const WALL_TYPES = [
  { value: 'iframe', label: 'Iframe' },
  { value: 'api', label: 'API' },
  { value: 'router', label: 'Router' },
]

const AUTH_METHODS = [
  { value: 'none', label: 'No Auth' },
  { value: 'api_key', label: 'API Key (Header or Query)' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'oauth2', label: 'OAuth 2.0 (Two-step)' },
]

const AdminOfferWallsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [offerWalls, setOfferWalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [editingWall, setEditingWall] = useState(null)

  // Basic fields
  const [formData, setFormData] = useState({
    name: '', internal_id: '', type: 'api', endpoint_url: '', iframe_url: '',
    description: '', category: 'survey', min_level: 0, is_active: true,
    // API Integration config (for zero-code deployment)
    config: {
      auth_method: 'none',
      api_key: '',
      api_key_location: 'header', // 'header' or 'query'
      api_key_header_name: 'X-API-Key',
      bearer_token: '',
      username: '', // basic auth
      password: '', // basic auth
      // Two-step OAuth
      token_url: '',
      token_method: 'POST',
      token_headers: '', // JSON string
      token_body: '', // JSON string
      token_response_path: 'access_token', // e.g., "data.token" or "access_token"
      // Request config
      request_method: 'GET',
      request_headers: '', // JSON string
      request_params: '', // JSON string - {user_id: "{{user_id}}", country: "{{country}}"}
      // Response mapping
      response_path: '', // e.g., "data.surveys" or "surveys"
      field_mapping: {
        survey_id: 'survey_id',
        survey_name: 'survey_name',
        title: 'title',
        description: 'description',
        cpa: 'cpa',
        payout: 'payout',
        reward: 'reward',
        loi: 'loi',
        length_of_interview: 'length_of_interview',
        estimated_time: 'estimated_time',
        category: 'category',
        country: 'country',
        survey_url: 'survey_url', // or 'url' or 'link'
        url: 'url',
        link: 'link',
      },
      // Postback config (moves from callback_config)
      postback_config: {
        transaction_id_field: 'transaction_id',
        sub_id_field: 'sub_id',
        status_field: 'status',
        payout_field: 'payout',
        status_map: { completed: 'success', rejected: 'failed' },
      }
    }
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchOfferWalls() }, [])

  const fetchOfferWalls = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/admin/offer-walls')
      setOfferWalls(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load offer walls')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const payload = {
        name: formData.name,
        internal_id: formData.internal_id,
        type: formData.type,
        endpoint_url: formData.endpoint_url,
        iframe_url: formData.iframe_url,
        description: formData.description,
        category: formData.category,
        min_level: parseInt(formData.min_level) || 0,
        is_active: formData.is_active,
        config: formData.config,
      }

      if (editingWall) {
        await axiosInstance.put(`/admin/offer-walls/${editingWall.id}`, payload)
        setSuccess('Offer wall updated successfully')
      } else {
        await axiosInstance.post('/admin/offer-walls', payload)
        setSuccess('Offer wall created successfully')
      }

      setDialogOpen(false)
      setEditingWall(null)
      fetchOfferWalls()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save offer wall')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (wall) => {
    try {
      await axiosInstance.put(`/admin/offer-walls/${wall.id}`, {
        is_active: !wall.is_active
      })
      setSuccess(`Offer wall ${!wall.is_active ? 'activated' : 'deactivated'}`)
      fetchOfferWalls()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update offer wall')
    }
  }

  const openCreate = () => {
    setEditingWall(null)
    setFormData({
      name: '', internal_id: '', type: 'api', endpoint_url: '', iframe_url: '',
      description: '', category: 'survey', min_level: 0, is_active: true,
      config: {
        auth_method: 'none',
        api_key: '',
        api_key_location: 'header',
        api_key_header_name: 'X-API-Key',
        bearer_token: '',
        username: '',
        password: '',
        token_url: '',
        token_method: 'POST',
        token_headers: '',
        token_body: '',
        token_response_path: 'access_token',
        request_method: 'GET',
        request_headers: '',
        request_params: '',
        response_path: '',
        field_mapping: {
          survey_id: 'survey_id',
          survey_name: 'survey_name',
          title: 'title',
          description: 'description',
          cpa: 'cpa',
          payout: 'payout',
          reward: 'reward',
          loi: 'loi',
          length_of_interview: 'length_of_interview',
          estimated_time: 'estimated_time',
          category: 'category',
          country: 'country',
          survey_url: 'survey_url',
          url: 'url',
          link: 'link',
        },
        postback_config: {
          transaction_id_field: 'transaction_id',
          sub_id_field: 'sub_id',
          status_field: 'status',
          payout_field: 'payout',
          status_map: { completed: 'success', rejected: 'failed' },
        }
      }
    })
    setActiveTab(0)
    setDialogOpen(true)
  }

  const openEdit = (wall) => {
    setEditingWall(wall)
    setFormData({
      name: wall.name || '',
      internal_id: wall.internal_id || '',
      type: wall.type || 'api',
      endpoint_url: wall.endpoint_url || '',
      iframe_url: wall.iframe_url || '',
      description: wall.description || '',
      category: wall.category || 'survey',
      min_level: wall.min_level || 0,
      is_active: wall.is_active !== false,
      config: wall.config || {
        auth_method: 'none',
        api_key: '',
        api_key_location: 'header',
        api_key_header_name: 'X-API-Key',
        bearer_token: '',
        username: '',
        password: '',
        token_url: '',
        token_method: 'POST',
        token_headers: '',
        token_body: '',
        token_response_path: 'access_token',
        request_method: 'GET',
        request_headers: '',
        request_params: '',
        response_path: '',
        field_mapping: {
          survey_id: 'survey_id',
          survey_name: 'survey_name',
          title: 'title',
          description: 'description',
          cpa: 'cpa',
          payout: 'payout',
          reward: 'reward',
          loi: 'loi',
          length_of_interview: 'length_of_interview',
          estimated_time: 'estimated_time',
          category: 'category',
          country: 'country',
          survey_url: 'survey_url',
          url: 'url',
          link: 'link',
        },
        postback_config: {
          transaction_id_field: 'transaction_id',
          sub_id_field: 'sub_id',
          status_field: 'status',
          payout_field: 'payout',
          status_map: { completed: 'success', rejected: 'failed' },
        }
      }
    })
    setActiveTab(0)
    setDialogOpen(true)
  }

  const updateConfig = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.')
      const newConfig = { ...prev.config }
      let current = newConfig
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return { ...prev, config: newConfig }
    })
  }

  const updateFieldMapping = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        field_mapping: {
          ...prev.config.field_mapping,
          [key]: value
        }
      }
    }))
  }

  const updatePostbackConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        postback_config: {
          ...prev.config.postback_config,
          [key]: value
        }
      }
    }))
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary }}>
            Offer Walls
          </Typography>
          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: COLORS.primary, color: '#fff',
              fontWeight: 700, textTransform: 'none', borderRadius: 2,
              '&:hover': { bgcolor: COLORS.primaryDark },
              boxShadow: 'none',
            }}
          >
            Add Offer Wall
          </Button>
        </Box>

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

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
          {loading ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={60} />)}
            </Box>
          ) : offerWalls.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: COLORS.textSecondary }}>No offer walls configured</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {offerWalls.map((wall) => (
                <Box key={wall.id} sx={{
                  p: 2.5,
                  borderBottom: `1px solid ${COLORS.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 2,
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      bgcolor: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.primary, fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      {wall.name?.[0]?.toUpperCase()}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                        {wall.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
                        {wall.internal_id} · {wall.type} · Min Level {wall.min_level || 0}
                        {wall.config?.auth_method && wall.config.auth_method !== 'none' && ` · Auth: ${wall.config.auth_method}`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip size="small" label={wall.type.toUpperCase()} sx={{
                      bgcolor: wall.type === 'iframe' ? `${COLORS.primary}12` : wall.type === 'api' ? `${COLORS.accent}12` : `${COLORS.gold}12`,
                      color: wall.type === 'iframe' ? COLORS.primary : wall.type === 'api' ? COLORS.accent : COLORS.gold,
                      fontWeight: 700, fontSize: '0.65rem'
                    }} />
                    <Switch
                      checked={wall.is_active !== false}
                      onChange={() => handleToggleActive(wall)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.primary },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: `${COLORS.primary}50` },
                      }}
                    />
                    <IconButton size="small" onClick={() => openEdit(wall)} sx={{ color: COLORS.primary }}>
                      <EditIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            {editingWall ? 'Edit Offer Wall' : 'Add Offer Wall'}
          </DialogTitle>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${COLORS.border}`,
              px: 3,
              '& .MuiTabs-indicator': { bgcolor: COLORS.primary },
              '& .MuiTab-root': {
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                '&.Mui-selected': { color: COLORS.primary, fontWeight: 700 }
              }
            }}
          >
            <Tab label="Basic Info" />
            <Tab label="API Integration" />
            <Tab label="Field Mapping" />
            <Tab label="Postback" />
          </Tabs>

          <DialogContent>
            {/* Tab 1: Basic Info */}
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <TextField
                  label="Name" value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Internal ID" value={formData.internal_id}
                  onChange={(e) => setFormData(p => ({ ...p, internal_id: e.target.value }))}
                  fullWidth size="small" disabled={!!editingWall}
                  helperText="Unique identifier, cannot be changed later. Used in URL: /earn?wall=xxx"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  select label="Type" value={formData.type}
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                  fullWidth size="small"
                  helperText="API = fetch surveys from their API. Iframe = embed their page. Router = redirect to their URL."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                >
                  {WALL_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </TextField>
                <TextField
                  label="Endpoint URL" value={formData.endpoint_url}
                  onChange={(e) => setFormData(p => ({ ...p, endpoint_url: e.target.value }))}
                  fullWidth size="small"
                  placeholder="https://api.client.com/surveys"
                  helperText="For API/Router: the URL to call. For Iframe: leave empty."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Iframe URL" value={formData.iframe_url}
                  onChange={(e) => setFormData(p => ({ ...p, iframe_url: e.target.value }))}
                  fullWidth size="small"
                  placeholder="https://client.com/iframe"
                  helperText="Only for iframe type. The URL to load in the iframe."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Description" value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  fullWidth size="small" multiline rows={2}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Category" value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                  fullWidth size="small"
                  helperText="survey, game, offer, etc."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Minimum Level" type="number" value={formData.min_level}
                  onChange={(e) => setFormData(p => ({ ...p, min_level: parseInt(e.target.value) || 0 }))}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
              </Box>
            )}

            {/* Tab 2: API Integration */}
            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                  Configure how to call the client API. This enables zero-code deployment — no backend changes needed for new clients.
                </Alert>

                <TextField
                  select label="Authentication Method" value={formData.config.auth_method}
                  onChange={(e) => updateConfig('auth_method', e.target.value)}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                >
                  {AUTH_METHODS.map(a => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                </TextField>

                {formData.config.auth_method === 'api_key' && (
                  <>
                    <TextField
                      label="API Key" value={formData.config.api_key}
                      onChange={(e) => updateConfig('api_key', e.target.value)}
                      fullWidth size="small" type="password"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                    <TextField
                      select label="API Key Location" value={formData.config.api_key_location}
                      onChange={(e) => updateConfig('api_key_location', e.target.value)}
                      fullWidth size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    >
                      <MenuItem value="header">HTTP Header</MenuItem>
                      <MenuItem value="query">Query Parameter</MenuItem>
                    </TextField>
                    <TextField
                      label="Header/Param Name" value={formData.config.api_key_header_name}
                      onChange={(e) => updateConfig('api_key_header_name', e.target.value)}
                      fullWidth size="small"
                      placeholder="X-API-Key or api_key"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                  </>
                )}

                {formData.config.auth_method === 'bearer' && (
                  <TextField
                    label="Bearer Token" value={formData.config.bearer_token}
                    onChange={(e) => updateConfig('bearer_token', e.target.value)}
                    fullWidth size="small" type="password"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                  />
                )}

                {formData.config.auth_method === 'basic' && (
                  <>
                    <TextField
                      label="Username" value={formData.config.username}
                      onChange={(e) => updateConfig('username', e.target.value)}
                      fullWidth size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                    <TextField
                      label="Password" value={formData.config.password}
                      onChange={(e) => updateConfig('password', e.target.value)}
                      fullWidth size="small" type="password"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                  </>
                )}

                {formData.config.auth_method === 'oauth2' && (
                  <>
                    <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                      Two-step OAuth: First call token_url to get access_token, then call the main API with that token.
                    </Alert>
                    <TextField
                      label="Token URL" value={formData.config.token_url}
                      onChange={(e) => updateConfig('token_url', e.target.value)}
                      fullWidth size="small"
                      placeholder="https://api.client.com/oauth/token"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                    <TextField
                      select label="Token Request Method" value={formData.config.token_method}
                      onChange={(e) => updateConfig('token_method', e.target.value)}
                      fullWidth size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    >
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                    </TextField>
                    <TextField
                      label="Token Request Headers (JSON)" value={formData.config.token_headers}
                      onChange={(e) => updateConfig('token_headers', e.target.value)}
                      fullWidth size="small" multiline rows={2}
                      placeholder='{"Content-Type": "application/json"}'
                      helperText="JSON object of headers for token request"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                    <TextField
                      label="Token Request Body (JSON)" value={formData.config.token_body}
                      onChange={(e) => updateConfig('token_body', e.target.value)}
                      fullWidth size="small" multiline rows={2}
                      placeholder='{"grant_type": "client_credentials", "client_id": "xxx", "client_secret": "xxx"}'
                      helperText="JSON body for POST token request"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                    <TextField
                      label="Token Response Path" value={formData.config.token_response_path}
                      onChange={(e) => updateConfig('token_response_path', e.target.value)}
                      fullWidth size="small"
                      placeholder="access_token or data.token"
                      helperText="Dot-notation path to extract token from response. E.g., 'data.access_token' or just 'access_token'"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                  </>
                )}

                <Divider sx={{ my: 1, borderColor: COLORS.border }} />

                <TextField
                  select label="Request Method" value={formData.config.request_method}
                  onChange={(e) => updateConfig('request_method', e.target.value)}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                </TextField>

                <TextField
                  label="Request Headers (JSON)" value={formData.config.request_headers}
                  onChange={(e) => updateConfig('request_headers', e.target.value)}
                  fullWidth size="small" multiline rows={2}
                  placeholder='{"Accept": "application/json"}'
                  helperText="Additional headers for the survey API call"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />

                <TextField
                  label="Request Params (JSON)" value={formData.config.request_params}
                  onChange={(e) => updateConfig('request_params', e.target.value)}
                  fullWidth size="small" multiline rows={3}
                  placeholder='{"user_id": "{{user_id}}", "country": "{{country}}", "age": "{{age}}"}'
                  helperText="Use {{user_id}}, {{country}}, {{age}}, {{gender}} as placeholders. They will be replaced with actual user data."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />

                <TextField
                  label="Response Data Path" value={formData.config.response_path}
                  onChange={(e) => updateConfig('response_path', e.target.value)}
                  fullWidth size="small"
                  placeholder="data.surveys or surveys"
                  helperText="Dot-notation path to the array of surveys in the response. Leave empty if response IS the array."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
              </Box>
            )}

            {/* Tab 3: Field Mapping */}
            {activeTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                  Map the client's API response fields to our standard fields. This tells the backend how to read their survey data.
                </Alert>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2
                }}>
                  {Object.entries(formData.config.field_mapping).map(([key, value]) => (
                    <TextField
                      key={key}
                      label={key.replace(/_/g, ' ').replace(/\w/g, l => l.toUpperCase())}
                      value={value}
                      onChange={(e) => updateFieldMapping(key, e.target.value)}
                      size="small"
                      placeholder={`Their field name for ${key}`}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Tab 4: Postback */}
            {activeTab === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                  Configure how to receive and validate postback/callback notifications from the client when a survey completes.
                </Alert>

                <TextField
                  label="Transaction ID Field" value={formData.config.postback_config.transaction_id_field}
                  onChange={(e) => updatePostbackConfig('transaction_id_field', e.target.value)}
                  fullWidth size="small"
                  helperText="The field name they send in postback that contains our transaction ID"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Sub ID Field" value={formData.config.postback_config.sub_id_field}
                  onChange={(e) => updatePostbackConfig('sub_id_field', e.target.value)}
                  fullWidth size="small"
                  helperText="The field containing our sub_id (usually user_id)"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Status Field" value={formData.config.postback_config.status_field}
                  onChange={(e) => updatePostbackConfig('status_field', e.target.value)}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Payout Field" value={formData.config.postback_config.payout_field}
                  onChange={(e) => updatePostbackConfig('payout_field', e.target.value)}
                  fullWidth size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
                <TextField
                  label="Status Map (JSON)" value={JSON.stringify(formData.config.postback_config.status_map)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      updatePostbackConfig('status_map', parsed)
                    } catch { /* ignore invalid JSON */ }
                  }}
                  fullWidth size="small" multiline rows={2}
                  helperText='Map their status values to ours: {"completed": "success", "rejected": "failed"}'
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.internal_id}
              variant="contained"
              sx={{
                bgcolor: COLORS.primary, color: '#fff', textTransform: 'none', fontWeight: 700,
                borderRadius: 2, '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.textMuted }
              }}
            >
              {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : (editingWall ? 'Save Changes' : 'Create')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminOfferWallsPage