import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Typography, Skeleton, Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import adminAxiosInstance from '../../utils/adminAxiosInstance'
import {
  PaginationFooter, EmptyState, ErrorState, TableShell,
} from '../../components/Admin/AdminUiKit'
import TrafficSubNav from '../../components/Admin/TrafficSubNav'
import SurveyActivityStats from '../../components/Admin/surveyActivity/SurveyActivityStats'
import SurveyActivityFilters from '../../components/Admin/surveyActivity/SurveyActivityFilters'
import SurveyActivityTable from '../../components/Admin/surveyActivity/SurveyActivityTable'
import SurveyClickCard from '../../components/Admin/surveyActivity/SurveyClickCard'
import SurveyTimelineDrawer from '../../components/Admin/surveyActivity/SurveyTimelineDrawer'
import ReverseClickDialog from '../../components/Admin/surveyActivity/ReverseClickDialog'
import UndoReversalDialog from '../../components/Admin/surveyActivity/UndoReversalDialog'
import { getApiErrorMessage } from '../../components/Admin/surveyActivity/surveyActivityConstants'
import useSurveyActivity from '../../hooks/useSurveyActivity'

// Filters that can be pre-filled from the URL, e.g. /admin/survey-activity?user_id=42
const URL_FILTER_KEYS = ['transaction_id', 'external_transaction_id', 'user', 'user_id', 'status']

const AdminSurveyActivityPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [searchParams] = useSearchParams()
  const initialFilters = useMemo(() => {
    const fromUrl = {}
    URL_FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key)
      if (value) fromUrl[key] = value
    })
    return fromUrl
    // read once on mount — later URL changes should not fight the filter UI
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    filters, updateFilter, updateFilters, resetFilters,
    page, setPage, limit, changeLimit,
    rows, meta, stats, options,
    loading, error, refresh,
    live, setLive,
  } = useSurveyActivity(initialFilters)

  // Drawer + dialogs
  const [selectedClickId, setSelectedClickId] = useState(null)
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const [reverseTarget, setReverseTarget] = useState(null)
  const [undoTarget, setUndoTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const openDetails = useCallback((row) => setSelectedClickId(row.id), [])
  const openReverse = useCallback((row) => { setActionError(''); setReverseTarget(row) }, [])
  const openUndo = useCallback((row) => { setActionError(''); setUndoTarget(row) }, [])
  const closeDialogs = useCallback(() => {
    if (actionLoading) return
    setReverseTarget(null)
    setUndoTarget(null)
    setActionError('')
  }, [actionLoading])

  // Same refresh after either action: close dialog, reload list + open drawer, tell the admin
  const finishAction = (message) => {
    setReverseTarget(null)
    setUndoTarget(null)
    setToast({ open: true, message, severity: 'success' })
    setDetailRefreshKey((k) => k + 1)
    refresh({ silent: true })
  }

  const runAction = async (request, successMessage, failureMessage) => {
    setActionLoading(true)
    setActionError('')
    try {
      await request()
      finishAction(successMessage)
    } catch (err) {
      setActionError(getApiErrorMessage(err, failureMessage))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReverse = (reason) => runAction(
    () => adminAxiosInstance.post(`/admin/survey-activity/${reverseTarget.id}/reverse`, reason ? { reason } : {}),
    `Survey reversed for ${reverseTarget?.username}`,
    'Failed to reverse survey'
  )

  const handleUndo = () => runAction(
    () => adminAxiosInstance.post(`/admin/survey-activity/${undoTarget.id}/undo`),
    `Reversal undone for ${undoTarget?.username}`,
    'Failed to undo reversal'
  )

  const rowHandlers = { onReverse: openReverse, onUndo: openUndo, onDetails: openDetails }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <TrafficSubNav darkMode={darkMode} />

      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>
          Survey Activity
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
          One row per survey click. The status updates in place as postbacks arrive; open a row for every request behind it.
        </Typography>
      </Box>

      <SurveyActivityStats stats={stats} activeStatus={filters.status} onSelect={(status) => updateFilter('status', status)} COLORS={COLORS} />

      <SurveyActivityFilters
        filters={filters} updateFilter={updateFilter} updateFilters={updateFilters} resetFilters={resetFilters}
        options={options} live={live} setLive={setLive} onRefresh={refresh} refreshing={loading} COLORS={COLORS}
      />

      <TableShell COLORS={COLORS}>
        {error ? (
          <ErrorState label={error} onRetry={refresh} COLORS={COLORS} />
        ) : !loading && rows.length === 0 ? (
          <EmptyState label="No survey clicks match these filters" COLORS={COLORS} />
        ) : isMobile ? (
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {loading
              ? [...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={170} />)
              : rows.map((row) => <SurveyClickCard key={row.id} row={row} COLORS={COLORS} {...rowHandlers} />)}
          </Box>
        ) : (
          <SurveyActivityTable rows={rows} loading={loading} COLORS={COLORS} {...rowHandlers} />
        )}
        {!error && <PaginationFooter meta={meta} onPageChange={setPage} onLimitChange={changeLimit} COLORS={COLORS} />}
      </TableShell>

      <SurveyTimelineDrawer
        clickId={selectedClickId}
        onClose={() => setSelectedClickId(null)}
        onReverse={openReverse}
        onUndo={openUndo}
        refreshKey={detailRefreshKey}
        COLORS={COLORS}
      />

      <ReverseClickDialog row={reverseTarget} open={!!reverseTarget} onClose={closeDialogs}
        onConfirm={handleReverse} loading={actionLoading} error={actionError} COLORS={COLORS} />
      <UndoReversalDialog row={undoTarget} open={!!undoTarget} onClose={closeDialogs}
        onConfirm={handleUndo} loading={actionLoading} error={actionError} COLORS={COLORS} />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ borderRadius: 2.5 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </AdminPageWrapper>
  )
}

export default AdminSurveyActivityPage
