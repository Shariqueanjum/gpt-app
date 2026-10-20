import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Typography, Skeleton, Alert, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'
import { ErrorState } from '../../components/Admin/AdminUiKit'
import useRevenueData from '../../components/Admin/revenue/useRevenueData'
import RevenueControls from '../../components/Admin/revenue/RevenueControls'
import RevenueKpis from '../../components/Admin/revenue/RevenueKpis'
import ProfitFlow from '../../components/Admin/revenue/ProfitFlow'
import TrendSection from '../../components/Admin/revenue/TrendSection'
import ClientBreakdown from '../../components/Admin/revenue/ClientBreakdown'
import DilutionPanels from '../../components/Admin/revenue/DilutionPanels'
import CashPosition from '../../components/Admin/revenue/CashPosition'

const EMPTY_CONTROLS = { granularity: 'month', year: '', index: '', date_from: '', date_to: '', offer_wall_id: '' }

/**
 * Admin > Revenue & Profit.
 * Pick a month / quarter / year (or a custom range), optionally one client, and see
 * actual value, net revenue, every deduction, and the real net profit.
 */
const AdminRevenuePage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [controls, setControls] = useState(EMPTY_CONTROLS)
  const { meta, metaError, breakdown, trend, loading, trendLoading, error, trendError, refresh } = useRevenueData(controls)
  const topRef = useRef(null)

  // start on the current month once we know what "now" is
  useEffect(() => {
    if (meta && !controls.year) {
      setControls((c) => ({ ...c, year: meta.current.year, index: meta.current.month }))
    }
  }, [meta, controls.year])

  // clicking a bar / row in the trend section opens that period
  const handleSelectPeriod = useCallback(({ year, month, quarter }) => {
    setControls((c) => {
      const granularity = c.granularity === 'custom' ? 'month' : c.granularity
      return { ...c, granularity, year, index: granularity === 'quarter' ? quarter : month }
    })
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const selectedKey = breakdown?.period?.from
  const totals = breakdown?.totals
  const clientName = controls.offer_wall_id ? meta?.offer_walls.find((w) => String(w.id) === String(controls.offer_wall_id))?.name : null

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box ref={topRef} sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, scrollMarginTop: 80 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: COLORS.textPrimary }}>Revenue & Profit</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, maxWidth: 760 }}>
            What clients paid, what we kept, and what we really earned after reversals, referral commission, daily bonuses and level-up rewards.
            All amounts are in points, with the dollar value underneath (100 points = $1).
          </Typography>
        </Box>
        <Tooltip title="Reload numbers">
          <IconButton onClick={refresh} sx={{ color: COLORS.textSecondary, flexShrink: 0 }} aria-label="Reload"><RefreshIcon /></IconButton>
        </Tooltip>
      </Box>

      {metaError ? (
        <ErrorState label={metaError} onRetry={() => window.location.reload()} COLORS={COLORS} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
          <RevenueControls controls={controls} onChange={setControls} meta={meta} COLORS={COLORS} />

          {clientName && (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
              Showing <b>{clientName}</b> only. Daily bonuses, level-up rewards and cash figures belong to the whole platform, so profit below is <b>before bonuses</b>.
            </Alert>
          )}

          {error ? (
            <ErrorState label={error} onRetry={refresh} COLORS={COLORS} />
          ) : !totals ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={130} />)}
              </Box>
              <Skeleton variant="rounded" height={380} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: COLORS.textPrimary }}>
                {breakdown.period.label}
                <Box component="span" sx={{ color: COLORS.textMuted, fontWeight: 600 }}> · {clientName || 'All clients'}</Box>
              </Typography>

              <RevenueKpis totals={totals} previous={breakdown.previous} COLORS={COLORS} />

              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 5fr) minmax(0, 7fr)' }, alignItems: 'start' }}>
                <ProfitFlow totals={totals} COLORS={COLORS} />
                <TrendSection trend={trend} loading={trendLoading} error={trendError} onRetry={refresh}
                  granularity={controls.granularity === 'custom' ? 'month' : controls.granularity}
                  selectedKey={selectedKey} onSelectPeriod={handleSelectPeriod} COLORS={COLORS} />
              </Box>

              <ClientBreakdown rows={breakdown.by_client} totals={totals} COLORS={COLORS} />
              <DilutionPanels totals={totals} topReferrers={breakdown.top_referrers} COLORS={COLORS} />
              <CashPosition totals={totals} liability={breakdown.liability_now} COLORS={COLORS} />

              <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, pb: 2 }}>
                A reversal lowers the month of the original survey (completed in August, reversed in September: August goes down). So a past month can still change when a client reverses a survey later.
                Surveys still locked count as revenue because the client has already paid us.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </AdminPageWrapper>
  )
}

export default AdminRevenuePage
