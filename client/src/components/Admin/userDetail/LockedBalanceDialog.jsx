import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Button, Checkbox,
  CircularProgress, Alert, Divider, useMediaQuery, useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import adminAxiosInstance from '../../../utils/adminAxiosInstance'
import PointsCell from './PointsCell'
import { StatusPill, EmptyState, ErrorState } from '../AdminUiKit'
import { formatPoints, formatDollar, formatDate } from './userDetailFormat'

const AMBER = '#f59e0b'
const GREEN = '#10b981'

const apiError = (err, fallback) => {
  const msg = err.response?.data?.message
  return Array.isArray(msg) ? msg.join(', ') : msg || fallback
}

const itemTitle = (item) =>
  item.original_type === 'referral' || item.type === 'referral'
    ? `Referral commission${item.referred_username ? ` from ${item.referred_username}` : ''}`
    : item.survey_name || 'Survey'

/**
 * Locked balance manager.
 *  - Unlock: moves locked points to the main balance (withdrawable)
 *  - Undo:   moves an unlocked amount back to locked (only while the user still has it)
 * Every action asks for a confirmation first and is recorded in the audit log.
 */
const LockedBalanceDialog = ({ open, onClose, userId, username, COLORS, onChanged }) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selected, setSelected] = useState(() => new Set())
  const [confirm, setConfirm] = useState(null) // { kind:'selected'|'all'|'undo', ... }
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setLoadError(null)
    try {
      const res = await adminAxiosInstance.get(`/admin/users/${userId}/locked`)
      setData(res.data?.data || null)
      setSelected(new Set())
    } catch (err) {
      setLoadError(apiError(err, 'Failed to load locked items'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (open) {
      setConfirm(null); setActionError(''); setSuccess('')
      load()
    }
  }, [open, load])

  const items = useMemo(() => data?.items || [], [data])
  const undoable = useMemo(() => data?.undoable_unlocks || [], [data])

  const selectedTotal = useMemo(
    () => items.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.amount, 0),
    [items, selected]
  )
  const allSelected = items.length > 0 && selected.size === items.length

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))

  const runConfirmed = async () => {
    if (!confirm) return
    setBusy(true); setActionError(''); setSuccess('')
    try {
      let res
      if (confirm.kind === 'undo') {
        res = await adminAxiosInstance.post(`/admin/users/${userId}/locked/undo`, { unlock_transaction_id: confirm.item.id })
      } else if (confirm.kind === 'all') {
        res = await adminAxiosInstance.post(`/admin/users/${userId}/locked/unlock`, { all: true })
      } else {
        res = await adminAxiosInstance.post(`/admin/users/${userId}/locked/unlock`, { transaction_ids: [...selected] })
      }
      setSuccess(res.data?.message || 'Done')
      setConfirm(null)
      await load()
      onChanged?.()
    } catch (err) {
      setActionError(apiError(err, 'Action failed'))
      setConfirm(null)
    } finally {
      setBusy(false)
    }
  }

  const confirmText = () => {
    if (!confirm) return ''
    if (confirm.kind === 'undo') {
      return `Move ${formatPoints(confirm.item.amount)} (${formatDollar(confirm.item.amount)}) back from the main balance to locked?`
    }
    const pts = confirm.kind === 'all' ? data.items_total : selectedTotal
    return `Move ${formatPoints(pts)} (${formatDollar(pts)}) from locked to the main balance? ${username} will be able to withdraw it.`
  }

  const sectionTitle = (text, sub) => (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: COLORS.textPrimary }}>{text}</Typography>
      {sub && <Typography sx={{ fontSize: '0.74rem', color: COLORS.textMuted }}>{sub}</Typography>}
    </Box>
  )

  const row = (key, left, right, extra) => (
    <Box key={key} sx={{
      display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 2,
      border: `1px solid ${COLORS.border}`, bgcolor: COLORS.bg,
    }}>
      {left}
      <Box sx={{ flex: 1, minWidth: 0 }}>{right}</Box>
      {extra}
    </Box>
  )

  const describe = (item, dateValue) => (
    <>
      <Typography noWrap sx={{ fontSize: '0.84rem', fontWeight: 700, color: COLORS.textPrimary }}>{itemTitle(item)}</Typography>
      <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
        {[item.provider, formatDate(dateValue)].filter(Boolean).join(' · ')}
      </Typography>
    </>
  )

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 3, bgcolor: COLORS.cardBg, maxWidth: '100%' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: COLORS.textPrimary }}>Locked balance</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>{username}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={busy}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} /></Box>
        ) : loadError ? (
          <ErrorState label={loadError} onRetry={load} COLORS={COLORS} />
        ) : data && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: `${AMBER}12`, border: `1px solid ${AMBER}35` }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase' }}>Locked now</Typography>
                <PointsCell points={data.balance_locked} COLORS={COLORS} size="lg" color={AMBER} />
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: `${GREEN}12`, border: `1px solid ${GREEN}35` }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase' }}>Available (main)</Typography>
                <PointsCell points={data.balance_available} COLORS={COLORS} size="lg" color={GREEN} />
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, lineHeight: 1.5 }}>
              Unlocking moves points to the main balance so the user can withdraw them.
              If you did it by mistake, use <b>Undo</b> below. Undo works only while the user still has that amount available.
            </Typography>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>{success}</Alert>}
            {actionError && <Alert severity="error" onClose={() => setActionError('')} sx={{ borderRadius: 2 }}>{actionError}</Alert>}

            {/* Confirmation strip */}
            {confirm && (
              <Box sx={{ p: 1.75, borderRadius: 2.5, border: `1px solid ${COLORS.primary}`, bgcolor: `${COLORS.primary}10` }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.textPrimary, mb: 1.25 }}>{confirmText()}</Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" disabled={busy} onClick={() => setConfirm(null)} sx={{ textTransform: 'none', color: COLORS.textSecondary }}>Cancel</Button>
                  <Button size="small" variant="contained" disabled={busy} onClick={runConfirmed}
                    sx={{ textTransform: 'none', fontWeight: 700, bgcolor: COLORS.primary, borderRadius: 2 }}>
                    {busy ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Yes, confirm'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Locked items */}
            <Box>
              {sectionTitle('Locked items', 'Each big survey or commission that is being held back.')}
              {items.length === 0 ? (
                <EmptyState label="Nothing is locked right now" COLORS={COLORS} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                    {items.map((item) => row(
                      item.id,
                      <Checkbox size="small" checked={selected.has(item.id)} onChange={() => toggle(item.id)} disabled={busy} sx={{ p: 0.5 }} />,
                      describe(item, item.created_at),
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusPill label={item.type} color={item.type === 'referral' ? '#ec4899' : COLORS.primaryLight} />
                        <PointsCell points={item.amount} COLORS={COLORS} align="right" />
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={toggleAll}>
                      <Checkbox size="small" checked={allSelected} indeterminate={selected.size > 0 && !allSelected} sx={{ p: 0.5 }} />
                      <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary }}>Select all ({items.length})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="outlined" disabled={busy || selected.size === 0}
                        onClick={() => { setActionError(''); setConfirm({ kind: 'selected' }) }}
                        startIcon={<LockOpenOutlinedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderColor: COLORS.primary, color: COLORS.primary }}>
                        Unlock selected{selected.size > 0 ? ` (${formatPoints(selectedTotal)})` : ''}
                      </Button>
                      <Button size="small" variant="contained" disabled={busy}
                        onClick={() => { setActionError(''); setConfirm({ kind: 'all' }) }}
                        startIcon={<LockOpenOutlinedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: COLORS.primary }}>
                        Unlock all ({formatPoints(data.items_total)})
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              {Math.abs(data.unmatched_locked) >= 0.01 && (
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 1.25 }}>
                  Note: {formatPoints(data.unmatched_locked)} of the locked balance does not match any listed item
                  (older data or a manual change), so it cannot be unlocked from here.
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* Undo */}
            <Box>
              {sectionTitle('Recently unlocked — undo', 'Unlocked by mistake? Move it back to locked.')}
              {undoable.length === 0 ? (
                <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>No unlocks that can be undone.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, maxHeight: 240, overflowY: 'auto', pr: 0.5 }}>
                  {undoable.map((u) => row(
                    u.id,
                    null,
                    describe(u, u.created_at),
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PointsCell points={u.amount} COLORS={COLORS} align="right" />
                      <Button size="small" disabled={busy} startIcon={<UndoIcon sx={{ fontSize: '15px !important' }} />}
                        onClick={() => { setActionError(''); setConfirm({ kind: 'undo', item: u }) }}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 5, color: '#ef4444', bgcolor: '#ef444415', '&:hover': { bgcolor: '#ef444428' } }}>
                        Undo
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LockedBalanceDialog
