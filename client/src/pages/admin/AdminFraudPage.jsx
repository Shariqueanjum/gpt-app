import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Skeleton, Collapse, IconButton, TextField, Avatar } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import { useDebouncedValue, FilterSelect, StatusPill, EmptyState, ErrorState, TableShell, TableScroll } from '../../components/Admin/AdminUiKit'

const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }
const RISK_OPTIONS = [
  { value: '', label: 'All risk levels' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const AdminFraudPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [minScore, setMinScore] = useState('0')
  const debouncedMinScore = useDebouncedValue(minScore, 500)
  const [riskLevel, setRiskLevel] = useState('')
  const [rows, setRows] = useState([])
  const [scanMeta, setScanMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = {}
      if (debouncedMinScore) params.min_score = debouncedMinScore
      if (riskLevel) params.risk_level = riskLevel
      const res = await adminAxiosInstance.get('/admin/fraud/dashboard', { params })
      setRows(res.data?.data || [])
      setScanMeta(res.data?.meta || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not run fraud scan')
    } finally {
      setLoading(false)
    }
  }, [debouncedMinScore, riskLevel])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Fraud Detection
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          {scanMeta ? `${scanMeta.flagged_count} flagged of ${scanMeta.total_scanned} scanned users` : 'Scanning…'}
          {' '}· device sharing, duplicate payout details, impossible survey speed, rapid sign-ups, deep referral trees
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <TextField
          size="small" type="number" label="Min score" value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          sx={{ width: 130, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
        />
        <FilterSelect value={riskLevel} onChange={setRiskLevel} options={RISK_OPTIONS} COLORS={COLORS} minWidth={170} />
      </Box>

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={fetchData} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No users match this filter — looking clean" COLORS={COLORS} />
        ) : (
          <TableScroll>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['User', 'Score', 'Risk', 'Flags', ''].map((h) => (
                    <Box component="th" key={h} sx={{
                      textAlign: 'left', px: 2, py: 1.4, fontSize: '0.74rem', fontWeight: 700,
                      color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {loading
                  ? [...Array(6)].map((_, i) => (
                    <Box component="tr" key={i} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <Box component="td" colSpan={5} sx={{ px: 2, py: 1.6 }}><Skeleton variant="rounded" height={30} /></Box>
                    </Box>
                  ))
                  : rows.map((u) => {
                    const color = RISK_COLORS[u.risk_level] || '#6b7280'
                    const isOpen = expandedId === u.user_id
                    return (
                      <Box component="tr" key={u.user_id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <Box component="td" colSpan={5} sx={{ p: 0 }}>
                          <Box onClick={() => setExpandedId(isOpen ? null : u.user_id)} sx={{
                            display: 'flex', alignItems: 'center', cursor: 'pointer',
                            '&:hover': { bgcolor: `${COLORS.primary}05` },
                          }}>
                            <Box sx={{ px: 2, py: 1.3, display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 200 }}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: '0.74rem', bgcolor: color }}>
                                {u.username?.[0]?.toUpperCase() || '?'}
                              </Avatar>
                              <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: COLORS.textPrimary }}>
                                {u.username}
                              </Typography>
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, minWidth: 90 }}>
                              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color }}>
                                {u.score}
                              </Typography>
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, minWidth: 110 }}>
                              <StatusPill label={u.risk_level} color={color} />
                            </Box>
                            <Box sx={{ px: 2, py: 1.3, fontSize: '0.78rem', color: COLORS.textMuted }}>
                              {u.flags?.length || 0} flag{u.flags?.length === 1 ? '' : 's'}
                            </Box>
                            <Box sx={{ px: 1, py: 1.3, ml: 'auto' }}>
                              <IconButton size="small">
                                <ExpandMoreIcon fontSize="small" sx={{
                                  color: COLORS.textMuted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s',
                                }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Collapse in={isOpen}>
                            <Box sx={{ px: 2, pb: 1.6, display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {(u.flags || []).map((flag, i) => (
                                <Box key={i} sx={{
                                  display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.3,
                                  borderRadius: 2, bgcolor: `${RISK_COLORS[flag.severity === 'high' ? 'critical' : 'medium'] || '#6b7280'}0c`,
                                }}>
                                  <WarningAmberOutlinedIcon sx={{ fontSize: '1rem', color: flag.severity === 'high' ? '#ef4444' : '#f59e0b', mt: 0.2 }} />
                                  <Box>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.textPrimary, textTransform: 'capitalize' }}>
                                      {flag.type?.replace(/_/g, ' ')} — {flag.severity}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>
                                      {flag.message}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </Collapse>
                        </Box>
                      </Box>
                    )
                  })}
              </Box>
            </Box>
          </TableScroll>
        )}
      </TableShell>
    </AdminPageWrapper>
  )
}

export default AdminFraudPage