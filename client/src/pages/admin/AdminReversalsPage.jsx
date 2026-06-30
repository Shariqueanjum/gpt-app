import { useState, useRef } from 'react'
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'

const SectionCard = ({ icon: Icon, title, subtitle, color, children, COLORS }) => (
  <Paper elevation={0} sx={{
    p: 2.6, borderRadius: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg, height: '100%',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 2, bgcolor: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        <Icon sx={{ fontSize: '1.1rem' }} />
      </Box>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.textPrimary }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted, mb: 2 }}>{subtitle}</Typography>
    {children}
  </Paper>
)

const ResultBox = ({ result, COLORS }) => {
  if (!result) return null
  return (
    <Alert severity={result.type} sx={{ mt: 2, borderRadius: 2, fontSize: '0.82rem' }}>
      {result.msg}
    </Alert>
  )
}

const AdminReversalsPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)

  // Manual reversal
  const [txnId, setTxnId] = useState('')
  const [reverseReason, setReverseReason] = useState('')
  const [reverseLoading, setReverseLoading] = useState(false)
  const [reverseResult, setReverseResult] = useState(null)

  // Undo
  const [clickId, setClickId] = useState('')
  const [undoLoading, setUndoLoading] = useState(false)
  const [undoResult, setUndoResult] = useState(null)

  // Bulk
  const fileRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)

  const handleManualReverse = async () => {
    if (!txnId.trim()) return
    setReverseLoading(true); setReverseResult(null)
    try {
      const res = await adminAxiosInstance.post('/admin/reversals/manual', {
        transaction_id: txnId.trim(), reason: reverseReason.trim() || undefined,
      })
      const d = res.data?.data
      setReverseResult({ type: 'success', msg: `Reversed ₹${d.amount} for ${d.username} (matched by ${d.found_by})` })
      setTxnId(''); setReverseReason('')
    } catch (err) {
      setReverseResult({ type: 'error', msg: err.response?.data?.message || 'Reversal failed' })
    } finally {
      setReverseLoading(false)
    }
  }

  const handleUndo = async () => {
    if (!clickId.trim()) return
    setUndoLoading(true); setUndoResult(null)
    try {
      const res = await adminAxiosInstance.post('/admin/reversals/undo', { survey_click_id: clickId.trim() })
      const d = res.data?.data
      setUndoResult({ type: 'success', msg: `Undo successful — ₹${d.amount_restored} restored for click #${d.survey_click_id}` })
      setClickId('')
    } catch (err) {
      setUndoResult({ type: 'error', msg: err.response?.data?.message || 'Undo failed' })
    } finally {
      setUndoLoading(false)
    }
  }

  const handleBulkUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setBulkLoading(true); setBulkResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await adminAxiosInstance.post('/admin/reversals/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const d = res.data?.data
      setBulkResult({
        type: d.skipped > 0 ? 'warning' : 'success',
        msg: `Processed ${d.processed}, skipped ${d.skipped}${d.errors?.length ? ` — first error: ${d.errors[0].transaction_id}: ${d.errors[0].error}` : ''}`,
      })
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setBulkResult({ type: 'error', msg: err.response?.data?.message || 'Bulk upload failed' })
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Reversals
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          Claw back rewards for surveys a provider later marked as rejected/fraudulent
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <SectionCard icon={GavelOutlinedIcon} color="#ef4444" COLORS={COLORS}
          title="Manual reversal" subtitle="Deducts the payout for a single transaction by its internal or external ID">
          <TextField fullWidth size="small" label="Transaction ID" value={txnId}
            onChange={(e) => setTxnId(e.target.value)} sx={{ mb: 1.5 }} />
          <TextField fullWidth size="small" label="Reason (optional)" value={reverseReason}
            onChange={(e) => setReverseReason(e.target.value)} sx={{ mb: 1.5 }} />
          <Button onClick={handleManualReverse} disabled={!txnId.trim() || reverseLoading} variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
            {reverseLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Reverse transaction'}
          </Button>
          <ResultBox result={reverseResult} COLORS={COLORS} />
        </SectionCard>

        <SectionCard icon={UndoOutlinedIcon} color="#10b981" COLORS={COLORS}
          title="Undo a reversal" subtitle="Restores the payout if a reversal turns out to have been a mistake">
          <TextField fullWidth size="small" label="Survey click ID" value={clickId}
            onChange={(e) => setClickId(e.target.value)} sx={{ mb: 1.5 }} />
          <Button onClick={handleUndo} disabled={!clickId.trim() || undoLoading} variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            {undoLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Undo reversal'}
          </Button>
          <ResultBox result={undoResult} COLORS={COLORS} />
        </SectionCard>

        <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 2' } }}>
          <SectionCard icon={UploadFileOutlinedIcon} color={COLORS.primary} COLORS={COLORS}
            title="Bulk reversal (CSV)" subtitle="CSV with a transaction_id column (required); amount, date, reason, survey_id are optional and ignored beyond logging">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button component="label" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2.5, borderColor: COLORS.border, color: COLORS.textSecondary }}>
                Choose file
                <input ref={fileRef} type="file" accept=".csv,.txt" hidden
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
              </Button>
              <Typography sx={{ fontSize: '0.82rem', color: COLORS.textMuted }}>
                {fileName || 'No file selected'}
              </Typography>
              <Button onClick={handleBulkUpload} disabled={!fileName || bulkLoading} variant="contained"
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, ml: 'auto', bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primary } }}>
                {bulkLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Upload & process'}
              </Button>
            </Box>
            <ResultBox result={bulkResult} COLORS={COLORS} />
          </SectionCard>
        </Box>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminReversalsPage